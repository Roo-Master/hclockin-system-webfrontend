import { ITenant } from './tenant.interface';

export interface ITenantContext {
  tenant: ITenant;
  tenantId: string;
  features: Record<string, any>;
  settings: Record<string, any>;
}

export interface ITenantRequest {
  tenantId?: string;
  tenant?: ITenant;
}