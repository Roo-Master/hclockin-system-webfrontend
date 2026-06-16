'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useToast } from '@/contexts';
import { useAdmins } from '@/hooks/useAdmins';
import { Button, Card, Input, Select, Avatar, StatusBadge } from '@/components/common';
import { Admin, AdminRole, AdminStatus } from '@/types/admin';
import { Tenant } from '@/types/tenant';

// ─── Components ───────────────────────────────────────────────────────────

function InviteModal({ 
  onClose, 
  tenants,
  onInvite,
  loading 
}: { 
  onClose: () => void; 
  tenants: Tenant[];
  onInvite: (data: { email: string; role: AdminRole; tenantId: string }) => Promise<void>;
  loading: boolean;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('hr_manager');
  const [tenantId, setTenantId] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim() || !tenantId) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await onInvite({ email, role, tenantId });
      setSent(true);
      setTimeout(onClose, 1400);
    } catch (err) {
      setError('Failed to send invitation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface shadow-xl flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wider text-text-secondary">Chronos · Admin</p>
            <h2 className="text-lg font-semibold text-text-primary mt-0.5">Invite Admin</h2>
          </div>
          <button 
            onClick={onClose} 
            className="h-8 w-8 rounded-lg border border-border hover:border-text-secondary text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="h-10 w-10 rounded-full bg-success-bg border border-success/30 flex items-center justify-center">
              <span className="text-success text-xl">✓</span>
            </div>
            <p className="text-sm text-success font-medium">Invitation sent</p>
            <p className="text-xs text-text-secondary">{email}</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-danger-bg border border-danger/30 rounded-lg p-3 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-secondary">Email address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="admin@hospital.org"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-info focus:ring-2 focus:ring-info-bg transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-text-secondary">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-info focus:ring-2 focus:ring-info-bg transition-colors appearance-none bg-white"
                >
                  <option value="hospital_admin">Hospital Admin</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-text-secondary">Hospital</label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-info focus:ring-2 focus:ring-info-bg transition-colors appearance-none bg-white"
                >
                  <option value="">Select a hospital...</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button 
                onClick={onClose} 
                className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSend} 
                disabled={!email.trim() || !tenantId || loading} 
                className="flex-1 py-2.5 rounded-lg bg-info hover:bg-info/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {loading ? 'Sending...' : 'Send invite'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AdminRow({ 
  admin, 
  tenant, 
  onToggleStatus,
  onEdit,
  onDelete
}: { 
  admin: Admin; 
  tenant: Tenant; 
  onToggleStatus: (id: string) => void;
  onEdit: (admin: Admin) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <tr className="border-b border-border hover:bg-page/50 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar 
            name={admin.name} 
            size="sm"
            className="bg-info-bg text-info border border-info/20"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-text-primary truncate">{admin.name}</span>
            <span className="text-[11px] font-medium text-text-secondary truncate">{admin.email}</span>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${tenant.color || 'bg-text-tertiary'}`} />
          <span className="text-[11px] font-medium text-text-secondary">{tenant.shortCode}</span>
        </div>
      </td>

      <td className="px-4 py-3 hidden md:table-cell">
        <StatusBadge status={admin.role} label={admin.role} size="sm" />
      </td>

      <td className="px-4 py-3 hidden sm:table-cell">
        <StatusBadge status={admin.status} size="sm" />
      </td>

      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-[11px] font-medium text-text-secondary">{admin.lastLogin || 'Never'}</span>
      </td>

      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-[11px] font-medium text-text-secondary">{admin.joinedAt}</span>
      </td>

      <td className="px-4 py-3">
        <div className="relative flex items-center justify-end">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="h-7 w-7 rounded-md border border-transparent hover:border-border hover:bg-page text-text-secondary hover:text-text-primary flex items-center justify-center transition-all text-base opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Admin actions menu"
          >
            ⋯
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-border bg-surface shadow-xl overflow-hidden">
                <button 
                  onClick={() => { onEdit(admin); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 text-xs text-text-primary hover:bg-page transition-colors font-medium"
                >
                  Edit role
                </button>
                <button
                  onClick={() => {
                    onToggleStatus(admin.id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-xs hover:bg-page transition-colors font-medium text-warning"
                >
                  {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <div className="border-t border-border" />
                <button 
                  onClick={() => { onDelete(admin.id); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 text-xs text-danger hover:bg-page transition-colors font-medium"
                >
                  Remove admin
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AdminsPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('all');
  const [roleFilter, setRoleFilter] = useState<AdminRole | 'all'>('all');
  
  const { 
    admins, 
    tenants, 
    loading, 
    error, 
    filters,
    setFilters,
    refresh,
    inviteAdmin,
    toggleAdminStatus,
    updateAdminRole,
    deleteAdmin 
  } = useAdmins();
  
  const { showToast } = useToast();

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setFilters({ ...filters, search: value });
  }, [filters, setFilters]);

  // Handle tenant filter
  const handleTenantFilter = useCallback((tenantId: string) => {
    setSelectedTenant(tenantId);
    setFilters({ ...filters, tenantId: tenantId === 'all' ? undefined : tenantId });
  }, [filters, setFilters]);

  // Handle role filter
  const handleRoleFilter = useCallback((role: AdminRole | 'all') => {
    setRoleFilter(role);
    setFilters({ ...filters, role });
  }, [filters, setFilters]);

  // Handle invite admin
  const handleInvite = useCallback(async (data: { email: string; role: AdminRole; tenantId: string }) => {
    try {
      await inviteAdmin(data);
      showToast('Invitation sent successfully!', 'success');
      setShowInvite(false);
      refresh();
    } catch (err) {
      showToast('Failed to send invitation', 'error');
      throw err;
    }
  }, [inviteAdmin, showToast, refresh]);

  // Handle toggle status
  const handleToggleStatus = useCallback(async (id: string) => {
    try {
      const admin = admins.find(a => a.id === id);
      if (!admin) return;
      const newStatus: AdminStatus = admin.status === 'active' ? 'inactive' : 'active';
      await toggleAdminStatus(id, newStatus);
      showToast(`Admin ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
      refresh();
    } catch (err) {
      showToast('Failed to update admin status', 'error');
    }
  }, [admins, toggleAdminStatus, showToast, refresh]);

  // Handle edit role
  const handleEdit = useCallback((admin: Admin) => {
    // This would open a modal to edit role
    showToast('Edit role functionality coming soon', 'info');
  }, [showToast]);

  // Handle delete
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to remove this admin?')) return;
    try {
      await deleteAdmin(id);
      showToast('Admin removed successfully', 'success');
      refresh();
    } catch (err) {
      showToast('Failed to remove admin', 'error');
    }
  }, [deleteAdmin, showToast, refresh]);

  // Calculate stats
  const totalActive = admins.filter((a) => a.status === 'active').length;
  const totalPending = admins.filter((a) => a.status === 'pending').length;
  const totalHospitals = tenants.filter((t) => t.id !== 'all').length;

  // Get tenant by id
  const getTenant = useCallback((id: string) => {
    return tenants.find((t) => t.id === id) ?? tenants[0];
  }, [tenants]);

  // Filter admins for display
  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const matchTenant = selectedTenant === 'all' || a.tenantId === selectedTenant;
      const matchSearch = !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || a.role === roleFilter;
      return matchTenant && matchSearch && matchRole;
    });
  }, [admins, selectedTenant, search, roleFilter]);

  // Refresh data on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-danger-bg border border-danger/30 rounded-xl p-4 text-danger">
          <p className="font-medium">Error loading admins</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={refresh}
            className="mt-3 px-4 py-2 bg-info text-white rounded-lg text-sm font-medium hover:bg-info/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider text-text-secondary">Chronos · Platform</p>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Admin Accounts</h1>
          <p className="text-sm text-text-secondary mt-1">Manage hospital administrators across all tenants.</p>
        </div>
        <Button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-info hover:bg-info/90 transition-colors rounded-lg text-sm font-medium text-white self-start sm:self-auto shrink-0"
        >
          <span className="text-base leading-none">+</span>
          Invite admin
        </Button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active admins', value: totalActive, color: 'text-success' },
          { label: 'Pending invites', value: totalPending, color: 'text-warning' },
          { label: 'Hospitals', value: totalHospitals, color: 'text-info' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            <span className="text-[12px] font-medium uppercase tracking-wider text-text-secondary block mt-1">{s.label}</span>
          </Card>
        ))}
      </div>

      {/* Tenant Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {tenants.map((t) => {
          const count = t.id === 'all' ? admins.length : admins.filter((a) => a.tenantId === t.id).length;
          const active = selectedTenant === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTenantFilter(t.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                active
                  ? 'border-info bg-info-bg text-info'
                  : 'border-border bg-white text-text-secondary hover:text-text-primary hover:border-text-secondary'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${t.color || 'bg-text-tertiary'}`} />
              {t.shortCode}
              <span className={`${active ? 'bg-info/10 text-info' : 'bg-page text-text-secondary'} rounded px-1.5 py-px text-[10px] font-medium`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm pointer-events-none">⌕</span>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full border border-border rounded-lg pl-8 pr-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-info focus:ring-2 focus:ring-info-bg transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => handleRoleFilter(e.target.value as AdminRole | 'all')}
          className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-info focus:ring-2 focus:ring-info-bg transition-colors appearance-none bg-white min-w-[160px]"
        >
          <option value="all">All roles</option>
          <option value="hospital_admin">Hospital Admin</option>
          <option value="hr_manager">HR Manager</option>
          <option value="auditor">Auditor</option>
        </select>
      </div>

      {/* Admins Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-page">
                <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary">Admin</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary hidden sm:table-cell">Hospital</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary hidden lg:table-cell">Last login</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium text-text-secondary hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-4" colSpan={7}>
                      <div className="h-6 rounded bg-page animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-text-secondary text-sm font-medium">No admins match your filters.</p>
                    <p className="text-text-tertiary text-xs font-medium mt-1">Try adjusting the search or role filter.</p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <AdminRow
                    key={admin.id}
                    admin={admin}
                    tenant={getTenant(admin.tenantId)}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-page/50">
          <span className="text-[11px] font-medium text-text-secondary">
            Showing {filteredAdmins.length} of {admins.length} admins
          </span>
          <span className="text-[11px] font-medium text-text-secondary">
            {selectedTenant !== 'all' ? getTenant(selectedTenant).name : 'All Hospitals'}
          </span>
        </div>
      </div>

      {showInvite && (
        <InviteModal 
          onClose={() => setShowInvite(false)} 
          tenants={tenants} 
          onInvite={handleInvite}
          loading={false}
        />
      )}
    </div>
  );
}