#!/bin/bash

# =============================================================================
# Chronos Super Admin — UI Components Install Script
# Run from: ~/Desktop/hclockin-system/
# Usage: bash install-super-admin-ui.sh
# =============================================================================

set -e

ROOT=$(pwd)
FRONTEND="$ROOT/apps/web-frontend"

echo "🎨 Chronos Super Admin UI Components"
echo "======================================"

# Guard
if [ ! -f "$ROOT/turbo.json" ]; then
  echo "❌ Run from monorepo root (where turbo.json lives)"
  exit 1
fi

# ─── 1. Install recharts ──────────────────────────────────────────────────────
echo ""
echo "📦 Installing recharts..."
npm install recharts --workspace=apps/web-frontend
echo "   ✓ recharts installed"

# ─── 2. Create component directories ─────────────────────────────────────────
echo ""
echo "📁 Creating component directories..."
mkdir -p "$FRONTEND/src/components/super-admin/stats"
mkdir -p "$FRONTEND/src/components/super-admin/tenants"

# ─── 3. PlatformStatsGrid ────────────────────────────────────────────────────
echo "🧩 Writing PlatformStatsGrid..."
cat > "$FRONTEND/src/components/super-admin/stats/PlatformStatsGrid.tsx" << 'EOF'
'use client';
import { useEffect, useState } from 'react';

interface Stat {
  label: string;
  value: string;
  sub: string;
  delta?: string;
  deltaUp?: boolean;
  accent: string;
  icon: string;
}

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

function formatCurrency(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n}`;
}

function buildStats(data: PlatformStats): Stat[] {
  return [
    {
      label: 'Monthly Recurring Revenue',
      value: formatCurrency(data.mrr),
      sub: `ARR ${formatCurrency(data.arr)}`,
      delta: '+12%',
      deltaUp: true,
      accent: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
      icon: '💰',
    },
    {
      label: 'Active Tenants',
      value: String(data.activeTenants),
      sub: `${data.totalTenants} total · ${data.trialTenants} on trial`,
      delta: `+${data.newTenantsThisMonth} this month`,
      deltaUp: true,
      accent: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
      icon: '🏥',
    },
    {
      label: 'Total Staff',
      value: data.totalStaff.toLocaleString(),
      sub: 'Across all hospitals',
      accent: 'from-violet-500/20 to-violet-600/5 border-violet-500/30',
      icon: '👥',
    },
    {
      label: "Clock-ins Today",
      value: data.totalClockInsToday.toLocaleString(),
      sub: 'Platform-wide',
      accent: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
      icon: '⏱',
    },
    {
      label: 'Churn Rate',
      value: `${data.churnRate.toFixed(1)}%`,
      sub: 'Last 30 days',
      delta: data.churnRate > 5 ? 'Above target' : 'On target',
      deltaUp: data.churnRate <= 5,
      accent: 'from-rose-500/20 to-rose-600/5 border-rose-500/30',
      icon: '📉',
    },
    {
      label: 'Suspended',
      value: String(data.suspendedTenants),
      sub: 'Require attention',
      delta: data.suspendedTenants > 0 ? 'Action needed' : 'All clear',
      deltaUp: data.suspendedTenants === 0,
      accent: 'from-gray-500/20 to-gray-600/5 border-gray-500/30',
      icon: '🔒',
    },
  ];
}

const MOCK: PlatformStats = {
  totalTenants: 24,
  activeTenants: 19,
  suspendedTenants: 2,
  trialTenants: 3,
  totalStaff: 3847,
  totalClockInsToday: 1204,
  mrr: 18400,
  arr: 220800,
  churnRate: 2.4,
  newTenantsThisMonth: 3,
};

export function PlatformStatsGrid() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: replace with superAdminApi.getStats()
    setTimeout(() => {
      setStats(buildStats(MOCK));
      setLoading(false);
    }, 600);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-800/50 border border-gray-700/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`relative rounded-xl border bg-gradient-to-br p-5 ${stat.accent} transition-all hover:scale-[1.02]`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider truncate">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-white tabular-nums">{stat.value}</p>
              <p className="mt-1 text-xs text-gray-500">{stat.sub}</p>
            </div>
            <span className="text-2xl ml-3 opacity-80">{stat.icon}</span>
          </div>
          {stat.delta && (
            <div className="mt-3 flex items-center gap-1.5">
              <span className={`text-xs font-semibold ${stat.deltaUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.deltaUp ? '↑' : '↓'} {stat.delta}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
EOF
echo "   ✓ PlatformStatsGrid.tsx"

