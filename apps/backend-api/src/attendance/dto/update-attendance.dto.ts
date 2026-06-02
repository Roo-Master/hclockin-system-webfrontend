import { IsOptional, IsString, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ATTENDANCE_STATUS, LEAVE_TYPE } from '../constants/attendance.constants';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsString()
  @IsEnum(ATTENDANCE_STATUS)
  status?: string;

  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @IsEnum(LEAVE_TYPE)
  leaveType?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  totalWorkHours?: number;

  @IsOptional()
  overtimeHours?: number;

  @IsOptional()
  lateMinutes?: number;

  @IsOptional()
  @IsUUID()
  approvedBy?: string;
}

export class BulkUpdateAttendanceDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  approvedBy?: string;
}