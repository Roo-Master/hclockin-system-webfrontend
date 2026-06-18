'use client';

import { useState } from 'react';

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
  features?: string[];
}

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onSuspend?: (id: string) => void;
  onCancel?: (id: string) => void;
  onReactivate?: (id: string) => void;
  onUpgrade?: (id: string, plan: string) => void;
  isLoading?: boolean;
}

export function SubscriptionTable({ 
  subscriptions, 
  onSuspend, 
  onCancel, 
  onReactivate,
  onUpgrade,
  isLoading = false 
}: SubscriptionTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center shadow-sm">
        <p className="text-[#6B7280]">No subscriptions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#E5E7EB] bg-[#F5F6FA]">
        <h3 className="font-semibold text-[#111827]">All Subscriptions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#FAFBFC]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Tenant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Period End</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {subscriptions.map((sub) => (
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
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                    className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium"
                  >
                    Manage
                  </button>
                  {expandedId === sub.id && (
                    <div className="absolute mt-2 bg-white rounded-lg border border-[#E5E7EB] shadow-lg p-2 w-48 z-10">
                      {sub.status === 'active' && (
                        <>
                          <button 
                            onClick={() => onSuspend?.(sub.id)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-[#F5F6FA] rounded transition-colors text-[#EA580C]"
                          >
                            Suspend
                          </button>
                          <button 
                            onClick={() => onCancel?.(sub.id)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-[#F5F6FA] rounded transition-colors text-[#DC2626]"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {sub.status === 'past_due' && (
                        <button 
                          onClick={() => onReactivate?.(sub.id)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#F5F6FA] rounded transition-colors text-[#16A34A]"
                        >
                          Reactivate
                        </button>
                      )}
                      <button 
                        onClick={() => onUpgrade?.(sub.id, 'PROFESSIONAL')}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-[#F5F6FA] rounded transition-colors text-[#2563EB]"
                      >
                        Upgrade Plan
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}