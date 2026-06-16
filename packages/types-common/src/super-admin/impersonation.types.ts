export interface ImpersonationSession {
  superAdminId: string;
  targetTenantId: string;
  targetTenantName: string;
  targetAdminEmail: string;
  sessionToken: string;
  startedAt: string;
  expiresAt: string;
}

export interface ImpersonationLog {
  id: string;
  superAdminId: string;
  tenantId: string;
  tenantName: string;
  startedAt: string;
  endedAt?: string;
  reason: string;
}
