import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class UnassignEmployeesDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  employeeIds: string[];

  @ApiProperty({ example: '2026-06-30' })
  @IsDateString()
  effectiveTo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
