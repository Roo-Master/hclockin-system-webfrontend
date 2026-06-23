import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  PlatformStats,
  MrrBreakdown,
  ActivityEvent,
} from '../interfaces/platform-stats.interfaces';

@Injectable()
export class PlatformStatsService {
  private readonly logger = new Logger(PlatformStatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPlatformStats(): Promise<PlatformStats> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalTenants,
      activeTenants,
      totalEmployees,
      totalClockInsToday,
      plans,
    ] = await this.prisma.$transaction([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { isActive: true } }),
      this.prisma.employee.count(),
      this.prisma.clockIn.count({
        where: { clockInTime: { gte: todayStart } },
      }),
      this.prisma.plan.findMany({
        include: { _count: { select: { tenants: true } } },
      }),
    ]);

    // Sum MRR across all plans
    const mrrKes = plans.reduce((sum, plan) => {
      return sum + plan.monthlyPriceKes * plan._count.tenants;
    }, 0);

    return {
      totalTenants,
      activeTenants,
      totalEmployees,
      totalClockInsToday,
      mrrKes,
    };
  }

  async getMrrBreakdown(): Promise<MrrBreakdown> {
    const plans = await this.prisma.plan.findMany({
      include: {
        _count: { select: { tenants: true } },
      },
      orderBy: { monthlyPriceKes: 'asc' },
    });

    const byTier = plans.map((plan) => ({
      tier: plan.tier,
      tenantCount: plan._count.tenants,
      monthlyRevenueKes: plan.monthlyPriceKes * plan._count.tenants,
    }));

    const total = byTier.reduce((sum, t) => sum + t.monthlyRevenueKes, 0);

    return { total, byTier };
  }

  async getRecentActivity(limit = 20): Promise<ActivityEvent[]> {
    const [recentClockIns, recentTenants, recentImpersonations] =
      await this.prisma.$transaction([
        // Recent clock-ins
        this.prisma.clockIn.findMany({
          take: limit,
          orderBy: { clockInTime: 'desc' },
          include: {
            employee: { select: { firstName: true, lastName: true } },
            tenant: { select: { id: true, name: true } },
          },
        }),

        // Recently onboarded tenants
        this.prisma.tenant.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, createdAt: true },
        }),

        // Recent impersonation sessions
        this.prisma.impersonationLog.findMany({
          take: limit,
          orderBy: { startedAt: 'desc' },
          include: {
            tenant: { select: { id: true, name: true } },
          },
        }),
      ]);

    const events: ActivityEvent[] = [
      

      ...recentTenants.map((t) => ({
        type: 'NEW_TENANT' as const,
        description: `New tenant onboarded: ${t.name}`,
        tenantId: t.id,
        tenantName: t.name,
        occurredAt: t.createdAt,
      })),

      ...recentImpersonations.map((i) => ({
        type: 'IMPERSONATION' as const,
        description: `Super admin impersonated tenant ${i.tenant.name}`,
        tenantId: i.tenant.id,
        tenantName: i.tenant.name,
        occurredAt: i.startedAt,
      })),
    ];

    // Merge and sort all events by most recent
    return events
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, limit);
  }
}