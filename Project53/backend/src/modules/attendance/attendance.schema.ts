import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

export enum AttendanceStatus {
  NORMAL = 'normal',
  LATE = 'late',
  EARLY_LEAVE = 'early_leave',
  ABSENT = 'absent',
  HALF_DAY = 'half_day',
}

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: string;

  @Prop()
  checkInTime: Date;

  @Prop()
  checkOutTime: Date;

  @Prop({ default: 0 })
  workHours: number;

  @Prop({ type: String, enum: AttendanceStatus, default: AttendanceStatus.NORMAL })
  status: AttendanceStatus;

  @Prop()
  checkInStatus: string;

  @Prop()
  checkOutStatus: string;

  @Prop({ default: false })
  hasException: boolean;

  @Prop()
  exceptionNote: string;

  @Prop({ default: false })
  isProcessed: boolean;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
