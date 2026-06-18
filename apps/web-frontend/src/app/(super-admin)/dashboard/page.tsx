'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// ✅ Correct imports
import { KPIRow } from '@/components/super-admin/dashboard/KPIRow';
import { PlatformStatsGrid } from '@/components/super-admin/stats/PlatformStatsGrid';
import { MrrChart, TenantStatusBreakdown } from '@/components/super-admin/stats/Charts';

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  totalUsers: number;
  activeUsersLast30d: number;
  totalClockInsToday: number;
  totalClockInsThisMonth: number;
  revenue: {
    mrr: number;
    ytd: number;
    lastMonth: number;
    mrrHistory?: Array<{ month: string; mrr: number; arr: number }>;
  };
  tenantStatusBreakdown?: Array<{ name: string; value: number; color: string }>;
  recentTenants?: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    plan: string;
    staffCount: number;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/super-admin/stats');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center max-w-2xl mx-auto">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-[#111827] mb-2">Error loading dashboard</h3>
        <p className="text-[#6B7280] text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
        <p className="text-[#6B7280]">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">Platform Overview</h1>
        <p className="text-[#6B7280] text-sm mt-1">Real-time metrics and insights for the Chronos platform</p>
      </div>

      {/* KPI Row - Top level metrics */}
      <KPIRow stats={stats} />

      {/* Stats Grid - Detailed metrics */}
      <PlatformStatsGrid stats={stats} />

      {/* Charts Section - Using the correct chart components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
          <h3 className="text-sm font-medium text-[#6B7280] mb-4">MRR Trend</h3>
          <MrrChart data={stats.revenue?.mrrHistory} />
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
          <h3 className="text-sm font-medium text-[#6B7280] mb-4">Tenant Status Distribution</h3>
          <TenantStatusBreakdown data={stats.tenantStatusBreakdown} />
        </div>
      </div>

      {/* Recent Tenants Section */}
      {stats.recentTenants && stats.recentTenants.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F5F6FA]">
            <h2 className="font-semibold text-[#111827]">Recently Onboarded Hospitals</h2>
            <Link 
              href="/super-admin/tenants" 
              className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Hospital</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Staff</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {stats.recentTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-[#F5F6FA] transition-colors">
                    <td className="px-4 py-3">
                      <Link 
                        href={`/super-admin/tenants/${tenant.id}`} 
                        className="font-medium text-[#111827] hover:text-[#2563EB] transition-colors"
                      >
                        {tenant.name}
                      </Link>
                      <div className="text-xs text-[#6B7280]">/{tenant.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        tenant.status === 'ACTIVE' 
                          ? 'bg-[#DCFCE7] text-[#16A34A] border-[#16A34A]/30' 
                          : tenant.status === 'SUSPENDED'
                          ? 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/30'
                          : 'bg-[#FFEDD5] text-[#EA580C] border-[#EA580C]/30'
                      }`}>
                        {tenant.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />}
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                        tenant.plan === 'ENTERPRISE' 
                          ? 'bg-[#FFEDD5] text-[#EA580C] border-[#EA580C]/30'
                          : tenant.plan === 'PROFESSIONAL'
                          ? 'bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]/30'
                          : 'bg-[#F5F6FA] text-[#6B7280] border-[#E5E7EB]'
                      }`}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#111827] tabular-nums">{tenant.staffCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs tabular-nums">
                      {new Date(tenant.createdAt).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: '2-digit' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-[#E5E7EB] bg-[#F5F6FA] flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">
              Showing {stats.recentTenants.length} most recent tenants
            </span>
            <Link 
              href="/super-admin/tenants" 
              className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors"
            >
              View all tenants →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}