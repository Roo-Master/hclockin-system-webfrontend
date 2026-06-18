// app/api/admin/billing/summary/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [mrrSum, payingTenants, trialTenants, overdueAgg, plans, overdueAccounts, recentTransactions] =
    await Promise.all([
      prisma.subscription.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { amountCents: true },
      }),
      prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.subscription.count({
        where: { status: 'TRIALING' },
      }),
      prisma.invoice.aggregate({
        where: { status: 'OPEN', dueDate: { lt: new Date() } },
        _sum: { totalCents: true },
      }),
      prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            select: { id: true },
          },
        },
      }),
      prisma.invoice.findMany({
        where: { status: 'OPEN', dueDate: { lt: new Date() } },
        orderBy: { dueDate: 'asc' },
        take: 10,
        include: {
          tenant: { select: { id: true, name: true, adminEmail: true } },
        },
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          invoice: {
            select: { invoiceNumber: true },
          },
          tenant: {
            select: { name: true },
          },
        },
      }),
    ]);

  const mrr = (mrrSum._sum.amountCents ?? 0) / 100;
  const arr = mrr * 12;
  const overdueAmount = (overdueAgg._sum.totalCents ?? 0) / 100;

  const planRevenue = plans.map((plan) => {
    const tenants = plan.subscriptions.length;
    const mrr = tenants * (plan.priceCents / 100);
    return {
      plan: plan.name,
      tenants,
      mrr,
      color: plan.code === 'STARTER' ? '#6b7280' : plan.code === 'PROFESSIONAL' ? '#3b82f6' : '#8b5cf6',
    };
  });

  const mrrTrend = [
    { month: 'Jan', mrr: 4200, newRevenue: 1200, churn: 0 },
    { month: 'Feb', mrr: 6800, newRevenue: 3000, churn: 400 },
    { month: 'Mar', mrr: 8100, newRevenue: 1700, churn: 400 },
    { month: 'Apr', mrr: 9400, newRevenue: 1700, churn: 400 },
    { month: 'May', mrr: 12200, newRevenue: 3200, churn: 400 },
    { month: 'Jun', mrr: 15100, newRevenue: 3300, churn: 400 },
    { month: 'Jul', mrr: 16400, newRevenue: 1700, churn: 400 },
    { month: 'Aug', mrr: 18400, newRevenue: 2400, churn: 400 },
  ];

  return NextResponse.json({
    kpis: {
      mrr,
      arr,
      payingTenants,
      overdueAmount,
      overdueAccounts: overdueAccounts.length,
      trialTenants,
    },
    mrrTrend,
    planRevenue,
    overdueAccounts: overdueAccounts.map((i) => ({
      id: i.id,
      name: i.tenant.name,
      amount: i.totalCents / 100,
      daysOverdue: Math.max(1, Math.ceil((Date.now() - new Date(i.dueDate ?? new Date()).getTime()) / 86400000)),
      email: i.tenant.adminEmail,
      invoiceId: i.id,
    })),
    recentTransactions: recentTransactions.map((p) => ({
      id: p.id,
      tenant: p.tenant.name,
      amount: p.amountCents / 100,
      date: p.createdAt.toISOString().slice(0, 10),
      status: p.status.toLowerCase(),
      invoice: p.invoice.invoiceNumber,
    })),
  });
}