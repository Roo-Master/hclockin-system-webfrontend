import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/(super-admin)/useApi';

interface TenantOverride {
  tenantId: string;
  enabled: boolean;
}

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'attendance' | 'notifications' | 'auth' | 'reporting' | 'experimental';
  strategy: 'global' | 'per_tenant' | 'percentage';
  globalEnabled: boolean;
  percentage?: number;
  tenantOverrides: TenantOverride[];
  lastModified: string;
  modifiedBy: string;
  stable: boolean;
}

interface Tenant {
  id: string;
  name: string;
  shortCode: string;
  color: string;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const { loading, error, execute } = useApi();

  const loadData = useCallback(async () => {
    const result = await execute(async () => {
      const [flagsRes, tenantsRes] = await Promise.all([
        fetch('/api/feature-flags'),
        fetch('/api/tenants'),
      ]);

      const flagsData = await flagsRes.json();
      const tenantsData = await tenantsRes.json();

      if (!flagsRes.ok) {
        return {
          data: null,
          error: flagsData.message || 'Failed to load feature flags',
          status: flagsRes.status,
          success: false,
        };
      }

      if (!tenantsRes.ok) {
        return {
          data: null,
          error: tenantsData.message || 'Failed to load tenants',
          status: tenantsRes.status,
          success: false,
        };
      }

      return {
        data: {
          flags: flagsData.flags || flagsData,
          tenants: tenantsData.tenants || tenantsData,
        },
        status: 200,
        success: true,
      };
    });

    if (result.data) {
      setFlags(result.data.flags);
      setTenants(result.data.tenants);
    }

    return result;
  }, [execute]);

  const toggleGlobal = useCallback(
    async (flagId: string, enabled: boolean) => {
      const result = await execute(async () => {
        const response = await fetch(`/api/feature-flags/${flagId}/global`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: data.message || 'Failed to update flag',
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
        await loadData();
      }

      return result;
    },
    [execute, loadData]
  );

  const toggleTenant = useCallback(
    async (flagId: string, tenantId: string, enabled: boolean) => {
      const result = await execute(async () => {
        const response = await fetch(`/api/feature-flags/${flagId}/tenants/${tenantId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: data.message || 'Failed to update tenant flag',
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
        await loadData();
      }

      return result;
    },
    [execute, loadData]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    flags,
    tenants,
    loading,
    error,
    refresh: loadData,
    toggleGlobal,
    toggleTenant,
  };
}
