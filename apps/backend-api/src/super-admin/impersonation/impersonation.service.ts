import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';

const IMPERSONATION_TTL_MINUTES = 15;

@Injectable()
export class ImpersonationService {
  private readonly logger = new Logger(ImpersonationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async start(superAdminId: string, tenantId: string, reason: string) {
    // Validate tenant exists
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException(`Tenant ${tenantId} not found`);

    const expiresAt = new Date(Date.now() + IMPERSONATION_TTL_MINUTES * 60 * 1000);

    // Create audit log entry
    const auditLog = await this.prisma.impersonationLog.create({
      data: {
        superAdminId,
        tenantId,
        reason,
        startedAt: new Date(),
        expiresAt,
        isActive: true,
      },
    });

    // Mint a short-lived JWT scoped to the tenant
    const sessionToken = this.jwtService.sign(
      {
        sub: superAdminId,
        tenantId,
        impersonationLogId: auditLog.id,
        role: 'SUPER_ADMIN',
        isImpersonating: true,
      },
      { expiresIn: `${IMPERSONATION_TTL_MINUTES}m` },
    );

    this.logger.log(
      `Super admin ${superAdminId} started impersonation of tenant ${tenantId}. LogId: ${auditLog.id}`,
    );

    return { sessionToken, expiresAt, logId: auditLog.id };
  }

  async end(superAdminId: string) {
    // Close the most recent active impersonation session for this admin
    const activeLog = await this.prisma.impersonationLog.findFirst({
      where: { superAdminId, isActive: true },
      orderBy: { startedAt: 'desc' },
    });

    if (!activeLog) {
      return { success: false, message: 'No active impersonation session found' };
    }

    await this.prisma.impersonationLog.update({
      where: { id: activeLog.id },
      data: { isActive: false, endedAt: new Date() },
    });

    this.logger.log(
      `Super admin ${superAdminId} ended impersonation session. LogId: ${activeLog.id}`,
    );

    return { success: true, logId: activeLog.id };
  }
}