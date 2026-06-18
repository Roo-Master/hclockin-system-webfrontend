import { useState, useEffect, useCallback } from 'react';
import { Admin, AdminRole, AdminStatus } from '@/types/(super-admin)/admin';
import { useApi } from './useApi';
import { useToast } from '@/contexts/(super-admin)';

interface AdminFilters {
  search?: string;
  role?: AdminRole | 'all';
  status?: AdminStatus | 'all';
  tenantId?: string;
}

interface Tenant {
  id: string;
  name: string;
  shortCode: string;
  color: string;
}

interface UseAdminsResult {
  admins: Admin[];
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
  filters: AdminFilters;
  setFilters: (filters: AdminFilters) => void;
  refresh: () => Promise<void>;
  inviteAdmin: (data: { email: string; role: AdminRole; tenantId: string }) => Promise<void>;
  toggleAdminStatus: (id: string, status: AdminStatus) => Promise<void>;
  updateAdminRole: (id: string, role: AdminRole) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
}

export function useAdmins(initialFilters: AdminFilters = {}): UseAdminsResult {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filters, setFilters] = useState<AdminFilters>(initialFilters);
  const { loading, error, execute } = useApi();
  const { showToast } = useToast();

  const loadAdmins = useCallback(async () => {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.role && filters.role !== 'all') queryParams.append('role', filters.role);
    if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.tenantId) queryParams.append('tenantId', filters.tenantId);

    const result = await execute(async () => {
      const [adminsRes, tenantsRes] = await Promise.all([
        fetch(`/api/super-admin/admins?${queryParams.toString()}`),
        fetch('/api/tenants?limit=1000'),
      ]);

      const adminsData = await adminsRes.json();
      const tenantsData = await tenantsRes.json();

      if (!adminsRes.ok) {
        return {
          data: null,
          error: adminsData.message || 'Failed to load admins',
          status: adminsRes.status,
          success: false,
        };
      }

      return {
        data: {
          admins: adminsData.admins || adminsData || [],
          tenants: tenantsData.tenants || tenantsData || [],
        },
        status: adminsRes.status,
        success: true,
      };
    });

    if (result.data) {
      setAdmins(result.data.admins);
      setTenants(result.data.tenants);
    }

    return result;
  }, [execute, filters]);

  const inviteAdmin = useCallback(
    async (data: { email: string; role: AdminRole; tenantId: string }) => {
      const result = await execute(async () => {
        const response = await fetch('/api/super-admin/admins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: responseData.message || 'Failed to invite admin',
            status: response.status,
            success: false,
          };
        }

        return {
          data: responseData,
          status: response.status,
          success: true,
        };
      });

      if (result.success) {
        await loadAdmins();
        showToast('Admin invited successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to invite admin', 'error');
      }
    },
    [execute, loadAdmins, showToast]
  );

  const toggleAdminStatus = useCallback(
    async (id: string, status: AdminStatus) => {
      const result = await execute(async () => {
        const response = await fetch(`/api/super-admin/admins/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: responseData.message || 'Failed to update admin status',
            status: response.status,
            success: false,
          };
        }

        return {
          data: responseData,
          status: response.status,
          success: true,
        };
      });

      if (result.success) {
        await loadAdmins();
        showToast(`Admin ${status === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
      } else {
        showToast(result.error || 'Failed to update admin status', 'error');
      }
    },
    [execute, loadAdmins, showToast]
  );

  const updateAdminRole = useCallback(
    async (id: string, role: AdminRole) => {
      const result = await execute(async () => {
        const response = await fetch(`/api/super-admin/admins/${id}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: responseData.message || 'Failed to update admin role',
            status: response.status,
            success: false,
          };
        }

        return {
          data: responseData,
          status: response.status,
          success: true,
        };
      });

      if (result.success) {
        await loadAdmins();
        showToast('Admin role updated successfully', 'success');
      } else {
        showToast(result.error || 'Failed to update admin role', 'error');
      }
    },
    [execute, loadAdmins, showToast]
  );

  const deleteAdmin = useCallback(
    async (id: string) => {
      const result = await execute(async () => {
        const response = await fetch(`/api/super-admin/admins/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const responseData = await response.json();
          return {
            data: null,
            error: responseData.message || 'Failed to delete admin',
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
        await loadAdmins();
        showToast('Admin removed successfully', 'success');
      } else {
        showToast(result.error || 'Failed to delete admin', 'error');
      }
    },
    [execute, loadAdmins, showToast]
  );

  // Load data on mount or filter change
  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  return {
    admins,
    tenants,
    loading,
    error,
    filters,
    setFilters,
    refresh: loadAdmins,
    inviteAdmin,
    toggleAdminStatus,
    updateAdminRole,
    deleteAdmin,
  };
}
