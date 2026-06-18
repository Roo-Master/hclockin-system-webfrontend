'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BillingOverview } from '@/components/super-admin/billing/Billingoverview';
import { SubscriptionTable } from '@/components/super-admin/billing/SubscriptionTable';
import { PlanSelector } from '@/components/super-admin/billing/PlanSelector';
import { InvoiceList } from '@/components/super-admin/billing/InvoiceList';

// ─── Types ───────────────────────────────────────────────────────────────────

type BillingKpi = {
  mrr: number;
  arr: number;
  payingTenants: number;
  overdueAmount: number;
  overdueAccounts: number;
  trialTenants: number;
};

type RevenuePoint = { month: string; mrr: number; newRevenue: number; churn: number };
type PlanRevenuePoint = { plan: string; tenants: number; mrr: number; color: string };
type OverdueAccount = { id: string; name: string; amount: number; daysOverdue: number; email: string; invoiceId: string };
type Transaction = { id: string; tenant: string; amount: number; date: string; status: 'paid' | 'overdue' | 'pending' | 'failed'; invoice: string };

type BillingSummaryResponse = {
  kpis: BillingKpi;
  mrrTrend: RevenuePoint[];
  planRevenue: PlanRevenuePoint[];
  overdueAccounts: OverdueAccount[];
  recentTransactions: Transaction[];
};

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: number; message: string; type: ToastType };

type ConfirmModal = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
};

// ─── Constants ─────────────────────────────────────────────────────────────

const TOAST_DURATION = 4000;
const CURRENCY = 'USD';
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric' 
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

function TooltipLight({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-[#6B7280] mb-1 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name ?? p.dataKey}: {formatCurrency(Number(p.value || 0))}
        </p>
      ))}
    </div>
  );
}

