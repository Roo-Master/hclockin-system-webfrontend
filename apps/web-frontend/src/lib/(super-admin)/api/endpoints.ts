export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    verify: '/auth/verify',
    refresh: '/auth/refresh',
  },

  // Tenants
  tenants: {
    list: '/tenants',
    create: '/tenants',
    get: (id: string) => `/tenants/${id}`,
    update: (id: string) => `/tenants/${id}`,
    delete: (id: string) => `/tenants/${id}`,
    suspend: (id: string) => `/tenants/${id}/suspend`,
    activate: (id: string) => `/tenants/${id}/activate`,
  },

  // Admins
  admins: {
    list: '/super-admin/admins',
    create: '/super-admin/admins',
    get: (id: string) => `/super-admin/admins/${id}`,
    update: (id: string) => `/super-admin/admins/${id}`,
    delete: (id: string) => `/super-admin/admins/${id}`,
    toggleStatus: (id: string) => `/super-admin/admins/${id}/status`,
    updateRole: (id: string) => `/super-admin/admins/${id}/role`,
  },

  // Feature Flags
  featureFlags: {
    list: '/feature-flags',
    create: '/feature-flags',
    get: (id: string) => `/feature-flags/${id}`,
    update: (id: string) => `/feature-flags/${id}`,
    delete: (id: string) => `/feature-flags/${id}`,
    toggleGlobal: (id: string) => `/feature-flags/${id}/global`,
    toggleTenant: (id: string, tenantId: string) => `/feature-flags/${id}/tenants/${tenantId}`,
  },

  // Billing
  billing: {
    summary: '/admin/billing/summary',
    plans: {
      list: '/admin/billing/plans',
      update: (id: string) => `/admin/billing/plans/${id}`,
    },
    invoices: {
      markPaid: (id: string) => `/admin/billing/invoices/${id}/mark-paid`,
      remind: (id: string) => `/admin/billing/invoices/${id}/remind`,
    },
    transactions: {
      list: '/admin/billing/transactions',
      export: '/admin/billing/transactions/export',
    },
    subscription: {
      pause: (tenantId: string) => `/billing/subscription/${tenantId}/pause`,
      resume: (tenantId: string) => `/billing/subscription/${tenantId}/resume`,
      cancel: (tenantId: string) => `/billing/subscription/${tenantId}/cancel`,
    },
  },

  // System Monitor
  systemMonitor: {
    status: '/super-admin/system-monitor',
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
