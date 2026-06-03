import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
} from "class-validator";

export class RegisterDto {
  @IsString()
  tenantId: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsString()
  payrollNumber: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  devicePin: string;
}