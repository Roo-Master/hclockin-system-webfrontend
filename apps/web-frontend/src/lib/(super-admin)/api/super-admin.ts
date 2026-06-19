import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'DELETED';
  plan: string;
  staffCount: number;
  adminEmail: string;
  mrr: number;
  createdAt: string;
  updatedAt?: string;
  country?: string;
  lastActive?: string;
  contactName?: string;
  notes?: string;
}

export interface TenantStats {
  userCount: number;
  departmentCount: number;
  clockInsToday: number;
  clockInsThisMonth: number;
  activeUsers: number;
}

export const superAdminApi = {
  // Dashboard stats
  getDashboardStats: async () => {
    const response = await apiClient.get('/super-admin/stats');
    return response.data;
  },

  // Tenants
  getTenants: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get('/super-admin/tenants', { params });
    return response.data;
  },

  getTenant: async (id: string) => {
    const response = await apiClient.get(`/super-admin/tenants/${id}`);
    return response.data;
  },

  getTenantStats: async (id: string) => {
    const response = await apiClient.get(`/super-admin/tenants/${id}/stats`);
    return response.data;
  },

  createTenant: async (data: { name: string; slug: string; planId: string }) => {
    const response = await apiClient.post('/super-admin/tenants', data);
    return response.data;
  },

  updateTenant: async (id: string, data: Partial<Tenant>) => {
    const response = await apiClient.patch(`/super-admin/tenants/${id}`, data);
    return response.data;
  },

  suspendTenant: async (id: string) => {
    const response = await apiClient.put(`/super-admin/tenants/${id}/suspend`);
    return response.data;
  },

  activateTenant: async (id: string) => {
    const response = await apiClient.put(`/super-admin/tenants/${id}/activate`);
    return response.data;
  },

  deleteTenant: async (id: string) => {
    const response = await apiClient.delete(`/super-admin/tenants/${id}`);
    return response.data;
  },

  // Plans
  getPlans: async () => {
    const response = await apiClient.get('/super-admin/plans');
    return response.data;
  },

  // Feature Flags
  getFeatureFlags: async () => {
    const response = await apiClient.get('/super-admin/feature-flags');
    return response.data;
  },

  updateFeatureFlag: async (key: string, enabled: boolean) => {
    const response = await apiClient.patch(`/super-admin/feature-flags/${key}`, { enabled });
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params?: { page?: number; limit?: number; tenantId?: string }) => {
    const response = await apiClient.get('/super-admin/audit-logs', { params });
    return response.data;
  },

  // Impersonation
  impersonateTenantAdmin: async (tenantId: string, adminId: string) => {
    const response = await apiClient.post('/super-admin/impersonate', { tenantId, adminId });
    return response.data;
  },

  stopImpersonation: async () => {
    const response = await apiClient.post('/super-admin/impersonate/stop');
    return response.data;
  },
};