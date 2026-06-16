import { Injectable } from '@nestjs/common';

@Injectable()
export class ImpersonationService {
  async start(superAdminId: string, tenantId: string, reason: string) {
    // TODO: create time-limited JWT scoped to tenant
    // TODO: log impersonation session to audit table
    return { sessionToken: 'TODO', expiresAt: new Date() };
  }

  async end(superAdminId: string) {
    // TODO: invalidate impersonation token, close audit log entry
    return { success: true };
  }
}
