import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShiftScheduleType } from '@chronos/database';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateIf
} from 'class-validator';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateShiftDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ enum: ShiftScheduleType, default: ShiftScheduleType.FIXED })
  @IsOptional()
  @IsEnum(ShiftScheduleType)
  scheduleType?: ShiftScheduleType;

  @ApiProperty({ example: '08:00' })
  @Matches(timePattern, { message: 'startTime must use HH:mm 24-hour format.' })
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @Matches(timePattern, { message: 'endTime must use HH:mm 24-hour format.' })
  endTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  effectiveFrom: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(240)
  gracePeriodMinutes?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(240)
  earlyClockInMinutes?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(240)
  lateAfterMinutes?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(240)
  earlyClockOutMinutes?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(480)
  breakMinutes?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  overtimeAllowed?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @ValidateIf((dto) => dto.overtimeAllowed === true)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  overtimeAfterMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  rotationPattern?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
