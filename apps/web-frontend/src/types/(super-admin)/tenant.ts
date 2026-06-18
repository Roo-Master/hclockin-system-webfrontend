import { BaseEntity } from './common';

/**
 * Tenant status
 */
export type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED' | 'PENDING';

/**
 * Plan tiers
 */
export type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM';

/**
 * Billing cycles
 */
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

/**
 * Tenant interface
 */
export interface Tenant extends BaseEntity {
  name: string;
  slug: string;
  subdomain: string;
  status: TenantStatus;
  plan: PlanTier;
  staffCount: number;
  adminEmail: string;
  mrr: number;
  country: string;
  lastActive: string;
  contactName: string | null;
  notes: string | null;
  trialEndsAt: string | null;
  billingCycle: BillingCycle;
  licenseKey: string;
  settings: TenantSettings;
  features: TenantFeatures;
  stats: TenantStats;
}

/**
 * Tenant settings
 */
export interface TenantSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  currency: string;
  workingDays: number[];
  workingHours: {
    start: string;
    end: string;
  };
  attendance: {
    geofenceEnabled: boolean;
    geofenceRadius: number;
    lateGracePeriod: number;
    earlyGracePeriod: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
  };
}

/**
 * Tenant features
 */
export interface TenantFeatures {
  maxUsers: number;
  maxAdmins: number;
  maxDepartments: number;
  maxLocations: number;
  analytics: boolean;
  reports: boolean;
  apiAccess: boolean;
  ssoEnabled: boolean;
  customBranding: boolean;
  advancedSecurity: boolean;
}

/**
 * Tenant stats
 */
export interface TenantStats {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  locations: number;
  dailyAttendance: {
    present: number;
    absent: number;
    leave: number;
    late: number;
  };
  monthlyRevenue: number;
  yearlyRevenue: number;
}

/**
 * Create tenant data
 */
export interface CreateTenantData {
  name: string;
  slug: string;
  subdomain: string;
  adminEmail: string;
  contactName: string;
  plan: PlanTier;
  country: string;
  licenseKey: string;
  billingCycle: BillingCycle;
  trialDays?: number;
}

/**
 * Update tenant data
 */
export interface UpdateTenantData {
  name?: string;
  slug?: string;
  subdomain?: string;
  status?: TenantStatus;
  plan?: PlanTier;
  country?: string;
  contactName?: string;
  notes?: string;
  settings?: Partial<TenantSettings>;
  features?: Partial<TenantFeatures>;
}

/**
 * Tenant filters
 */
export interface TenantFilters {
  search?: string;
  status?: TenantStatus | 'ALL';
  plan?: PlanTier | 'ALL';
  country?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Tenant revenue
 */
export interface TenantRevenue {
  tenantId: string;
  tenantName: string;
  mrr: number;
  arr: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
}

/**
 * Tenant activity
 */
export interface TenantActivity {
  id: string;
  tenantId: string;
  action: string;
  details: Record<string, any>;
  userId: string;
  userName: string;
  timestamp: string;
}
