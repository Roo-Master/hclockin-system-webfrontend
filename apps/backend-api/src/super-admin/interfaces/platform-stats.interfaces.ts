export interface PlatformStats {
    totalTenants: number;
    activeTenants: number;
    totalEmployees: number;
    totalClockInsToday: number;
    mrrKes: number;
  }
  
  export interface MrrBreakdown {
    total: number;
    byTier: {
      tier: string;
      tenantCount: number;
      monthlyRevenueKes: number;
    }[];
  }
  
  export interface ActivityEvent {
    type: 'CLOCK_IN' | 'NEW_TENANT' | 'PLAN_CHANGE' | 'IMPERSONATION';
    description: string;
    tenantId: string;
    tenantName: string;
    occurredAt: Date;
  }