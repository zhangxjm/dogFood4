import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as dayjs from 'dayjs';
import { Attendance, AttendanceDocument, AttendanceStatus } from './attendance.schema';
import { CheckInDto, CheckOutDto, UpdateAttendanceDto, AttendanceQueryDto } from './attendance.dto';

const WORK_START_TIME = '09:00';
const WORK_END_TIME = '18:00';
const LATE_THRESHOLD_MINUTES = 30;
const EARLY_LEAVE_THRESHOLD_MINUTES = 30;

@Injectable()
export class AttendanceService {
  constructor(@InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>) {}

  private parseTime(timeStr: string): { hour: number; minute: number } {
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour, minute };
  }

  private isLate(checkInTime: Date): boolean {
    const now = dayjs(checkInTime);
    const { hour, minute } = this.parseTime(WORK_START_TIME);
    const workStart = now.hour(hour).minute(minute).second(0);
    return now.isAfter(workStart.add(LATE_THRESHOLD_MINUTES, 'minute'));
  }

  private isEarlyLeave(checkOutTime: Date): boolean {
    const now = dayjs(checkOutTime);
    const { hour, minute } = this.parseTime(WORK_END_TIME);
    const workEnd = now.hour(hour).minute(minute).second(0);
    return now.isBefore(workEnd.subtract(EARLY_LEAVE_THRESHOLD_MINUTES, 'minute'));
  }

  private calculateWorkHours(checkInTime: Date, checkOutTime: Date): number {
    const start = dayjs(checkInTime);
    const end = dayjs(checkOutTime);
    const hours = end.diff(start, 'hour', true);
    return Math.round(hours * 100) / 100;
  }

  private calculateStatus(attendance: AttendanceDocument): AttendanceStatus {
    let status = AttendanceStatus.NORMAL;
    if (!attendance.checkInTime) {
      return AttendanceStatus.ABSENT;
    }
    if (attendance.checkInTime && this.isLate(attendance.checkInTime)) {
      status = AttendanceStatus.LATE;
    }
    if (attendance.checkOutTime && this.isEarlyLeave(attendance.checkOutTime)) {
      status = attendance.checkInTime && this.isLate(attendance.checkInTime)
        ? AttendanceStatus.ABSENT
        : AttendanceStatus.EARLY_LEAVE;
    }
    return status;
  }

  async checkIn(checkInDto: CheckInDto): Promise<Attendance> {
    const { userId, time } = checkInDto;
    const now = time || new Date();
    const dateStr = dayjs(now).format('YYYY-MM-DD');

    const existingAttendance = await this.attendanceModel.findOne({
      userId: new Types.ObjectId(userId),
      date: dateStr,
    });

    if (existingAttendance && existingAttendance.checkInTime) {
      throw new BadRequestException('Already checked in today');
    }

    const checkInStatus = this.isLate(now) ? 'late' : 'on_time';

    if (existingAttendance) {
      existingAttendance.checkInTime = now;
      existingAttendance.checkInStatus = checkInStatus;
      existingAttendance.hasException = checkInStatus === 'late';
      existingAttendance.status = this.calculateStatus(existingAttendance);
      return existingAttendance.save();
    } else {
      const attendance = new this.attendanceModel({
        userId: new Types.ObjectId(userId),
        date: dateStr,
        checkInTime: now,
        checkInStatus,
        hasException: checkInStatus === 'late',
      });
      attendance.status = this.calculateStatus(attendance);
      return attendance.save();
    }
  }

  async checkOut(checkOutDto: CheckOutDto): Promise<Attendance> {
    const { userId, time } = checkOutDto;
    const now = time || new Date();
    const dateStr = dayjs(now).format('YYYY-MM-DD');

    const attendance = await this.attendanceModel.findOne({
      userId: new Types.ObjectId(userId),
      date: dateStr,
    });

    if (!attendance) {
      throw new BadRequestException('No check-in record found for today');
    }

    if (attendance.checkOutTime) {
      throw new BadRequestException('Already checked out today');
    }

    const checkOutStatus = this.isEarlyLeave(now) ? 'early' : 'on_time';

    attendance.checkOutTime = now;
    attendance.checkOutStatus = checkOutStatus;
    attendance.workHours = this.calculateWorkHours(attendance.checkInTime, now);
    attendance.hasException = attendance.hasException || checkOutStatus === 'early';
    attendance.status = this.calculateStatus(attendance);

    return attendance.save();
  }

  async findAll(query: AttendanceQueryDto): Promise<Attendance[]> {
    const filter: any = {};
    if (query.userId) {
      filter.userId = new Types.ObjectId(query.userId);
    }
    if (query.startDate && query.endDate) {
      filter.date = { $gte: query.startDate, $lte: query.endDate };
    }
    if (query.status) {
      filter.status = query.status;
    }
    return this.attendanceModel.find(filter).populate('userId').sort({ date: -1 }).exec();
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceModel.findById(id).populate('userId').exec();
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }
    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.attendanceModel
      .findByIdAndUpdate(id, updateAttendanceDto, { new: true })
      .exec();
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }
    return attendance;
  }

  async getTodayAttendance(userId: string): Promise<Attendance> {
    const dateStr = dayjs().format('YYYY-MM-DD');
    return this.attendanceModel
      .findOne({ userId: new Types.ObjectId(userId), date: dateStr })
      .exec();
  }

  async getMonthlyAttendance(userId: string, year: number, month: number): Promise<Attendance[]> {
    const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD');
    const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');
    return this.attendanceModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: 1 })
      .exec();
  }
}
