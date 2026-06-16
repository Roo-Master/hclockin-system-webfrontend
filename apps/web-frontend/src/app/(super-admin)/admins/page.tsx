'use client';

import { useEffect, useMemo, useState } from 'react';

type AdminRole = 'super_admin' | 'hospital_admin' | 'hr_manager' | 'auditor';
type AdminStatus = 'active' | 'inactive' | 'pending';

interface Tenant {
  id: string;
  name: string;
  shortCode: string;
  color: string;
}

interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  tenantId: string;
  lastLogin: string;
  joinedAt: string;
  avatarInitials: string;
}

const ROLE_META: Record<AdminRole, { label: string; cls: string }> = {
  super_admin: { label: 'Super Admin', cls: 'bg-violet-500/15 text-violet-400 border border-violet-500/30' },
  hospital_admin: { label: 'Hospital Admin', cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
  hr_manager: { label: 'HR Manager', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  auditor: { label: 'Auditor', cls: 'bg-amber-400/15 text-amber-400 border border-amber-400/30' },
};

const STATUS_META: Record<AdminStatus, { label: string; dot: string; text: string }> = {
  active: { label: 'Active', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  inactive: { label: 'Inactive', dot: 'bg-slate-500', text: 'text-slate-500' },
  pending: { label: 'Pending', dot: 'bg-amber-400', text: 'text-amber-400' },
};

const PLACEHOLDER_TENANTS: Tenant[] = [
  { id: 'all', name: 'All Hospitals', shortCode: 'ALL', color: 'bg-slate-500' },
  { id: 'loading-1', name: 'Loading...', shortCode: '---', color: 'bg-slate-700' },
];

const PLACEHOLDER_ADMINS: Admin[] = [
  { id: 'p1', name: 'Loading admin...', email: 'loading@example.com', role: 'hospital_admin', status: 'pending', tenantId: 'loading-1', lastLogin: '—', joinedAt: '—', avatarInitials: 'LD' },
  { id: 'p2', name: 'Loading admin...', email: 'loading@example.com', role: 'hr_manager', status: 'pending', tenantId: 'loading-1', lastLogin: '—', joinedAt: '—', avatarInitials: 'LD' },
  { id: 'p3', name: 'Loading admin...', email: 'loading@example.com', role: 'auditor', status: 'pending', tenantId: 'loading-1', lastLogin: '—', joinedAt: '—', avatarInitials: 'LD' },
];

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`h-8 w-8 rounded-lg ${color} bg-opacity-20 border border-white/10 flex items-center justify-center shrink-0`}>
      <span className="text-[11px] font-bold font-mono text-white/80 tracking-wide">{initials}</span>
    </div>
  );
}

