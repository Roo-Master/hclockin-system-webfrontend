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

    // Fix: Use user instead of employee, attendanceLog instead of clockIn
    const [
      totalTenants,
      activeTenants,
      totalEmployees,
      totalClockInsToday,
      plans,
    ] = await this.prisma.$transaction([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { isActive: true } }),
      this.prisma.user.count(), // ✅ Changed from employee to user
      this.prisma.attendanceLog.count({ // ✅ Changed from clockIn to attendanceLog
        where: { timestamp: { gte: todayStart } }, // ✅ Changed from clockInTime to timestamp
      }),
      this.prisma.plan.findMany({
        include: { _count: { select: { tenants: true } } },
      }),
    ]) as [number, number, number, number, any[]]; // ✅ Added type assertion

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
    // Fix: Use attendanceLog instead of clockIn
    const [recentClockIns, recentTenants, recentImpersonations] =
      await this.prisma.$transaction([
        // Recent clock-ins - ✅ Changed from clockIn to attendanceLog
        this.prisma.attendanceLog.findMany({
          take: limit,
          orderBy: { timestamp: 'desc' }, // ✅ Changed from clockInTime to timestamp
          include: {
            user: { // ✅ Changed from employee to user
              select: { 
                firstName: true, 
                lastName: true 
              } 
            },
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
      ]) as [any[], any[], any[]]; // ✅ Added type assertion

    const events: ActivityEvent[] = [
      // ✅ Added clock-in events
      ...recentClockIns.map((log) => ({
        type: 'CLOCK_IN' as const,
        description: `${log.user?.firstName || 'Unknown'} ${log.user?.lastName || ''} clocked in`,
        tenantId: log.tenant.id,
        tenantName: log.tenant.name,
        occurredAt: log.timestamp,
      })),

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