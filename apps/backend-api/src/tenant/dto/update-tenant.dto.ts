import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantDto } from './create-tenant.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  suspendReason?: string;
}