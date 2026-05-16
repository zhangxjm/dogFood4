import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as dayjs from 'dayjs';
import { Leave, LeaveDocument, LeaveStatus } from './leave.schema';
import { CreateLeaveDto, ApproveLeaveDto, LeaveQueryDto } from './leave.dto';

@Injectable()
export class LeaveService {
  constructor(@InjectModel(Leave.name) private leaveModel: Model<LeaveDocument>) {}

  private calculateDays(startDate: string, endDate: string): number {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.diff(start, 'day') + 1;
  }

  async create(createLeaveDto: CreateLeaveDto): Promise<Leave> {
    const { userId, startDate, endDate, ...rest } = createLeaveDto;
    const days = this.calculateDays(startDate, endDate);

    if (days < 1) {
      throw new BadRequestException('End date must be after start date');
    }

    const leave = new this.leaveModel({
      userId: new Types.ObjectId(userId),
      startDate,
      endDate,
      days,
      ...rest,
    });
    return leave.save();
  }

  async findAll(query: LeaveQueryDto): Promise<Leave[]> {
    const filter: any = {};
    if (query.userId) {
      filter.userId = new Types.ObjectId(query.userId);
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.startDate && query.endDate) {
      filter.startDate = { $gte: query.startDate };
      filter.endDate = { $lte: query.endDate };
    }
    return this.leaveModel.find(filter).populate('userId').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Leave> {
    const leave = await this.leaveModel.findById(id).populate('userId').exec();
    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }
    return leave;
  }

  async approve(id: string, approveLeaveDto: ApproveLeaveDto): Promise<Leave> {
    const leave = await this.leaveModel.findById(id).exec();
    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }
    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('This leave request has already been processed');
    }
    leave.status = approveLeaveDto.status;
    leave.approver = approveLeaveDto.approver;
    leave.approveNote = approveLeaveDto.approveNote;
    leave.approveTime = new Date();
    return leave.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.leaveModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Leave request not found');
    }
  }
}
