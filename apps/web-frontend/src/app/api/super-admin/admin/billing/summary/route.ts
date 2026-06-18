import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = {
      kpis: {
        mrr: 48600,
        arr: 583200,
        payingTenants: 12,
        overdueAmount: 8400,
        overdueAccounts: 3,
        trialTenants: 2,
      },
      mrrTrend: [
        { month: 'Jan', mrr: 32000, newRevenue: 4500, churn: 1200 },
        { month: 'Feb', mrr: 33800, newRevenue: 5200, churn: 800 },
        { month: 'Mar', mrr: 35200, newRevenue: 3800, churn: 600 },
        { month: 'Apr', mrr: 36800, newRevenue: 4800, churn: 1000 },
        { month: 'May', mrr: 39200, newRevenue: 6200, churn: 900 },
        { month: 'Jun', mrr: 41500, newRevenue: 5500, churn: 700 },
        { month: 'Jul', mrr: 43800, newRevenue: 4800, churn: 1100 },
        { month: 'Aug', mrr: 45600, newRevenue: 5100, churn: 800 },
        { month: 'Sep', mrr: 47200, newRevenue: 4600, churn: 900 },
        { month: 'Oct', mrr: 48900, newRevenue: 5900, churn: 1000 },
        { month: 'Nov', mrr: 50200, newRevenue: 5200, churn: 700 },
        { month: 'Dec', mrr: 48600, newRevenue: 4800, churn: 1600 },
      ],
      planRevenue: [
        { plan: 'Starter', tenants: 8, mrr: 3200, color: '#6B7280' },
        { plan: 'Professional', tenants: 9, mrr: 10800, color: '#2563EB' },
        { plan: 'Enterprise', tenants: 5, mrr: 12000, color: '#EA580C' },
      ],
      overdueAccounts: [
        {
          id: 'oa-1',
          name: 'Nairobi Hospital',
          amount: 4800,
          daysOverdue: 15,
          email: 'billing@nairobi-hospital.co.ke',
          invoiceId: 'INV-2024-0123',
        },
        {
          id: 'oa-2',
          name: 'Mater Hospital',
          amount: 2400,
          daysOverdue: 8,
          email: 'finance@materhospital.org',
          invoiceId: 'INV-2024-0125',
        },
        {
          id: 'oa-3',
          name: 'Coast General Hospital',
          amount: 1200,
          daysOverdue: 5,
          email: 'accounts@cgh.co.ke',
          invoiceId: 'INV-2024-0127',
        },
      ],
      recentTransactions: [
        {
          id: 'tx-1',
          tenant: 'Kenyatta National Hospital',
          amount: 12000,
          date: '2024-12-15',
          status: 'paid',
          invoice: 'INV-2024-0128',
        },
        {
          id: 'tx-2',
          tenant: 'Aga Khan University Hospital',
          amount: 24000,
          date: '2024-12-14',
          status: 'paid',
          invoice: 'INV-2024-0126',
        },
        {
          id: 'tx-3',
          tenant: 'Nairobi Hospital',
          amount: 4800,
          date: '2024-12-01',
          status: 'overdue',
          invoice: 'INV-2024-0123',
        },
        {
          id: 'tx-4',
          tenant: 'Mater Hospital',
          amount: 2400,
          date: '2024-11-28',
          status: 'overdue',
          invoice: 'INV-2024-0118',
        },
        {
          id: 'tx-5',
          tenant: 'St. Mary\'s Hospital',
          amount: 400,
          date: '2024-11-25',
          status: 'paid',
          invoice: 'INV-2024-0115',
        },
        {
          id: 'tx-6',
          tenant: 'Lions Hospital',
          amount: 400,
          date: '2024-11-22',
          status: 'failed',
          invoice: 'INV-2024-0112',
        },
      ],
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Billing summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
