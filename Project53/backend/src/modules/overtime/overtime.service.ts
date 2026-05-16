import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as dayjs from 'dayjs';
import { Overtime, OvertimeDocument, OvertimeStatus } from './overtime.schema';
import { CreateOvertimeDto, ApproveOvertimeDto, OvertimeQueryDto } from './overtime.dto';

@Injectable()
export class OvertimeService {
  constructor(@InjectModel(Overtime.name) private overtimeModel: Model<OvertimeDocument>) {}

  private calculateHours(startTime: string, endTime: string): number {
    const start = dayjs(`2000-01-01 ${startTime}`);
    const end = dayjs(`2000-01-01 ${endTime}`);
    const hours = end.diff(start, 'hour', true);
    return Math.round(hours * 100) / 100;
  }

  async create(createOvertimeDto: CreateOvertimeDto): Promise<Overtime> {
    const { userId, startTime, endTime, ...rest } = createOvertimeDto;
    const hours = this.calculateHours(startTime, endTime);

    if (hours <= 0) {
      throw new BadRequestException('End time must be after start time');
    }

    const overtime = new this.overtimeModel({
      userId: new Types.ObjectId(userId),
      startTime,
      endTime,
      hours,
      ...rest,
    });
    return overtime.save();
  }

  async findAll(query: OvertimeQueryDto): Promise<Overtime[]> {
    const filter: any = {};
    if (query.userId) {
      filter.userId = new Types.ObjectId(query.userId);
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.startDate && query.endDate) {
      filter.date = { $gte: query.startDate, $lte: query.endDate };
    }
    return this.overtimeModel.find(filter).populate('userId').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Overtime> {
    const overtime = await this.overtimeModel.findById(id).populate('userId').exec();
    if (!overtime) {
      throw new NotFoundException('Overtime record not found');
    }
    return overtime;
  }

  async approve(id: string, approveOvertimeDto: ApproveOvertimeDto): Promise<Overtime> {
    const overtime = await this.overtimeModel.findById(id).exec();
    if (!overtime) {
      throw new NotFoundException('Overtime record not found');
    }
    if (overtime.status !== OvertimeStatus.PENDING) {
      throw new BadRequestException('This overtime record has already been processed');
    }
    overtime.status = approveOvertimeDto.status;
    overtime.approver = approveOvertimeDto.approver;
    overtime.approveNote = approveOvertimeDto.approveNote;
    overtime.approveTime = new Date();
    return overtime.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.overtimeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Overtime record not found');
    }
  }
}
