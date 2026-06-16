'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/contexts';
import { Card } from '@/components/common';
import { formatCurrency, formatNumber } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalAdmins: number;
  totalStaff: number;
  pendingInvites: number;
  systemUptime: number;
}

interface MRRDataPoint {
  month: string;
  mrr: number;
  growth: number;
}

interface TenantStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

interface DashboardData {
  stats: DashboardStats;
  mrrSeries: MRRDataPoint[];
  tenantStatusBreakdown: TenantStatusBreakdown[];
  tenants: any[];
}

// ─── Components ─────────────────────────────────────────────────────────────

function PlatformStatsGrid({ data }: { data?: DashboardStats }) {
  const stats = [
    {
      label: 'Total Tenants',
      value: data?.totalTenants ?? 0,
      sub: `${data?.activeTenants ?? 0} active`,
      color: 'text-[#2563EB]',
      icon: '🏥',
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(data?.monthlyRevenue ?? 0),
      sub: `${formatCurrency(data?.totalRevenue ?? 0)} total`,
      color: 'text-[#16A34A]',
      icon: '💰',
    },
    {
      label: 'Total Admins',
      value: data?.totalAdmins ?? 0,
      sub: `${data?.pendingInvites ?? 0} pending invites`,
      color: 'text-[#EA580C]',
      icon: '👤',
    },
    {
      label: 'Total Staff',
      value: formatNumber(data?.totalStaff ?? 0),
      sub: 'Across all tenants',
      color: 'text-[#6B7280]',
      icon: '👥',
    },
    {
      label: 'System Uptime',
      value: `${data?.systemUptime ?? 99.9}%`,
      sub: '30 day average',
      color: 'text-[#16A34A]',
      icon: '📊',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-[#6B7280] uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">{stat.sub}</p>
            </div>
            <span className="text-2xl">{stat.icon}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function MrrChart({ data }: { data?: MRRDataPoint[] }) {
  const series = data ?? [];
  const maxValue = Math.max(...series.map((d) => d.mrr), 1);

  return (
    <Card title="Revenue Trend" subtitle="Monthly recurring revenue">
      <div className="h-64">
        {series.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#6B7280]">
            No data available
          </div>
        ) : (
          <div className="h-full flex items-end gap-2">
            {series.map((point, i) => {
              const height = (point.mrr / maxValue) * 100;
              const isPositive = point.growth >= 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-medium ${isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      {isPositive ? '↑' : '↓'} {Math.abs(point.growth)}%
                    </span>
                    <span className="text-xs font-semibold text-[#111827]">
                      ${(point.mrr / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div
                    className="w-full rounded-sm transition-all duration-500"
                    style={{
                      height: `${Math.max(height * 0.8, 4)}px`,
                      backgroundColor: isPositive ? '#16A34A' : '#DC2626',
                    }}
                  />
                  <span className="text-[10px] text-[#9CA3AF]">{point.month}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

function TenantStatusBreakdown({ data }: { data?: TenantStatusBreakdown[] }) {
  const breakdown = data ?? [];

  return (
    <Card title="Tenant Distribution" subtitle="Status breakdown">
      <div className="space-y-4">
        {breakdown.length === 0 ? (
          <div className="py-8 text-center text-[#6B7280]">No data available</div>
        ) : (
          breakdown.map((item) => (
            <div key={item.status}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#6B7280]">{item.status}</span>
                <span className="font-medium text-[#111827]">
                  {item.count} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 bg-[#F5F6FA] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color || '#2563EB',
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function RecentTenantsTable({ data }: { data?: any[] }) {
  const tenants = data ?? [];

  if (tenants.length === 0) {
    return (
      <Card title="Recent Tenants" subtitle="Latest hospital accounts">
        <div className="py-12 text-center text-[#6B7280]">No tenants found</div>
      </Card>
    );
  }

  return (
    <Card title="Recent Tenants" subtitle="Latest hospital accounts">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F5F6FA]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                Hospital
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                Staff
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                MRR
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {tenants.slice(0, 5).map((tenant) => (
              <tr key={tenant.id} className="hover:bg-[#F5F6FA]/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center text-xs font-bold">
                      {tenant.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <div className="font-medium text-[#111827]">{tenant.name}</div>
                      <div className="text-xs text-[#6B7280]">{tenant.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      tenant.status === 'ACTIVE'
                        ? 'bg-[#DCFCE7] text-[#16A34A] border-[#16A34A]/30'
                        : tenant.status === 'TRIAL'
                        ? 'bg-[#FFEDD5] text-[#EA580C] border-[#EA580C]/30'
                        : tenant.status === 'SUSPENDED'
                        ? 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/30'
                        : 'bg-[#F5F6FA] text-[#6B7280] border-[#E5E7EB]'
                    }`}
                  >
                    {tenant.status === 'ACTIVE' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                    )}
                    {tenant.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      tenant.plan === 'ENTERPRISE'
                        ? 'bg-[#FFEDD5] text-[#EA580C]'
                        : tenant.plan === 'PROFESSIONAL'
                        ? 'bg-[#DBEAFE] text-[#2563EB]'
                        : 'bg-[#F5F6FA] text-[#6B7280]'
                    }`}
                  >
                    {tenant.plan}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-[#6B7280]">
                  {tenant.staffCount?.toLocaleString() || 0}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell font-medium text-[#111827]">
                  {tenant.mrr ? `$${tenant.mrr.toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-[#6B7280] text-xs">
                  {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tenants.length > 5 && (
          <div className="px-4 py-3 border-t border-[#E5E7EB] text-center">
            <a href="/tenants" className="text-sm text-[#2563EB] hover:underline">
              View all {tenants.length} tenants →
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/super-admin/dashboard', { cache: 'no-store' });
      
      if (!res.ok) {
        throw new Error('Failed to load dashboard data');
      }
      
      const json = await res.json();
      setData(json);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FEE2E2] border border-[#DC2626]/30 rounded-xl p-4 text-[#DC2626]">
        <p className="font-medium">Error loading dashboard</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-3 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#2563EB]/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">Platform Overview</h1>
          <p className="text-sm text-[#6B7280] mt-1">Super Admin Console - Manage your entire platform</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#6B7280] bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-lg shadow-sm">
            <span className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse" />
            All systems operational
          </div>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#2563EB]/90 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <PlatformStatsGrid data={data?.stats} />

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <MrrChart data={data?.mrrSeries} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <TenantStatusBreakdown data={data?.tenantStatusBreakdown} />
        </div>
      </div>

      {/* Recent Tenants */}
      <RecentTenantsTable data={data?.tenants} />
    </div>
  );
}
