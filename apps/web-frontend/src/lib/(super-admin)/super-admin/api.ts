const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function superAdminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE}/api/super-admin${path}`;
  console.log('[superAdminFetch]', url);
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // TODO: attach super admin JWT
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`Super admin API error: ${res.status}`);
  return res.json();
}

export const superAdminApi = {
  // Stats
  getStats: () => superAdminFetch('/stats'),
  getMrr:   () => superAdminFetch('/stats/mrr'),

  // Tenants
  getTenants: (params?: { status?: string; plan?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return superAdminFetch(`/tenants${q ? `?${q}` : ''}`);
  },
  getTenant:        (id: string) => superAdminFetch(`/tenants/${id}`),
  createTenant:     (dto: any)   => superAdminFetch('/tenants', { method: 'POST', body: JSON.stringify(dto) }),
  suspendTenant:    (id: string, reason: string) =>
    superAdminFetch(`/tenants/${id}/suspend`,    { method: 'PATCH', body: JSON.stringify({ reason }) }),
  reactivateTenant: (id: string) =>
    superAdminFetch(`/tenants/${id}/reactivate`, { method: 'PATCH' }),

  // Impersonation
  startImpersonation: (tenantId: string, reason: string) =>
    superAdminFetch(`/impersonate/${tenantId}`, { method: 'POST', body: JSON.stringify({ reason }) }),
  endImpersonation: () => superAdminFetch('/impersonate/end', { method: 'DELETE' }),

  // Feature flags
  getFlags:    (tenantId: string) => superAdminFetch(`/feature-flags/${tenantId}`),
  updateFlags: (tenantId: string, flags: Record<string, boolean>) =>
    superAdminFetch(`/feature-flags/${tenantId}`, { method: 'PATCH', body: JSON.stringify(flags) }),

  // Notifications
  getNotifications:    () => superAdminFetch('/notifications'),
  getUnreadCount:      () => superAdminFetch<{ unreadCount: number }>('/notifications/unread-count'),
  markAllAsRead:       () => superAdminFetch('/notifications', { method: 'POST' }),
  markNotification:    (id: string, read: boolean) =>
    superAdminFetch(`/notifications/${id}`, { method: 'PATCH', body: JSON.stringify({ read }) }),
  dismissNotification: (id: string) =>
    superAdminFetch(`/notifications/${id}`, { method: 'DELETE' }),
};