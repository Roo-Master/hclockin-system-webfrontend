// src/app/super-admin/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
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

interface ApiError {
  message: string;
  status?: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch stats function with proper error handling
  const fetchStats = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // ✅ FIX: Added credentials: 'include' to send cookies
      const response = await fetch('/api/super-admin/stats', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        // Add cache: 'no-store' to prevent caching
        cache: 'no-store',
      });

      // Handle different HTTP status codes
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again');
      } else if (response.status === 403) {
        throw new Error('Forbidden: You don\'t have permission to view this page');
      } else if (response.status === 404) {
        throw new Error('Dashboard data endpoint not found');
      } else if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate that we received data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data received from server');
      }

      setStats(data);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      
      let errorMessage = 'Failed to load dashboard data';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setStats(null);
      
      // Increment retry count for exponential backoff
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh with exponential backoff on error
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    let refreshInterval: NodeJS.Timeout;

    // Initial fetch
    fetchStats();

    // Set up auto-refresh every 5 minutes
    refreshInterval = setInterval(() => {
      fetchStats();
    }, 5 * 60 * 1000);

    // If there's an error, retry with exponential backoff
    if (error && retryCount < 5) {
      const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
      retryTimeout = setTimeout(() => {
        fetchStats();
      }, backoffTime);
    }

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      clearTimeout(retryTimeout);
    };
  }, [fetchStats, error, retryCount]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchStats(true);
  };

  // Handle retry
  const handleRetry = () => {
    fetchStats();
  };

  // Loading state
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

  // Error state with detailed message
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center max-w-2xl mx-auto">
        <div className="text-5xl mb-4">
          {error.includes('Unauthorized') ? '🔒' : '⚠️'}
        </div>
        <h3 className="text-lg font-semibold text-[#111827] mb-2">
          {error.includes('Unauthorized') ? 'Authentication Required' : 'Error loading dashboard'}
        </h3>
        <p className="text-[#6B7280] text-sm mb-4">{error}</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
          
          {error.includes('Unauthorized') && (
            <Link
              href="/login"
              className="bg-[#F5F6FA] hover:bg-[#E5E7EB] text-[#111827] px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Go to Login
            </Link>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="bg-[#F5F6FA] hover:bg-[#E5E7EB] text-[#111827] px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Refresh Page
          </button>
        </div>
        
        {retryCount > 0 && (
          <p className="text-xs text-[#6B7280] mt-4">
            Auto-retry attempt {retryCount} of 5
          </p>
        )}
      </div>
    );
  }

  // No data state
  if (!stats) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-[#6B7280] mb-4">No dashboard data available</p>
        <button
          onClick={handleRefresh}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  // Success - Render dashboard
  return (
    <div className="space-y-6">
      {/* Page Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">
            Platform Overview
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Real-time metrics and insights for the Chronos platform
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRefreshing
                ? 'bg-[#F5F6FA] text-[#6B7280] cursor-not-allowed'
                : 'bg-[#F5F6FA] hover:bg-[#E5E7EB] text-[#111827]'
            }`}
          >
            <svg 
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <span className="text-xs text-[#6B7280]">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* KPI Row - Top level metrics */}
      <KPIRow stats={stats} />

      {/* Stats Grid - Detailed metrics */}
      <PlatformStatsGrid stats={stats} />

      {/* Charts Section - Using the correct chart components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#6B7280]">MRR Trend</h3>
            {stats.revenue?.mrrHistory && stats.revenue.mrrHistory.length > 0 && (
              <span className="text-xs text-[#6B7280]">
                ${stats.revenue.mrr.toLocaleString()} MRR
              </span>
            )}
          </div>
          <MrrChart data={stats.revenue?.mrrHistory} />
        </div>
        
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Tenant Status Distribution</h3>
            <span className="text-xs text-[#6B7280]">
              {stats.totalTenants} total tenants
            </span>
          </div>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Created
                  </th>
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
                        {tenant.status === 'ACTIVE' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                        )}
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
                    <td className="px-4 py-3 text-[#111827] tabular-nums">
                      {tenant.staffCount.toLocaleString()}
                    </td>
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