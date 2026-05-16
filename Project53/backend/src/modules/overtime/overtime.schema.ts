import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OvertimeDocument = Overtime & Document;

export enum OvertimeType {
  WEEKDAY = 'weekday',
  WEEKEND = 'weekend',
  HOLIDAY = 'holiday',
}

export enum OvertimeStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Overtime {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: OvertimeType, required: true })
  type: OvertimeType;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ default: 0 })
  hours: number;

  @Prop()
  reason: string;

  @Prop({ type: String, enum: OvertimeStatus, default: OvertimeStatus.PENDING })
  status: OvertimeStatus;

  @Prop()
  approver: string;

  @Prop()
  approveNote: string;

  @Prop()
  approveTime: Date;
}

export const OvertimeSchema = SchemaFactory.createForClass(Overtime);
