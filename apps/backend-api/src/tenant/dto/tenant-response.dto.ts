import { Tenant } from '../entities/tenant.entity';
import { TenantPlan } from '../enums/tenant-plan.enum';
import { TenantStatus } from '../enums/tenant-status.enum';

export class TenantResponseDto {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  website?: string;
  plan: TenantPlan;
  status: TenantStatus;
  features: Record<string, any>;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(tenant: Tenant): TenantResponseDto {
    const dto = new TenantResponseDto();
    Object.assign(dto, tenant);
    return dto;
  }

  static fromEntities(tenants: Tenant[]): TenantResponseDto[] {
    return tenants.map(tenant => this.fromEntity(tenant));
  }
}