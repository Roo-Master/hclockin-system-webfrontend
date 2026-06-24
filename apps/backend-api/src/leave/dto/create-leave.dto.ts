import {
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
  } from 'class-validator';
  import { LeaveType } from '../enums/leave-type.enum.';
  
  export class CreateLeaveDto {
    @IsUUID()
    @IsOptional()
  
    @IsUUID()
    @IsNotEmpty()
    employeeId: string;
  
    @IsEnum(LeaveType)
    @IsNotEmpty()
    type: LeaveType;
  
    @IsDateString()
    @IsNotEmpty()
    startDate: string;
  
    @IsDateString()
    @IsNotEmpty()
    endDate: string;
  
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    reason: string;
  }