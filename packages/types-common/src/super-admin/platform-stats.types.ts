export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  trialTenants: number;
  totalStaff: number;
  totalClockInsToday: number;
  mrr: number;
  arr: number;
  churnRate: number;
  newTenantsThisMonth: number;
}

export interface TenantActivity {
  tenantId: string;
  tenantName: string;
  lastActivityAt: string;
  clockInsToday: number;
  activeStaff: number;
}
