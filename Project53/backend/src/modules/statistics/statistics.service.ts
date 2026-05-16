import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';
import * as ExcelJS from 'exceljs';
import { Attendance, AttendanceDocument, AttendanceStatus } from '../attendance/attendance.schema';
import { Leave, LeaveDocument, LeaveStatus } from '../leave/leave.schema';
import { Overtime, OvertimeDocument, OvertimeStatus } from '../overtime/overtime.schema';
import { Response } from 'express';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Leave.name) private leaveModel: Model<LeaveDocument>,
    @InjectModel(Overtime.name) private overtimeModel: Model<OvertimeDocument>,
  ) {}

  async getMonthlyStatistics(userId: string, year: number, month: number) {
    const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD');
    const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');

    const attendances = await this.attendanceModel
      .find({ userId, date: { $gte: startDate, $lte: endDate } })
      .exec();

    const leaves = await this.leaveModel
      .find({ userId, startDate: { $gte: startDate }, endDate: { $lte: endDate }, status: LeaveStatus.APPROVED })
      .exec();

    const overtimes = await this.overtimeModel
      .find({ userId, date: { $gte: startDate, $lte: endDate }, status: OvertimeStatus.APPROVED })
      .exec();

    const statistics = {
      totalDays: attendances.length,
      normalDays: attendances.filter(a => a.status === AttendanceStatus.NORMAL).length,
      lateDays: attendances.filter(a => a.status === AttendanceStatus.LATE).length,
      earlyLeaveDays: attendances.filter(a => a.status === AttendanceStatus.EARLY_LEAVE).length,
      absentDays: attendances.filter(a => a.status === AttendanceStatus.ABSENT).length,
      totalWorkHours: attendances.reduce((sum, a) => sum + (a.workHours || 0), 0),
      leaveDays: leaves.reduce((sum, l) => sum + l.days, 0),
      overtimeHours: overtimes.reduce((sum, o) => sum + o.hours, 0),
      attendances,
      leaves,
      overtimes,
    };

    return statistics;
  }

  async getExceptionAttendances(startDate?: string, endDate?: string) {
    const filter: any = { hasException: true };
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }
    return this.attendanceModel.find(filter).populate('userId').sort({ date: -1 }).exec();
  }

  async exportMonthlyReport(userId: string, year: number, month: number, res: Response) {
    const statistics = await this.getMonthlyStatistics(userId, year, month);
    const user = await this.attendanceModel.findOne({ userId }).populate('userId').exec();
    const userName = user?.userId?.name || '员工';

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${year}年${month}月考勤报表`);

    worksheet.columns = [
      { header: '日期', key: 'date', width: 15 },
      { header: '签到时间', key: 'checkIn', width: 15 },
      { header: '签退时间', key: 'checkOut', width: 15 },
      { header: '工作时长', key: 'workHours', width: 12 },
      { header: '状态', key: 'status', width: 12 },
      { header: '备注', key: 'remark', width: 20 },
    ];

    const statusMap = {
      [AttendanceStatus.NORMAL]: '正常',
      [AttendanceStatus.LATE]: '迟到',
      [AttendanceStatus.EARLY_LEAVE]: '早退',
      [AttendanceStatus.ABSENT]: '缺勤',
      [AttendanceStatus.HALF_DAY]: '半天',
    };

    statistics.attendances.forEach((attendance: any) => {
      worksheet.addRow({
        date: attendance.date,
        checkIn: attendance.checkInTime ? dayjs(attendance.checkInTime).format('HH:mm:ss') : '-',
        checkOut: attendance.checkOutTime ? dayjs(attendance.checkOutTime).format('HH:mm:ss') : '-',
        workHours: attendance.workHours || 0,
        status: statusMap[attendance.status] || attendance.status,
        remark: attendance.hasException ? '异常考勤' : '',
      });
    });

    worksheet.addRow([]);
    worksheet.addRow(['统计汇总']);
    worksheet.addRow(['总天数', statistics.totalDays]);
    worksheet.addRow(['正常出勤', statistics.normalDays]);
    worksheet.addRow(['迟到天数', statistics.lateDays]);
    worksheet.addRow(['早退天数', statistics.earlyLeaveDays]);
    worksheet.addRow(['缺勤天数', statistics.absentDays]);
    worksheet.addRow(['总工作时长(小时)', statistics.totalWorkHours.toFixed(2)]);
    worksheet.addRow(['请假天数', statistics.leaveDays]);
    worksheet.addRow(['加班时长(小时)', statistics.overtimeHours.toFixed(2)]);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(userName)}_${year}_${month}_考勤报表.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
