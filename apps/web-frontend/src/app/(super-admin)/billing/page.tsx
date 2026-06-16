'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

type BillingKpi = {
  mrr: number;
  arr: number;
  payingTenants: number;
  overdueAmount: number;
  overdueAccounts: number;
  trialTenants: number;
};

type RevenuePoint = {
  month: string;
  mrr: number;
  newRevenue: number;
  churn: number;
};

type PlanRevenuePoint = {
  plan: string;
  tenants: number;
  mrr: number;
  color: string;
};

type OverdueAccount = {
  id: string;
  name: string;
  amount: number;
  daysOverdue: number;
  email: string;
  invoiceId: string;
};

type Transaction = {
  id: string;
  tenant: string;
  amount: number;
  date: string;
  status: 'paid' | 'overdue' | 'pending' | 'failed';
  invoice: string;
};

type BillingSummaryResponse = {
  kpis: BillingKpi;
  mrrTrend: RevenuePoint[];
  planRevenue: PlanRevenuePoint[];
  overdueAccounts: OverdueAccount[];
  recentTransactions: Transaction[];
};

// ─── Semantic Color Mapping ──────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  paid: { 
    bg: 'bg-[#DCFCE7]', 
    text: 'text-[#16A34A]', 
    border: 'border-[#16A34A]' 
  },
  overdue: { 
    bg: 'bg-[#FEE2E2]', 
    text: 'text-[#DC2626]', 
    border: 'border-[#DC2626]' 
  },
  failed: { 
    bg: 'bg-[#FFEDD5]', 
    text: 'text-[#EA580C]', 
    border: 'border-[#EA580C]' 
  },
  pending: { 
    bg: 'bg-[#DBEAFE]', 
    text: 'text-[#2563EB]', 
    border: 'border-[#2563EB]' 
  },
};

const money = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

function TooltipLight({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-[#6B7280] mb-1 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name ?? p.dataKey}: {money(Number(p.value || 0))}
        </p>
      ))}
    </div>
  );
}

