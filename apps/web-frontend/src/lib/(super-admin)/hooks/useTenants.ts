import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/(super-admin)/useApi';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
  plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  staffCount: number;
  adminEmail: string;
  mrr: number;
  createdAt: string;
  trialEndsAt?: string | null;
  country: string;
  lastActive: string;
  contactName?: string | null;
  notes?: string | null;
}

interface TenantFilters {
  search?: string;
  status?: string;
  plan?: string;
  page?: number;
  limit?: number;
}

export function useTenants(initialFilters: TenantFilters = {}) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filters, setFilters] = useState<TenantFilters>(initialFilters);
  const [total, setTotal] = useState(0);
  const { loading, error, execute } = useApi();

  const loadTenants = useCallback(async () => {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status && filters.status !== 'ALL') queryParams.append('status', filters.status);
    if (filters.plan && filters.plan !== 'ALL') queryParams.append('plan', filters.plan);
    if (filters.page) queryParams.append('page', String(filters.page));
    if (filters.limit) queryParams.append('limit', String(filters.limit));

    const result = await execute(async () => {
      const response = await fetch(`/api/tenants?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: data.message || 'Failed to load tenants',
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
      setTenants(result.data.tenants || result.data);
      setTotal(result.data.total || (result.data.tenants?.length || result.data.length || 0));
    }

    return result;
  }, [execute, filters]);

  const createTenant = useCallback(
    async (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'lastActive'>) => {
      const result = await execute(async () => {
        const response = await fetch('/api/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tenantData),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: data.message || 'Failed to create tenant',
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
        await loadTenants();
      }

      return result;
    },
    [execute, loadTenants]
  );

  const updateTenant = useCallback(
    async (id: string, tenantData: Partial<Tenant>) => {
      const result = await execute(async () => {
        const response = await fetch(`/api/tenants/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tenantData),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: data.message || 'Failed to update tenant',
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
        await loadTenants();
      }

      return result;
    },
    [execute, loadTenants]
  );

  const deleteTenant = useCallback(
    async (id: string) => {
      const result = await execute(async () => {
        const response = await fetch(`/api/tenants/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          return {
            data: null,
            error: data.message || 'Failed to delete tenant',
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
        await loadTenants();
      }

      return result;
    },
    [execute, loadTenants]
  );

  const suspendTenant = useCallback(
    async (id: string) => {
      const result = await execute(async () => {
        const response = await fetch(`/api/tenants/${id}/suspend`, {
          method: 'POST',
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: data.message || 'Failed to suspend tenant',
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
        await loadTenants();
      }

      return result;
    },
    [execute, loadTenants]
  );

  const activateTenant = useCallback(
    async (id: string) => {
      const result = await execute(async () => {
        const response = await fetch(`/api/tenants/${id}/activate`, {
          method: 'POST',
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: data.message || 'Failed to activate tenant',
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
        await loadTenants();
      }

      return result;
    },
    [execute, loadTenants]
  );

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  return {
    tenants,
    total,
    loading,
    error,
    filters,
    setFilters,
    refresh: loadTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    suspendTenant,
    activateTenant,
  };
}
