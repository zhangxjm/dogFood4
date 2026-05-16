import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { OvertimeType, OvertimeStatus } from './overtime.schema';

export class CreateOvertimeDto {
  @IsString()
  userId: string;

  @IsEnum(OvertimeType)
  type: OvertimeType;

  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ApproveOvertimeDto {
  @IsString()
  approver: string;

  @IsEnum(OvertimeStatus)
  status: OvertimeStatus.APPROVED | OvertimeStatus.REJECTED;

  @IsOptional()
  @IsString()
  approveNote?: string;
}

export class OvertimeQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(OvertimeStatus)
  status?: OvertimeStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