// ─── Toast Component ─────────────────────────────────────────────────────────

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-[#DCFCE7] border-[#16A34A]/30 text-[#16A34A]',
  error: 'bg-[#FEE2E2] border-[#DC2626]/30 text-[#DC2626]',
  info: 'bg-[#DBEAFE] border-[#2563EB]/30 text-[#2563EB]',
};

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 border rounded-lg px-4 py-3 text-sm shadow-lg min-w-[260px] ${TOAST_STYLES[t.type]}`}
        >
          <span className="font-bold">{TOAST_ICONS[t.type]}</span>
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmDialog({ modal, onClose }: { modal: ConfirmModal; onClose: () => void }) {
  if (!modal.open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-[#E5E7EB] p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-semibold text-[#111827] mb-1">{modal.title}</h3>
        <p className="text-sm text-[#6B7280] mb-5">{modal.description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:border-[#6B7280] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              modal.onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm text-white rounded-lg transition-colors font-medium ${modal.confirmClass}`}
          >
            {modal.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">Billing & Revenue</h1>
        <p className="text-[#6B7280] text-sm mt-1">Platform-wide subscription and revenue management</p>
      </div>
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-[#F5F6FA] rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-[#F5F6FA] rounded" />
              <div className="h-4 bg-[#F5F6FA] rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  // ── State ──
  const [data, setData] = useState<BillingSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ConfirmModal>({
    open: false,
    title: '',
    description: '',
    confirmLabel: '',
    confirmClass: '',
    onConfirm: () => {},
  });

  // ── Helpers ──
  const isPending = (key: string) => pending.has(key);
  const addPending = (key: string) => setPending((s) => new Set(s).add(key));
  const removePending = (key: string) => {
    setPending((s) => {
      const n = new Set(s);
      n.delete(key);
      return n;
    });
  };

  let toastId = 0;
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), TOAST_DURATION);
  }, []);

  const dismissToast = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const showConfirm = (opts: Omit<ConfirmModal, 'open'>) => {
    setModal({ ...opts, open: true });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  // ── Data Loading ──
  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/billing/summary', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load billing data');
      setData(await res.json());
    } catch (e: any) {
      setError(e?.message ?? 'Unable to load billing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // ── API Actions ──
  const apiCall = useCallback(
    async <T,>(
      url: string,
      options: RequestInit = {},
      successMessage: string,
      errorMessage: string = 'Operation failed'
    ): Promise<T | null> => {
      try {
        const res = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
        });
        if (!res.ok) throw new Error(errorMessage);
        showToast(successMessage, 'success');
        await loadSummary();
        return res.json();
      } catch (e: any) {
        showToast(e?.message ?? errorMessage, 'error');
        return null;
      }
    },
    [loadSummary, showToast]
  );

  const sendReminder = async (invoiceId: string, tenantName?: string) => {
    const key = `remind:${invoiceId}`;
    if (isPending(key)) return;
    addPending(key);
    await apiCall(
      `/api/admin/billing/overdue/${invoiceId}/remind`,
      { method: 'POST' },
      `Reminder sent${tenantName ? ` to ${tenantName}` : ''}`,
      'Failed to send reminder'
    );
    removePending(key);
  };

  const markPaid = async (invoiceId: string, tenantName?: string) => {
    const key = `paid:${invoiceId}`;
    if (isPending(key)) return;
    addPending(key);
    await apiCall(
      `/api/admin/billing/invoices/${invoiceId}/mark-paid`,
      { method: 'POST' },
      `Invoice marked as paid${tenantName ? ` for ${tenantName}` : ''}`,
      'Failed to mark invoice paid'
    );
    removePending(key);
  };

  const downloadInvoice = async (invoiceId: string, invoiceNumber?: string) => {
    const key = `download:${invoiceId}`;
    if (isPending(key)) return;
    addPending(key);
    try {
      const res = await fetch(`/api/admin/billing/invoices/${invoiceId}/download`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber ?? invoiceId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Invoice downloaded', 'success');
    } catch (e: any) {
      showToast(e?.message ?? 'Failed to download invoice', 'error');
    } finally {
      removePending(key);
    }
  };

  const refundInvoice = async (invoiceId: string, tenantName?: string) => {
    showConfirm({
      title: 'Refund Invoice',
      description: `Are you sure you want to refund this invoice${tenantName ? ` for ${tenantName}` : ''}? This action cannot be undone.`,
      confirmLabel: 'Refund',
      confirmClass: 'bg-[#EA580C] hover:bg-[#C2410C]',
      onConfirm: async () => {
        const key = `refund:${invoiceId}`;
        addPending(key);
        await apiCall(
          `/api/admin/billing/invoices/${invoiceId}/refund`,
          { method: 'POST' },
          `Refund issued${tenantName ? ` for ${tenantName}` : ''}`,
          'Failed to issue refund'
        );
        removePending(key);
      },
    });
  };

  const upgradeSubscription = async (tenantId: string, planId: string) => {
    const key = `upgrade:${tenantId}`;
    if (isPending(key)) return;
    addPending(key);
    await apiCall(
      `/api/admin/billing/subscription/${tenantId}/upgrade`,
      {
        method: 'POST',
        body: JSON.stringify({ planId }),
      },
      `Subscription upgraded to ${planId}`,
      'Failed to upgrade subscription'
    );
    removePending(key);
  };

  const changeSubscriptionStatus = async (tenantId: string, action: 'pause' | 'resume' | 'cancel') => {
    if (!tenantId.trim()) {
      showToast('Please enter a Tenant ID first', 'error');
      return;
    }

    const runAction = async () => {
      const key = `${action}:${tenantId}`;
      if (isPending(key)) return;
      addPending(key);
      const labels = { pause: 'paused', resume: 'resumed', cancel: 'cancelled' };
      await apiCall(
        `/api/billing/subscription/${tenantId}/${action}`,
        { method: 'POST' },
        `Subscription ${labels[action]} for tenant ${tenantId}`,
        `Failed to ${action} subscription`
      );
      setSelectedTenantId('');
      removePending(key);
    };

    if (action === 'cancel') {
      showConfirm({
        title: 'Cancel Subscription',
        description: `Are you sure you want to cancel the subscription for tenant "${tenantId}"? This will end their access at the current billing period.`,
        confirmLabel: 'Yes, Cancel',
        confirmClass: 'bg-[#DC2626] hover:bg-[#B91C1C]',
        onConfirm: runAction,
      });
    } else {
      await runAction();
    }
  };

  const exportTransactions = async () => {
    const key = 'export';
    if (isPending(key)) return;
    addPending(key);
    try {
      const res = await fetch('/api/admin/billing/transactions/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Transactions exported', 'success');
    } catch (e: any) {
      showToast(e?.message ?? 'Export failed', 'error');
    } finally {
      removePending(key);
    }
  };

  // ── Derived Data ──
  const totalMrr = data?.kpis.mrr ?? 0;
  const totalArr = data?.kpis.arr ?? 0;
  const overdueTotal = data?.kpis.overdueAmount ?? 0;
  const overdueCount = data?.kpis.overdueAccounts ?? 0;

  const metrics = useMemo(
    () => [
      { label: 'MRR', value: formatCurrency(totalMrr), sub: '+12% vs last month', color: 'text-[#2563EB]', trend: '↑' },
      { label: 'ARR', value: formatCurrency(totalArr), sub: 'Annualized', color: 'text-[#6B7280]', trend: '↑' },
      {
        label: 'Paying Tenants',
        value: String(data?.kpis.payingTenants ?? 0),
        sub: `${data?.kpis.trialTenants ?? 0} on trial / unpaid`,
        color: 'text-[#111827]',
        trend: '',
      },
      {
        label: 'Overdue',
        value: formatCurrency(overdueTotal),
        sub: `${overdueCount} accounts`,
        color: 'text-[#DC2626]',
        trend: '↓',
      },
    ],
    [totalMrr, totalArr, overdueTotal, overdueCount, data]
  );

  const subscriptionData = useMemo(() => {
    if (!data?.planRevenue) return [];
    return data.planRevenue.map((plan, index) => ({
      id: `sub-${index}`,
      tenantId: `tenant-${index}`,
      tenantName: `${plan.plan} Plan Group`,
      plan: plan.plan,
      status: 'active' as const,
      amount: plan.mrr,
      currency: CURRENCY,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      features: [],
    }));
  }, [data]);

  const invoiceData = useMemo(() => {
    if (!data?.recentTransactions) return [];
    return data.recentTransactions.map((tx) => ({
      id: tx.id,
      tenantId: `tenant-${tx.tenant}`,
      tenantName: tx.tenant,
      invoiceNumber: tx.invoice,
      amount: tx.amount,
      currency: CURRENCY,
      status: tx.status as 'paid' | 'pending' | 'failed' | 'refunded',
      dueDate: tx.date,
      paidAt: tx.status === 'paid' ? tx.date : undefined,
    }));
  }, [data]);

  const planData = useMemo(() => {
    if (!data?.planRevenue) return [];
    return data.planRevenue.map((plan) => ({
      id: plan.plan.toLowerCase(),
      name: plan.plan,
      code: plan.plan.toLowerCase(),
      priceMonthly: plan.mrr / Math.max(plan.tenants, 1),
      priceYearly: (plan.mrr / Math.max(plan.tenants, 1)) * 10,
      features: [`${plan.tenants} tenants`, `${formatCurrency(plan.mrr)} MRR`],
      isActive: true,
      description: `${plan.plan} plan with ${plan.tenants} tenants`,
    }));
  }, [data]);

  // ── Render ──
  if (loading && !data) {
    return <LoadingSkeleton />;
  }

  const subscriptionActions = [
    { action: 'pause', label: 'Pause', idle: 'bg-[#FFEDD5] text-[#EA580C] border-[#EA580C]/30 hover:bg-[#EA580C] hover:text-white' },
    { action: 'resume', label: 'Resume', idle: 'bg-[#DCFCE7] text-[#16A34A] border-[#16A34A]/30 hover:bg-[#16A34A] hover:text-white' },
    { action: 'cancel', label: 'Cancel', idle: 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/30 hover:bg-[#DC2626] hover:text-white' },
  ] as const;

  return (
    <>
      <Toasts toasts={toasts} onDismiss={dismissToast} />
      <ConfirmDialog modal={modal} onClose={closeModal} />

      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">Billing & Revenue</h1>
          <p className="text-[#6B7280] text-sm mt-1">Platform-wide subscription and revenue management</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-[#FEE2E2] border border-[#DC2626]/30 rounded-xl p-4 text-[#DC2626] text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadSummary}
              className="text-xs font-medium underline hover:no-underline ml-4"
            >
              Retry
            </button>
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
          {/* MRR Trend */}
          <div className="col-span-2 bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-[#111827]">MRR Trend</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">New vs churn</p>
              </div>
              <div className="flex gap-4 text-xs text-[#6B7280]">
                {[
                  ['#2563EB', 'MRR'],
                  ['#16A34A', 'New'],
                  ['#DC2626', 'Churn'],
                ].map(([color, label]) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 rounded inline-block" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                ))}
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
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Number(v) / 1000}k`}
                />
                <Tooltip content={<TooltipLight />} />
                <Area type="monotone" dataKey="mrr" stroke="#2563EB" strokeWidth={2} fill="url(#mrrG)" dot={false} />
                <Area
                  type="monotone"
                  dataKey="newRevenue"
                  name="New"
                  stroke="#16A34A"
                  strokeWidth={1.5}
                  fill="url(#newG)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="churn"
                  name="Churn"
                  stroke="#DC2626"
                  strokeWidth={1.5}
                  fill="none"
                  dot={false}
                  strokeDasharray="4 2"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Plan */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#111827] mb-4">Revenue by Plan</h2>
            <div className="space-y-4">
              {(data?.planRevenue ?? []).map((p) => {
                const maxMrr = Math.max(...(data?.planRevenue ?? []).map((x) => x.mrr), 1);
                return (
                  <div key={p.plan}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#6B7280] font-medium">{p.plan}</span>
                      <span className="text-[#111827] font-semibold">{formatCurrency(p.mrr)}</span>
                    </div>
                    <div className="h-2 bg-[#F5F6FA] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(5, (p.mrr / maxMrr) * 100)}%`,
                          backgroundColor: p.color || '#2563EB',
                        }}
                      />
                    </div>
                    <div className="text-xs text-[#6B7280] mt-1">{p.tenants} tenants</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-[#E5E7EB]">
              <div className="flex justify-between text-xs">
                <span className="text-[#6B7280] font-medium">Total MRR</span>
                <span className="text-[#111827] font-bold">
                  {formatCurrency((data?.planRevenue ?? []).reduce((s, p) => s + p.mrr, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Overview */}
        <BillingOverview
          stats={{
            totalRevenue: totalArr,
            monthlyRecurringRevenue: totalMrr,
            annualRecurringRevenue: totalArr,
            activeSubscriptions: data?.kpis.payingTenants ?? 0,
            trialSubscriptions: data?.kpis.trialTenants ?? 0,
            overdueInvoices: overdueCount,
            failedPayments: 0,
            revenueGrowth: 12,
          }}
          subscriptions={subscriptionData}
          invoices={invoiceData}
          isLoading={loading}
        />

        {/* Subscription Table */}
        <SubscriptionTable
          subscriptions={subscriptionData}
          onSuspend={(id) => changeSubscriptionStatus(id, 'pause')}
          onCancel={(id) => changeSubscriptionStatus(id, 'cancel')}
          onReactivate={(id) => changeSubscriptionStatus(id, 'resume')}
          onUpgrade={(id, plan) => upgradeSubscription(id, plan)}
          isLoading={loading}
        />

        {/* Plan Selector */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#111827] mb-4">Available Plans</h2>
          <PlanSelector
            plans={planData}
            onSelectPlan={(planId) => {
              showToast(`Plan "${planId}" selected`, 'info');
            }}
            isLoading={loading}
          />
        </div>

        {/* Invoice List */}
        <InvoiceList
          invoices={invoiceData}
          onPay={(id) => {
            const inv = invoiceData.find((i) => i.id === id);
            markPaid(id, inv?.tenantName);
          }}
          onDownload={(id) => {
            const inv = invoiceData.find((i) => i.id === id);
            downloadInvoice(id, inv?.invoiceNumber);
          }}
          onRefund={(id) => {
            const inv = invoiceData.find((i) => i.id === id);
            refundInvoice(id, inv?.tenantName);
          }}
          isLoading={loading}
        />

        {/* Subscription Actions */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F5F6FA]">
            <div>
              <h2 className="text-sm font-semibold text-[#111827]">Subscription Actions</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">Quickly pause, resume, or cancel a tenant subscription</p>
            </div>
            <button
              onClick={exportTransactions}
              disabled={isPending('export')}
              className="text-xs text-[#2563EB] hover:text-[#1D4ED8] disabled:opacity-50 transition-colors font-medium flex items-center gap-1"
            >
              {isPending('export') ? 'Exporting…' : 'Export Transactions →'}
            </button>
          </div>
          <div className="px-5 py-4 flex gap-3 items-center flex-wrap">
            <input
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              placeholder="Enter Tenant ID"
              className="flex-1 min-w-[200px] bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] transition-colors"
            />
            <div className="flex gap-2">
              {subscriptionActions.map(({ action, label, idle }) => {
                const busy = isPending(`${action}:${selectedTenantId}`);
                return (
                  <button
                    key={action}
                    onClick={() => changeSubscriptionStatus(selectedTenantId, action)}
                    disabled={busy}
                    className={`text-xs px-3 py-2 rounded-lg border transition-colors font-medium disabled:opacity-50 ${idle}`}
                  >
                    {busy ? `${label}ing…` : label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}