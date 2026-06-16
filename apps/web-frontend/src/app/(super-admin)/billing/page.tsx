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

const money = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

function TooltipDark({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
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
      { label: 'MRR', value: money(totalMrr), sub: '+12% vs last month', color: 'text-blue-400', trend: '↑' },
      { label: 'ARR', value: money(totalArr), sub: 'Annualized', color: 'text-violet-400', trend: '↑' },
      {
        label: 'Paying Tenants',
        value: String(data?.kpis.payingTenants ?? 0),
        sub: `${data?.kpis.trialTenants ?? 0} on trial / unpaid`,
        color: 'text-white',
        trend: '',
      },
      {
        label: 'Overdue',
        value: money(overdueTotal),
        sub: `${overdueCount} accounts`,
        color: 'text-rose-400',
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
    return <div className="text-gray-400 text-sm">Loading billing data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Billing & Revenue</h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide subscription and revenue management</p>
      </div>

      {error && (
        <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-4 text-rose-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {metrics.map((k) => (
          <div key={k.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-xs text-gray-500 mb-2">{k.label}</div>
            <div className={`text-2xl font-bold tabular-nums ${k.color}`}>{k.value}</div>
            <div className="text-xs text-gray-600 mt-1">
              {k.trend && (
                <span className={k.trend === '↑' ? 'text-emerald-500' : 'text-rose-500'}>{k.trend} </span>
              )}
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-white">MRR Trend</h2>
              <p className="text-xs text-gray-500 mt-0.5">New vs churn</p>
            </div>
            <div className="flex gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-blue-400 rounded inline-block" />
                MRR
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-emerald-400 rounded inline-block" />
                New
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data?.mrrTrend ?? []} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Number(v) / 1000}k`} />
              <Tooltip content={<TooltipDark />} />
              <Area type="monotone" dataKey="mrr" stroke="#3b82f6" strokeWidth={2} fill="url(#mrrG)" dot={false} />
              <Area type="monotone" dataKey="newRevenue" name="New" stroke="#10b981" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Revenue by Plan</h2>
          <div className="space-y-4">
            {(data?.planRevenue ?? []).map((p) => (
              <div key={p.plan}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-400">{p.plan}</span>
                  <span className="text-white font-semibold">{money(p.mrr)}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(5, (p.mrr / Math.max(...(data?.planRevenue ?? []).map((x) => x.mrr), 1)) * 100)}%`,
                      backgroundColor: p.color,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">{p.tenants} tenants</div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-800">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total MRR</span>
              <span className="text-white font-bold">
                {money((data?.planRevenue ?? []).reduce((s, p) => s + p.mrr, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-rose-400">⚠</span>
            <h2 className="text-sm font-semibold text-rose-300">Overdue Accounts</h2>
            <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">{overdueCount} accounts</span>
          </div>
          <div className="space-y-2">
            {(data?.overdueAccounts ?? []).map((o) => (
              <div key={o.id} className="flex items-center justify-between bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-white">{o.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{o.email} · {o.daysOverdue} days overdue</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-rose-400 font-semibold text-sm">{money(o.amount)}</span>
                  <button onClick={() => sendReminder(o.invoiceId)} className="text-xs bg-rose-600/20 text-rose-400 hover:bg-rose-600/40 border border-rose-600/30 px-3 py-1.5 rounded-lg transition-colors">
                    Send Reminder
                  </button>
                  <button onClick={() => markPaid(o.invoiceId)} className="text-xs bg-gray-800 text-gray-400 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                    Mark Paid
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Plan Pricing</h2>
            <p className="text-xs text-gray-500 mt-0.5">Affects all new subscriptions and renewals</p>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-800">
          {(data?.planRevenue ?? []).map((plan) => (
            <div key={plan.plan} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">{plan.plan}</span>
                <span className="text-xs text-gray-600">{plan.tenants} tenants</span>
              </div>
              {editingPlan === plan.plan ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">Monthly ($)</label>
                    <input className="w-full mt-1 bg-gray-800 border border-blue-500 rounded px-2 py-1.5 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Annual ($)</label>
                    <input className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => updatePlan(plan.plan)} disabled={savingPlanId === plan.plan} className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded transition-colors disabled:opacity-60">
                      {savingPlanId === plan.plan ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingPlan(null)} className="flex-1 text-xs text-gray-400 border border-gray-700 py-1.5 rounded hover:border-gray-600 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-white">{money(plan.mrr / 12)}<span className="text-sm font-normal text-gray-500">/mo</span></div>
                  <div className="text-xs text-gray-600 mt-0.5">Affects current subscriptions</div>
                  <button onClick={() => setEditingPlan(plan.plan)} className="mt-3 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 px-3 py-1.5 rounded transition-colors">
                    Edit pricing
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
          <button onClick={exportTransactions} className="text-xs text-blue-500 hover:text-blue-400 transition-colors">
            Export →
          </button>
        </div>
        <div className="px-5 py-4 border-b border-gray-800 flex gap-3 items-center">
          <input
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            placeholder="Tenant ID for subscription actions"
            className="w-full max-w-md bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none"
          />
          <button onClick={() => changeSubscriptionStatus(selectedTenantId, 'pause')} className="text-xs bg-gray-800 text-gray-300 px-3 py-2 rounded border border-gray-700">
            Pause
          </button>
          <button onClick={() => changeSubscriptionStatus(selectedTenantId, 'resume')} className="text-xs bg-gray-800 text-gray-300 px-3 py-2 rounded border border-gray-700">
            Resume
          </button>
          <button onClick={() => changeSubscriptionStatus(selectedTenantId, 'cancel')} className="text-xs bg-rose-600/20 text-rose-300 px-3 py-2 rounded border border-rose-600/30">
            Cancel
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Tenant', 'Invoice', 'Date', 'Amount', 'Status'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {(data?.recentTransactions ?? []).map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-800/20 transition-colors">
                <td className="px-5 py-3.5 text-white">{tx.tenant}</td>
                <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{tx.invoice}</td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">{tx.date}</td>
                <td className="px-5 py-3.5 text-white font-medium tabular-nums">{money(tx.amount)}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tx.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400' : tx.status === 'overdue' ? 'bg-rose-500/15 text-rose-400' : tx.status === 'failed' ? 'bg-orange-500/15 text-orange-400' : 'bg-gray-500/15 text-gray-300'}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}