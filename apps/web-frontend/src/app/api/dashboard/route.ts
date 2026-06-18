// src/app/api/super-admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalTenants,
      activeTenants,
      suspendedTenants,
      trialTenants,
      totalStaff,
      totalClockInsToday,
      newTenantsThisMonth,
      mrrSum,
      tenantRows,
      mrrSeriesRows,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.tenant.count({ where: { status: 'SUSPENDED' } }),
      prisma.tenant.count({ where: { status: 'TRIAL' } }),
      prisma.user.count(),
      prisma.attendanceLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.tenant.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.subscription.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { amountCents: true },
      }),
      prisma.tenant.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          plan: true,
          adminEmail: true,
          createdAt: true,
        },
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: 'asc' },
        take: 8,
        select: {
          createdAt: true,
          amountCents: true,
        },
      }),
    ]);

    const tenants = tenantRows.map((t) => ({
      ...t,
      staffCount: 0,
      mrr: 0,
      trialEndsAt: null,
      createdAt: t.createdAt.toISOString(),
    }));

    const mrrSeries = mrrSeriesRows.map((r, i) => ({
      month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(r.createdAt),
      mrr: r.amountCents / 100,
      arr: (r.amountCents / 100) * 12,
      index: i,
    }));

    return NextResponse.json({
      stats: {
        totalTenants,
        activeTenants,
        suspendedTenants,
        trialTenants,
        totalStaff,
        totalClockInsToday,
        mrr: (mrrSum._sum.amountCents ?? 0) / 100,
        arr: ((mrrSum._sum.amountCents ?? 0) / 100) * 12,
        churnRate: 0,
        newTenantsThisMonth,
      },
      mrrSeries,
      tenantStatusBreakdown: [
        { name: 'Active', value: activeTenants, color: '#10b981' },
        { name: 'Trial', value: trialTenants, color: '#f59e0b' },
        { name: 'Suspended', value: suspendedTenants, color: '#f43f5e' },
      ],
      tenants,
    });
  } catch {
    return NextResponse.json({
      stats: {
        totalTenants: 0,
        activeTenants: 0,
        suspendedTenants: 0,
        trialTenants: 0,
        totalStaff: 0,
        totalClockInsToday: 0,
        mrr: 0,
        arr: 0,
        churnRate: 0,
        newTenantsThisMonth: 0,
      },
      mrrSeries: [],
      tenantStatusBreakdown: [],
      tenants: [],
    });
  }
}