import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignEmployeesDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  employeeIds: string[];

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  effectiveFrom: string;

  @ApiPropertyOptional({ example: 'Ward rotation update' })
  @IsOptional()
  @IsString()
  reason?: string;
}
