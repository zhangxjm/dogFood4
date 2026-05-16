import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveDocument = Leave & Document;

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  MARRIAGE = 'marriage',
  MATERNITY = 'maternity',
  OTHER = 'other',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Leave {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: LeaveType, required: true })
  type: LeaveType;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  @Prop({ default: 0 })
  days: number;

  @Prop()
  reason: string;

  @Prop({ type: String, enum: LeaveStatus, default: LeaveStatus.PENDING })
  status: LeaveStatus;

  @Prop()
  approver: string;

  @Prop()
  approveNote: string;

  @Prop()
  approveTime: Date;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);
