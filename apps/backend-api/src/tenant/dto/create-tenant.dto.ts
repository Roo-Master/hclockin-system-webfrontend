import { IsString, IsEmail, IsOptional, IsEnum, IsObject, IsUrl } from 'class-validator';
import { TenantPlan } from '../enums/tenant-plan.enum';
import { TenantStatus } from '../enums/tenant-status.enum';

export class CreateTenantDto {
  @IsString()
  name: string;

  @IsString()
  subdomain: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsEnum(TenantPlan)
  plan?: TenantPlan;

  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @IsOptional()
  @IsObject()
  features?: Record<string, any>;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}