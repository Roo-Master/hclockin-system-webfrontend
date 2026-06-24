import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    event: string;
    userId?: string;
    email?: string;
    tenantId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    try {
      await this.prisma.authAuditLog.create({
        data: {
          userId: data.userId,
          tenantId: data.tenantId,
          event: data.event,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadata: data.metadata || {},
          createdAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }
}
