import { TenantPlan } from '../enums/tenant-plan.enum';
import { TenantStatus } from '../enums/tenant-status.enum';

export interface ITenant {
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
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ITenantFeature {
  id: string;
  tenantId: string;
  featureKey: string;
  featureValue: any;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITenantMember {
  id: string;
  tenantId: string;
  userId: string;
  role: string;
  permissions: string[];
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}