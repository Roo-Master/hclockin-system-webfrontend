'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  plan: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  amount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: string;
}

interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  dueDate: string;
  paidAt?: string;
  pdfUrl?: string;
}

interface BillingStats {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  overdueInvoices: number;
  failedPayments: number;
  revenueGrowth: number;
}

interface BillingOverviewProps {
  stats?: BillingStats;
  subscriptions?: Subscription[];
  invoices?: Invoice[];
  isLoading?: boolean;
}

export function BillingOverview({ 
  stats, 
  subscriptions = [], 
  invoices = [],
  isLoading = false 
}: BillingOverviewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Revenue (YTD)', 
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : '$0',
      change: stats?.revenueGrowth || 0,
      icon: '💰',
      color: 'text-[#2563EB]'
    },
    { 
      label: 'Monthly Recurring Revenue', 
      value: stats ? `$${stats.monthlyRecurringRevenue.toLocaleString()}` : '$0',
      change: 12,
      icon: '📈',
      color: 'text-[#16A34A]'
    },
    { 
      label: 'Active Subscriptions', 
      value: stats?.activeSubscriptions || 0,
      change: 8,
      icon: '✅',
      color: 'text-[#16A34A]'
    },
    { 
      label: 'Overdue Invoices', 
      value: stats?.overdueInvoices || 0,
      change: -2,
      icon: '⚠️',
      color: 'text-[#DC2626]'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#6B7280]">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color} mt-1`}>{card.value}</p>
                {card.change !== undefined && (
                  <p className={`text-xs font-medium mt-1 ${card.change >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                    {card.change >= 0 ? '↑' : '↓'} {Math.abs(card.change)}% from last month
                  </p>
                )}
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-[#E5E7EB] p-1 w-fit">
        {['month', 'quarter', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period as 'month' | 'quarter' | 'year')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedPeriod === period 
                ? 'bg-[#2563EB] text-white' 
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F5F6FA]">
          <h3 className="font-semibold text-[#111827]">Active Subscriptions</h3>
          <Link 
            href="/super-admin/billing/subscriptions" 
            className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          {subscriptions.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#6B7280]">
              No subscriptions found
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#FAFBFC]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {subscriptions.slice(0, 10).map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#F5F6FA] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#111827]">{sub.tenantName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        sub.plan === 'ENTERPRISE' 
                          ? 'bg-[#FFEDD5] text-[#EA580C]'
                          : sub.plan === 'PROFESSIONAL'
                          ? 'bg-[#DBEAFE] text-[#2563EB]'
                          : 'bg-[#F5F6FA] text-[#6B7280]'
                      }`}>
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#111827]">
                      {sub.currency} {sub.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        sub.status === 'active' 
                          ? 'bg-[#DCFCE7] text-[#16A34A] border-[#16A34A]/30'
                          : sub.status === 'trialing'
                          ? 'bg-[#FFEDD5] text-[#EA580C] border-[#EA580C]/30'
                          : sub.status === 'past_due'
                          ? 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/30'
                          : 'bg-[#F5F6FA] text-[#6B7280] border-[#E5E7EB]'
                      }`}>
                        {sub.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />}
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs">
                      {new Date(sub.currentPeriodStart).toLocaleDateString()} - {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Invoices */}
      {invoices.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F5F6FA]">
            <h3 className="font-semibold text-[#111827]">Recent Invoices</h3>
            <Link 
              href="/super-admin/billing/invoices" 
              className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#FAFBFC]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F5F6FA] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#111827]">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-[#111827]">{inv.tenantName}</td>
                    <td className="px-4 py-3 font-medium text-[#111827]">
                      {inv.currency} {inv.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inv.status === 'paid' 
                          ? 'bg-[#DCFCE7] text-[#16A34A]'
                          : inv.status === 'pending'
                          ? 'bg-[#FFEDD5] text-[#EA580C]'
                          : inv.status === 'failed'
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : 'bg-[#F5F6FA] text-[#6B7280]'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium mr-2">
                        View
                      </button>
                      {inv.pdfUrl && (
                        <button className="text-xs text-[#6B7280] hover:text-[#111827] font-medium">
                          PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}