export default function BillingPage() {
  const [data, setData] = useState<BillingSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/billing/summary', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load billing data');
      const json = (await res.json()) as BillingSummaryResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? 'Unable to load billing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const totalMrr = data?.kpis.mrr ?? 0;
  const totalArr = data?.kpis.arr ?? 0;
  const overdueTotal = data?.kpis.overdueAmount ?? 0;
  const overdueCount = data?.kpis.overdueAccounts ?? 0;

  const metrics = useMemo(
    () => [
      { label: 'MRR', value: money(totalMrr), sub: '+12% vs last month', color: 'text-[#2563EB]', trend: '↑' },
      { label: 'ARR', value: money(totalArr), sub: 'Annualized', color: 'text-[#6B7280]', trend: '↑' },
      {
        label: 'Paying Tenants',
        value: String(data?.kpis.payingTenants ?? 0),
        sub: `${data?.kpis.trialTenants ?? 0} on trial / unpaid`,
        color: 'text-[#111827]',
        trend: '',
      },
      {
        label: 'Overdue',
        value: money(overdueTotal),
        sub: `${overdueCount} accounts`,
        color: 'text-[#DC2626]',
        trend: '↓',
      },
    ],
    [totalMrr, totalArr, overdueTotal, overdueCount, data]
  );

  const updatePlan = async (planId: string) => {
    try {
      setSavingPlanId(planId);
      const res = await fetch(`/api/admin/billing/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to update plan');
      await loadSummary();
      setEditingPlan(null);
    } finally {
      setSavingPlanId(null);
    }
  };

  const sendReminder = async (invoiceId: string) => {
    await fetch(`/api/admin/billing/overdue/${invoiceId}/remind`, { method: 'POST' });
    await loadSummary();
  };

  const markPaid = async (invoiceId: string) => {
    await fetch(`/api/admin/billing/invoices/${invoiceId}/mark-paid`, { method: 'POST' });
    await loadSummary();
  };

  const changeSubscriptionStatus = async (tenantId: string, action: 'pause' | 'resume' | 'cancel') => {
    if (!tenantId) return;
    await fetch(`/api/billing/subscription/${tenantId}/${action}`, { method: 'POST' });
    await loadSummary();
  };

  const exportTransactions = () => {
    window.location.href = '/api/admin/billing/transactions/export';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">Billing & Revenue</h1>
          <p className="text-[#6B7280] text-sm mt-1">Platform-wide subscription and revenue management</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-[#F5F6FA] rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-[#F5F6FA] rounded"></div>
                <div className="h-4 bg-[#F5F6FA] rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">Billing & Revenue</h1>
        <p className="text-[#6B7280] text-sm mt-1">Platform-wide subscription and revenue management</p>
      </div>

      {error && (
        <div className="bg-[#FEE2E2] border border-[#DC2626]/30 rounded-xl p-4 text-[#DC2626] text-sm">
          {error}
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((k) => (
          <div key={k.label} className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
            <div className="text-[12px] font-medium text-[#6B7280] mb-2 uppercase tracking-wider">{k.label}</div>
            <div className={`text-2xl font-bold tabular-nums ${k.color}`}>{k.value}</div>
            <div className="text-xs text-[#6B7280] mt-1">
              {k.trend && (
                <span className={k.trend === '↑' ? 'text-[#16A34A]' : 'text-[#DC2626]'}>{k.trend} </span>
              )}
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-5">
        {/* MRR Trend Chart - Light Theme */}
        <div className="col-span-2 bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-[#111827]">MRR Trend</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">New vs churn</p>
            </div>
            <div className="flex gap-4 text-xs text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#2563EB] rounded inline-block" />
                MRR
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#16A34A] rounded inline-block" />
                New
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#DC2626] rounded inline-block" />
                Churn
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data?.mrrTrend ?? []} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="newG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Number(v) / 1000}k`} />
              <Tooltip content={<TooltipLight />} />
              <Area type="monotone" dataKey="mrr" stroke="#2563EB" strokeWidth={2} fill="url(#mrrG)" dot={false} />
              <Area type="monotone" dataKey="newRevenue" name="New" stroke="#16A34A" strokeWidth={1.5} fill="url(#newG)" dot={false} />
              <Area type="monotone" dataKey="churn" name="Churn" stroke="#DC2626" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Plan - Light Theme */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#111827] mb-4">Revenue by Plan</h2>
          <div className="space-y-4">
            {(data?.planRevenue ?? []).map((p) => (
              <div key={p.plan}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#6B7280] font-medium">{p.plan}</span>
                  <span className="text-[#111827] font-semibold">{money(p.mrr)}</span>
                </div>
                <div className="h-2 bg-[#F5F6FA] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(5, (p.mrr / Math.max(...(data?.planRevenue ?? []).map((x) => x.mrr), 1)) * 100)}%`,
                      backgroundColor: p.color || '#2563EB',
                    }}
                  />
                </div>
                <div className="text-xs text-[#6B7280] mt-1">{p.tenants} tenants</div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-[#E5E7EB]">
            <div className="flex justify-between text-xs">
              <span className="text-[#6B7280] font-medium">Total MRR</span>
              <span className="text-[#111827] font-bold">
                {money((data?.planRevenue ?? []).reduce((s, p) => s + p.mrr, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Accounts - Light Theme */}
      {overdueCount > 0 && (
        <div className="bg-[#FEE2E2] border border-[#DC2626]/30 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#DC2626]">⚠</span>
            <h2 className="text-sm font-semibold text-[#DC2626]">Overdue Accounts</h2>
            <span className="text-xs bg-[#DC2626]/10 text-[#DC2626] px-2 py-0.5 rounded-full font-medium">{overdueCount} accounts</span>
          </div>
          <div className="space-y-2">
            {(data?.overdueAccounts ?? []).map((o) => (
              <div key={o.id} className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 shadow-sm">
                <div>
                  <div className="text-sm font-medium text-[#111827]">{o.name}</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">{o.email} · {o.daysOverdue} days overdue</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#DC2626] font-semibold text-sm">{money(o.amount)}</span>
                  <button 
                    onClick={() => sendReminder(o.invoiceId)} 
                    className="text-xs bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20 border border-[#DC2626]/30 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    Send Reminder
                  </button>
                  <button 
                    onClick={() => markPaid(o.invoiceId)} 
                    className="text-xs bg-[#F5F6FA] text-[#6B7280] hover:bg-[#E5E7EB] px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    Mark Paid
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Pricing - Light Theme */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F5F6FA]">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">Plan Pricing</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Affects all new subscriptions and renewals</p>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-[#E5E7EB]">
          {(data?.planRevenue ?? []).map((plan) => (
            <div key={plan.plan} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-[#111827]">{plan.plan}</span>
                <span className="text-xs text-[#6B7280]">{plan.tenants} tenants</span>
              </div>
              {editingPlan === plan.plan ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-[#6B7280] font-medium">Monthly ($)</label>
                    <input className="w-full mt-1 bg-white border border-[#2563EB] rounded px-2 py-1.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]" />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B7280] font-medium">Annual ($)</label>
                    <input className="w-full mt-1 bg-white border border-[#E5E7EB] rounded px-2 py-1.5 text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE]" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => updatePlan(plan.plan)} 
                      disabled={savingPlanId === plan.plan} 
                      className="flex-1 text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-1.5 rounded transition-colors disabled:opacity-60 font-medium"
                    >
                      {savingPlanId === plan.plan ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={() => setEditingPlan(null)} 
                      className="flex-1 text-xs text-[#6B7280] border border-[#E5E7EB] py-1.5 rounded hover:border-[#6B7280] transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-[#111827]">{money(plan.mrr / 12)}<span className="text-sm font-normal text-[#6B7280]">/mo</span></div>
                  <div className="text-xs text-[#6B7280] mt-0.5">Affects current subscriptions</div>
                  <button 
                    onClick={() => setEditingPlan(plan.plan)} 
                    className="mt-3 text-xs text-[#6B7280] hover:text-[#111827] border border-[#E5E7EB] hover:border-[#6B7280] px-3 py-1.5 rounded transition-colors font-medium"
                  >
                    Edit pricing
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Transactions - Light Theme */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F5F6FA]">
          <h2 className="text-sm font-semibold text-[#111827]">Recent Transactions</h2>
          <button onClick={exportTransactions} className="text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors font-medium">
            Export →
          </button>
        </div>
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex gap-3 items-center flex-wrap bg-white">
          <input
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            placeholder="Tenant ID for subscription actions"
            className="flex-1 min-w-[200px] bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] transition-colors"
          />
          <div className="flex gap-2">
            <button 
              onClick={() => changeSubscriptionStatus(selectedTenantId, 'pause')} 
              className="text-xs bg-[#FFEDD5] text-[#EA580C] hover:bg-[#EA580C] hover:text-white px-3 py-2 rounded-lg border border-[#EA580C]/30 transition-colors font-medium"
            >
              Pause
            </button>
            <button 
              onClick={() => changeSubscriptionStatus(selectedTenantId, 'resume')} 
              className="text-xs bg-[#DCFCE7] text-[#16A34A] hover:bg-[#16A34A] hover:text-white px-3 py-2 rounded-lg border border-[#16A34A]/30 transition-colors font-medium"
            >
              Resume
            </button>
            <button 
              onClick={() => changeSubscriptionStatus(selectedTenantId, 'cancel')} 
              className="text-xs bg-[#FEE2E2] text-[#DC2626] hover:bg-[#DC2626] hover:text-white px-3 py-2 rounded-lg border border-[#DC2626]/30 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F5F6FA]">
              {['Tenant', 'Invoice', 'Date', 'Amount', 'Status'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {(data?.recentTransactions ?? []).map((tx) => {
              const statusColors = STATUS_COLORS[tx.status] || STATUS_COLORS.pending;
              return (
                <tr key={tx.id} className="hover:bg-[#F5F6FA] transition-colors">
                  <td className="px-5 py-3.5 text-[#111827] font-medium">{tx.tenant}</td>
                  <td className="px-5 py-3.5 text-[#6B7280] font-mono text-xs">{tx.invoice}</td>
                  <td className="px-5 py-3.5 text-[#6B7280] text-xs">{tx.date}</td>
                  <td className="px-5 py-3.5 text-[#111827] font-semibold tabular-nums">{money(tx.amount)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text} border ${statusColors.border}/30`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}