# ─── 4. Charts ────────────────────────────────────────────────────────────────
echo "🧩 Writing Charts (MrrChart + TenantStatusBreakdown)..."
cat > "$FRONTEND/src/components/super-admin/stats/Charts.tsx" << 'EOF'
'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const MRR_DATA = [
  { month: 'Jan', mrr: 4200,  arr: 50400  },
  { month: 'Feb', mrr: 6800,  arr: 81600  },
  { month: 'Mar', mrr: 8100,  arr: 97200  },
  { month: 'Apr', mrr: 9400,  arr: 112800 },
  { month: 'May', mrr: 12200, arr: 146400 },
  { month: 'Jun', mrr: 15100, arr: 181200 },
  { month: 'Jul', mrr: 16400, arr: 196800 },
  { month: 'Aug', mrr: 18400, arr: 220800 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.dataKey.toUpperCase()}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export function MrrChart() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-white">Revenue Growth</h2>
          <p className="text-xs text-gray-500 mt-0.5">MRR · Jan – Aug 2024</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-blue-400 inline-block rounded" /> MRR
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-violet-400 inline-block rounded" /> ARR
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={MRR_DATA} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="arrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="arr" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#arrGrad)" dot={false} />
          <Area type="monotone" dataKey="mrr" stroke="#3b82f6" strokeWidth={2} fill="url(#mrrGrad)" dot={false} activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const STATUS_DATA = [
  { name: 'Active',    value: 19, color: '#10b981' },
  { name: 'Trial',     value: 3,  color: '#f59e0b' },
  { name: 'Suspended', value: 2,  color: '#f43f5e' },
];

