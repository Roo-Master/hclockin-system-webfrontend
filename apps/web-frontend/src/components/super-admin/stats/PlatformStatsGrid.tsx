'use client';

import { useEffect, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  trialTenants: number;
  totalStaff: number;
  totalClockInsToday: number;
  mrr: number;
  arr: number;
  churnRate: number;
  newTenantsThisMonth: number;
}

interface Stat {
  label: string;
  value: string;
  sub: string;
  delta?: string;
  deltaUp?: boolean;
  intent: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  icon: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const PLACEHOLDER: PlatformStats = {
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
};

function formatCurrency(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n}`;
}

function buildStats(d: PlatformStats): Stat[] {
  return [
    {
      label: 'Monthly Recurring Revenue',
      value: formatCurrency(d.mrr),
      sub: `ARR ${formatCurrency(d.arr)}`,
      delta: '+12%',
      deltaUp: true,
      intent: 'info',
      icon: 'ti-currency-dollar',
    },
    {
      label: 'Active Tenants',
      value: String(d.activeTenants),
      sub: `${d.totalTenants} total · ${d.trialTenants} on trial`,
      delta: `+${d.newTenantsThisMonth} this month`,
      deltaUp: true,
      intent: 'success',
      icon: 'ti-building-hospital',
    },
    {
      label: 'Total Staff',
      value: d.totalStaff.toLocaleString(),
      sub: 'Across all hospitals',
      intent: 'info',
      icon: 'ti-users',
    },
    {
      label: 'Clock-ins Today',
      value: d.totalClockInsToday.toLocaleString(),
      sub: 'Platform-wide',
      intent: 'success',
      icon: 'ti-clock',
    },
    {
      label: 'Churn Rate',
      value: `${d.churnRate.toFixed(1)}%`,
      sub: 'Last 30 days',
      delta: d.churnRate > 5 ? 'Above target' : 'On target',
      deltaUp: d.churnRate <= 5,
      intent: d.churnRate > 5 ? 'danger' : 'success',
      icon: 'ti-trending-down',
    },
    {
      label: 'Suspended',
      value: String(d.suspendedTenants),
      sub: 'Require attention',
      delta: d.suspendedTenants > 0 ? 'Action needed' : 'All clear',
      deltaUp: d.suspendedTenants === 0,
      intent: d.suspendedTenants > 0 ? 'warning' : 'success',
      icon: 'ti-lock',
    },
  ];
}

// ── Intent → semantic color classes ─────────────────────────────────────

const INTENT_ICON_BG: Record<string, string> = {
  info: 'bg-info-bg',
  success: 'bg-success-bg',
  warning: 'bg-warning-bg',
  danger: 'bg-danger-bg',
  neutral: 'bg-border',
};

const INTENT_ICON_COLOR: Record<string, string> = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  neutral: 'text-secondary',
};

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="bg-surface border border-border rounded-card p-6 flex items-start gap-3">
      <div
        className={`flex-shrink-0 w-11 h-11 rounded-badge flex items-center justify-center
          ${INTENT_ICON_BG[stat.intent]}`}
        aria-hidden="true"
      >
        <i className={`ti ${stat.icon} text-2xl ${INTENT_ICON_COLOR[stat.intent]}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-label text-secondary truncate">{stat.label}</p>
        <p className="text-stat text-primary mt-1 tabular-nums">{stat.value}</p>
        <p className="text-label text-tertiary mt-0.5">{stat.sub}</p>
        {stat.delta && (
          <p className={`text-delta mt-1 flex items-center gap-1 ${stat.deltaUp ? 'text-success' : 'text-danger'}`}>
            <i className={`ti ${stat.deltaUp ? 'ti-trending-up' : 'ti-trending-down'} text-sm`} aria-hidden="true" />
            {stat.delta}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────

export function PlatformStatsGrid({ data }: { data?: PlatformStats }) {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data) {
      setStats(buildStats(data));
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const res = await fetch('/api/super-admin/dashboard', { cache: 'no-store' });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setStats(buildStats(json?.stats ?? PLACEHOLDER));
      } catch {
        setStats(buildStats(PLACEHOLDER));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [data]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-card bg-surface border border-border animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}

export default PlatformStatsGrid;