import { ApiPropertyOptional } from '@nestjs/swagger';
import { ShiftScheduleType } from '@chronos/database';
import { IsBooleanString, IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryShiftsDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ enum: ShiftScheduleType })
  @IsOptional()
  @IsEnum(ShiftScheduleType)
  scheduleType?: ShiftScheduleType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveOn?: string;
}