const RADIAN = Math.PI / 180;
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function TenantStatusBreakdown() {
  const total = STATUS_DATA.reduce((s, d) => s + d.value, 0);
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-full">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">Tenant Breakdown</h2>
        <p className="text-xs text-gray-500 mt-0.5">{total} total accounts</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={STATUS_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value" labelLine={false} label={CustomLabel}>
            {STATUS_DATA.map((entry) => (
              <Cell key={entry.name} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 space-y-2">
        {STATUS_DATA.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-semibold text-white tabular-nums">
              {item.value}
              <span className="text-gray-500 font-normal ml-1">({Math.round((item.value / total) * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF
echo "   ✓ Charts.tsx"

# ─── 5. TenantsTable ──────────────────────────────────────────────────────────
echo "🧩 Writing TenantsTable..."
cat > "$FRONTEND/src/components/super-admin/tenants/TenantsTable.tsx" << 'TSXEOF'
'use client';
import { useState } from 'react';

type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  plan: PlanTier;
  staffCount: number;
  adminEmail: string;
  mrr: number;
  createdAt: string;
  trialEndsAt?: string;
}

const STATUS_STYLES: Record<TenantStatus, string> = {
  ACTIVE:    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  TRIAL:     'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  SUSPENDED: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  CANCELLED: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
};

const PLAN_STYLES: Record<PlanTier, string> = {
  STARTER:      'bg-gray-700 text-gray-300',
  PROFESSIONAL: 'bg-blue-600/20 text-blue-300',
  ENTERPRISE:   'bg-violet-600/20 text-violet-300',
};

function StatusBadge({ status }: { status: TenantStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function PlanBadge({ plan }: { plan: PlanTier }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${PLAN_STYLES[plan]}`}>
      {plan.charAt(0) + plan.slice(1).toLowerCase()}
    </span>
  );
}

function ActionMenu({ tenant, onAction }: { tenant: Tenant; onAction: (action: string, tenant: Tenant) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">···</button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
            {[
              { label: 'View Details', action: 'view', icon: '👁' },
              { label: 'Impersonate',  action: 'impersonate', icon: '🔑' },
              { label: 'Edit Plan',    action: 'edit-plan',   icon: '✏️' },
              { label: tenant.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend', action: tenant.status === 'SUSPENDED' ? 'reactivate' : 'suspend', icon: tenant.status === 'SUSPENDED' ? '✅' : '🔒', danger: tenant.status !== 'SUSPENDED' },
            ].map((item) => (
              <button key={item.action} onClick={() => { onAction(item.action, tenant); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-gray-700 transition-colors ${(item as any).danger ? 'text-rose-400 hover:text-rose-300' : 'text-gray-300 hover:text-white'}`}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const MOCK_TENANTS: Tenant[] = [
  { id: '1', name: 'Nairobi General Hospital',   slug: 'nairobi-general', status: 'ACTIVE',    plan: 'ENTERPRISE',   staffCount: 842,  adminEmail: 'admin@nairobigeneral.co.ke',  mrr: 2400, createdAt: '2024-01-15' },
  { id: '2', name: 'Kenyatta National Hospital', slug: 'knh',             status: 'ACTIVE',    plan: 'ENTERPRISE',   staffCount: 1204, adminEmail: 'it@knh.or.ke',               mrr: 2400, createdAt: '2024-02-01' },
  { id: '3', name: 'Aga Khan Hospital',           slug: 'aga-khan',        status: 'ACTIVE',    plan: 'PROFESSIONAL', staffCount: 510,  adminEmail: 'admin@agakhanhospital.co.ke', mrr: 1200, createdAt: '2024-03-10' },
  { id: '4', name: 'MP Shah Hospital',            slug: 'mp-shah',         status: 'TRIAL',     plan: 'PROFESSIONAL', staffCount: 298,  adminEmail: 'ops@mpshah.co.ke',            mrr: 0,    createdAt: '2024-06-01', trialEndsAt: '2024-06-22' },
  { id: '5', name: 'Mater Hospital',              slug: 'mater',           status: 'ACTIVE',    plan: 'PROFESSIONAL', staffCount: 320,  adminEmail: 'admin@materhosp.co.ke',       mrr: 1200, createdAt: '2024-04-05' },
  { id: '6', name: 'Gertrudes Hospital',          slug: 'gertrudes',       status: 'SUSPENDED', plan: 'STARTER',      staffCount: 89,   adminEmail: 'admin@gertrudes.co.ke',       mrr: 0,    createdAt: '2024-02-20' },
  { id: '7', name: 'Bliss Healthcare',            slug: 'bliss',           status: 'TRIAL',     plan: 'STARTER',      staffCount: 44,   adminEmail: 'admin@blisshealthcare.co.ke', mrr: 0,    createdAt: '2024-06-08', trialEndsAt: '2024-06-25' },
  { id: '8', name: 'Avenue Hospital',             slug: 'avenue',          status: 'ACTIVE',    plan: 'STARTER',      staffCount: 136,  adminEmail: 'admin@avenuehospital.co.ke',  mrr: 400,  createdAt: '2024-05-12' },
];

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELLED'] as const;
const PLAN_FILTERS   = ['ALL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as const;

export function TenantsTable() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter]     = useState<string>('ALL');
  const [search, setSearch]             = useState('');

  const filtered = MOCK_TENANTS.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (planFilter !== 'ALL' && t.plan !== planFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.adminEmail.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function handleAction(action: string, tenant: Tenant) {
    console.log(`Action: ${action} on ${tenant.id}`);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-sm font-semibold text-white">All Tenants</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
            <input type="text" placeholder="Search tenants..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 w-48" />
          </div>
          <div className="flex bg-gray-800 rounded-lg p-0.5 gap-0.5">
            {STATUS_FILTERS.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${statusFilter === s ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500">
            {PLAN_FILTERS.map((p) => (
              <option key={p} value={p}>{p === 'ALL' ? 'All Plans' : p.charAt(0) + p.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Hospital', 'Status', 'Plan', 'Staff', 'MRR', 'Admin', 'Joined', ''].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-500 text-sm">No tenants match your filters.</td></tr>
            ) : filtered.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="font-medium text-white">{tenant.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">/{tenant.slug}</div>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <StatusBadge status={tenant.status} />
                  {tenant.trialEndsAt && (
                    <div className="text-xs text-amber-500 mt-1">Ends {new Date(tenant.trialEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                  )}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap"><PlanBadge plan={tenant.plan} /></td>
                <td className="px-5 py-3.5 whitespace-nowrap text-gray-300 tabular-nums">{tenant.staffCount.toLocaleString()}</td>
                <td className="px-5 py-3.5 whitespace-nowrap text-gray-300 tabular-nums">
                  {tenant.mrr > 0 ? `$${tenant.mrr.toLocaleString()}` : <span className="text-gray-600">—</span>}
                </td>
                <td className="px-5 py-3.5"><div className="text-gray-400 text-xs truncate max-w-[160px]">{tenant.adminEmail}</div></td>
                <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 text-xs">
                  {new Date(tenant.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>
                <td className="px-5 py-3.5"><ActionMenu tenant={tenant} onAction={handleAction} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-500">Showing {filtered.length} of {MOCK_TENANTS.length} tenants</span>
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Export CSV →</button>
      </div>
    </div>
  );
}
TSXEOF
echo "   ✓ TenantsTable.tsx"

# ─── 6. Update dashboard page ─────────────────────────────────────────────────
echo "📄 Updating dashboard page..."
cat > "$FRONTEND/src/app/(super-admin)/dashboard/page.tsx" << 'EOF'
import { PlatformStatsGrid } from '@/components/super-admin/stats/PlatformStatsGrid';
import { TenantsTable } from '@/components/super-admin/tenants/TenantsTable';
import { MrrChart, TenantStatusBreakdown } from '@/components/super-admin/stats/Charts';

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Chronos SaaS · Super Admin Console</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      <PlatformStatsGrid />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2"><MrrChart /></div>
        <div><TenantStatusBreakdown /></div>
      </div>

      <TenantsTable />
    </div>
  );
}
EOF
echo "   ✓ dashboard/page.tsx updated"

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "✅ UI components installed!"
echo ""
echo "📋 NEXT STEPS:"
echo "   1. npm run dev  (from monorepo root)"
echo "   2. Visit http://localhost:3000/(super-admin)/dashboard"
echo "   3. When ready to wire real data, replace MOCK_ constants with superAdminApi calls"
echo ""
echo "Files created:"
echo "   apps/web-frontend/src/components/super-admin/stats/PlatformStatsGrid.tsx"
echo "   apps/web-frontend/src/components/super-admin/stats/Charts.tsx"
echo "   apps/web-frontend/src/components/super-admin/tenants/TenantsTable.tsx"
echo "   apps/web-frontend/src/app/(super-admin)/dashboard/page.tsx  (updated)"