import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/(super-admin)/useApi';

interface BillingSummary {
  kpis: {
    mrr: number;
    arr: number;
    payingTenants: number;
    overdueAmount: number;
    overdueAccounts: number;
    trialTenants: number;
  };
  mrrTrend: Array<{
    month: string;
    mrr: number;
    newRevenue: number;
    churn: number;
  }>;
  planRevenue: Array<{
    plan: string;
    tenants: number;
    mrr: number;
    color: string;
  }>;
  overdueAccounts: Array<{
    id: string;
    name: string;
    amount: number;
    daysOverdue: number;
    email: string;
    invoiceId: string;
  }>;
  recentTransactions: Array<{
    id: string;
    tenant: string;
    amount: number;
    date: string;
    status: 'paid' | 'overdue' | 'pending' | 'failed';
    invoice: string;
  }>;
}

export function useBilling() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const { loading, error, execute } = useApi();

  const loadSummary = useCallback(async () => {
    const result = await execute(async () => {
      const response = await fetch('/api/admin/billing/summary', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: data.message || 'Failed to load billing summary',
          status: response.status,
          success: false,
        };
      }

      return {
        data: data,
        status: response.status,
        success: true,
      };
    });

    if (result.data) {
      setSummary(result.data);
    }

    return result;
  }, [execute]);

  const updatePlan = useCallback(
    async (planId: string, planData: { monthlyPrice?: number; annualPrice?: number }) => {
      const result = await execute(async () => {
        const response = await fetch(`/api/admin/billing/plans/${planId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(planData),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: data.message || 'Failed to update plan',
            status: response.status,
            success: false,
          };
        }

        return {
          data: data,
          status: response.status,
          success: true,
        };
      });

      if (result.success) {
        await loadSummary();
      }

      return result;
    },
    [execute, loadSummary]
  );

  const sendReminder = useCallback(
    async (invoiceId: string) => {
      const result = await execute(async () => {
        const response = await fetch(`/api/admin/billing/invoices/${invoiceId}/remind`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          return {
            data: null,
            error: data.message || 'Failed to send reminder',
            status: response.status,
            success: false,
          };
        }

        return {
          data: null,
          status: response.status,
          success: true,
        };
      });

      if (result.success) {
        await loadSummary();
      }

      return result;
    },
    [execute, loadSummary]
  );

  const markInvoicePaid = useCallback(
    async (invoiceId: string) => {
      const result = await execute(async () => {
        const response = await fetch(`/api/admin/billing/invoices/${invoiceId}/mark-paid`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          return {
            data: null,
            error: data.message || 'Failed to mark invoice as paid',
            status: response.status,
            success: false,
          };
        }

        return {
          data: null,
          status: response.status,
          success: true,
        };
      });

      if (result.success) {
        await loadSummary();
      }

      return result;
    },
    [execute, loadSummary]
  );

  const changeSubscriptionStatus = useCallback(
    async (tenantId: string, action: 'pause' | 'resume' | 'cancel') => {
      const result = await execute(async () => {
        const response = await fetch(`/api/billing/subscription/${tenantId}/${action}`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          return {
            data: null,
            error: data.message || `Failed to ${action} subscription`,
            status: response.status,
            success: false,
          };
        }

        return {
          data: null,
          status: response.status,
          success: true,
        };
      });

      if (result.success) {
        await loadSummary();
      }

      return result;
    },
    [execute, loadSummary]
  );

  const exportTransactions = useCallback(() => {
    window.location.href = '/api/admin/billing/transactions/export';
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    summary,
    loading,
    error,
    refresh: loadSummary,
    updatePlan,
    sendReminder,
    markInvoicePaid,
    changeSubscriptionStatus,
    exportTransactions,
  };
}