function TenantBadge({ tenant }: { tenant: Tenant }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${tenant.color}`} />
      <span className="text-[11px] font-mono text-slate-500">{tenant.shortCode}</span>
    </div>
  );
}

function InviteModal({ onClose, tenants }: { onClose: () => void; tenants: Tenant[] }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('hr_manager');
  const [tenant, setTenant] = useState('all');
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!email.trim()) return;
    setSent(true);
    setTimeout(onClose, 1400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0f1422] shadow-2xl flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Chronos · Admin</p>
            <h2 className="text-lg font-bold text-slate-100 mt-0.5">Invite Admin</h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-500 hover:text-slate-300 flex items-center justify-center transition-colors text-lg leading-none">×</button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-xl">✓</span>
            </div>
            <p className="text-sm text-emerald-400 font-medium">Invitation sent</p>
            <p className="text-xs text-slate-500">{email}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Email address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="admin@hospital.org"
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors font-mono appearance-none"
                >
                  <option value="hospital_admin">Hospital Admin</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Hospital</label>
                <select
                  value={tenant}
                  onChange={(e) => setTenant(e.target.value)}
                  className="bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors font-mono appearance-none"
                >
                  {tenants.filter((t) => t.id !== 'all').map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.shortCode} — {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-sm transition-colors">
                Cancel
              </button>
              <button onClick={handleSend} disabled={!email.trim()} className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
                Send invite
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AdminRow({ admin, tenant, onToggleStatus }: { admin: Admin; tenant: Tenant; onToggleStatus: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const role = ROLE_META[admin.role];
  const status = STATUS_META[admin.status];

  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar initials={admin.avatarInitials} color={tenant.color} />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-slate-200 truncate">{admin.name}</span>
            <span className="text-[11px] font-mono text-slate-500 truncate">{admin.email}</span>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 hidden sm:table-cell">
        <TenantBadge tenant={tenant} />
      </td>

      <td className="px-4 py-3 hidden md:table-cell">
        <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-1 rounded ${role.cls}`}>
          {role.label}
        </span>
      </td>

      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot} ${admin.status === 'active' ? 'animate-pulse' : ''}`} />
          <span className={`text-[11px] font-mono ${status.text}`}>{status.label}</span>
        </div>
      </td>

      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-[11px] font-mono text-slate-500">{admin.lastLogin}</span>
      </td>

      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-[11px] font-mono text-slate-500">{admin.joinedAt}</span>
      </td>

      <td className="px-4 py-3">
        <div className="relative flex items-center justify-end">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="h-7 w-7 rounded-md border border-transparent hover:border-slate-700 hover:bg-slate-800 text-slate-600 hover:text-slate-300 flex items-center justify-center transition-all text-base opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            ⋯
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-slate-700 bg-[#0f1422] shadow-xl overflow-hidden">
                <button className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors font-mono">
                  View profile
                </button>
                <button className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors font-mono">
                  Edit role
                </button>
                <button
                  onClick={() => {
                    onToggleStatus(admin.id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-xs hover:bg-slate-800 transition-colors font-mono text-amber-400"
                >
                  {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <div className="border-t border-slate-800" />
                <button className="w-full text-left px-3 py-2.5 text-xs text-red-400 hover:bg-slate-800 transition-colors font-mono">
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
  const [admins, setAdmins] = useState<Admin[]>(PLACEHOLDER_ADMINS);
  const [tenants, setTenants] = useState<Tenant[]>(PLACEHOLDER_TENANTS);
  const [selectedTenant, setSelectedTenant] = useState('all');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminRole | 'all'>('all');
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/super-admin/admins', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        setAdmins(json?.admins?.length ? json.admins : PLACEHOLDER_ADMINS);
        setTenants(
          json?.tenants?.length
            ? [{ id: 'all', name: 'All Hospitals', shortCode: 'ALL', color: 'bg-slate-500' }, ...json.tenants]
            : PLACEHOLDER_TENANTS
        );
      } catch {
        setAdmins(PLACEHOLDER_ADMINS);
        setTenants(PLACEHOLDER_TENANTS);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  function toggleStatus(id: string) {
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a))
    );
  }

  const filtered = useMemo(() => {
    return admins.filter((a) => {
      const matchTenant = selectedTenant === 'all' || a.tenantId === selectedTenant;
      const matchSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || a.role === roleFilter;
      return matchTenant && matchSearch && matchRole;
    });
  }, [admins, selectedTenant, search, roleFilter]);

  const totalActive = admins.filter((a) => a.status === 'active').length;
  const totalPending = admins.filter((a) => a.status === 'pending').length;
  const totalHospitals = tenants.filter((t) => t.id !== 'all').length;

  function getTenant(id: string) {
    return tenants.find((t) => t.id === id) ?? tenants[0];
  }

  const tenantsForInvite = useMemo(() => tenants.filter((t) => t.id !== 'all'), [tenants]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Chronos · Platform</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage hospital administrators across all tenants.</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 transition-colors rounded-lg text-sm font-semibold text-white self-start sm:self-auto shrink-0"
        >
          <span className="text-base leading-none">+</span>
          Invite admin
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active admins', value: totalActive, color: 'text-emerald-400' },
          { label: 'Pending invites', value: totalPending, color: 'text-amber-400' },
          { label: 'Hospitals', value: totalHospitals, color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col gap-1">
            <span className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {tenants.map((t) => {
          const count = t.id === 'all' ? admins.length : admins.filter((a) => a.tenantId === t.id).length;
          const active = selectedTenant === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTenant(t.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                active
                  ? 'border-slate-600 bg-slate-800 text-slate-100'
                  : 'border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${t.color}`} />
              {t.shortCode}
              <span className={`${active ? 'bg-slate-700 text-slate-300' : 'bg-slate-900 text-slate-600'} rounded px-1 py-px text-[10px]`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm pointer-events-none">⌕</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-8 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors font-mono"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as AdminRole | 'all')}
          className="bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:border-slate-600 transition-colors font-mono appearance-none min-w-[160px]"
        >
          <option value="all">All roles</option>
          <option value="hospital_admin">Hospital Admin</option>
          <option value="hr_manager">HR Manager</option>
          <option value="auditor">Auditor</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-normal">Admin</th>
                <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-normal hidden sm:table-cell">Hospital</th>
                <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-normal hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-normal hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-normal hidden lg:table-cell">Last login</th>
                <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-normal hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="px-4 py-4" colSpan={7}>
                      <div className="h-6 rounded bg-slate-800/60 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-slate-500 text-sm font-mono">No admins match your filters.</p>
                    <p className="text-slate-600 text-xs font-mono mt-1">Try adjusting the search or role filter.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((admin) => (
                  <AdminRow
                    key={admin.id}
                    admin={admin}
                    tenant={getTenant(admin.tenantId)}
                    onToggleStatus={toggleStatus}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-800 px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600">
            Showing {filtered.length} of {admins.length} admins
          </span>
          <span className="text-[11px] font-mono text-slate-600">
            {selectedTenant !== 'all' ? getTenant(selectedTenant).name : ''}
          </span>
        </div>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} tenants={tenants} />}
    </div>
  );
}