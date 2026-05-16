import { IsString, IsOptional, IsDate, IsEnum, IsBoolean } from 'class-validator';
import { AttendanceStatus } from './attendance.schema';

export class CheckInDto {
  @IsString()
  userId: string;

  @IsDate()
  @IsOptional()
  time?: Date;
}

export class CheckOutDto {
  @IsString()
  userId: string;

  @IsDate()
  @IsOptional()
  time?: Date;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDate()
  checkInTime?: Date;

  @IsOptional()
  @IsDate()
  checkOutTime?: Date;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsBoolean()
  hasException?: boolean;

  @IsOptional()
  @IsString()
  exceptionNote?: string;

  @IsOptional()
  @IsBoolean()
  isProcessed?: boolean;
}

export class AttendanceQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}
