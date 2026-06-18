export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED';
export type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  plan: PlanTier;
  billingCycle: BillingCycle;
  staffCount: number;
  adminEmail: string;
  createdAt: string;
  trialEndsAt?: string;
  suspendedAt?: string;
  suspendReason?: string;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  adminEmail: string;
  adminName: string;
  plan: PlanTier;
  billingCycle: BillingCycle;
  trialDays?: number;
}

export interface UpdateTenantDto {
  name?: string;
  status?: TenantStatus;
  plan?: PlanTier;
  billingCycle?: BillingCycle;
  suspendReason?: string;
}
