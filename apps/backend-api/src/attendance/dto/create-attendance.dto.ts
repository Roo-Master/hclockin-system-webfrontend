import { IsNotEmpty, IsOptional, IsString, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ATTENDANCE_TYPE } from '../constants/attendance.constants';

export class CreateAttendanceDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(ATTENDANCE_TYPE)
  @IsNotEmpty()
  type: string;

  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;
}