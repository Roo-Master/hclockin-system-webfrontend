'use client';

import { useEffect, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  plan: PlanTier;
  staffCount: number;
  adminEmail: string;
  mrr: number;
  createdAt: string;
  trialEndsAt?: string;
}

// ── Semantic badge styles — §3.1 ──────────────────────────────────────────
// Fill (tint) paired with matching strong color text. Never plain black on tint.

const STATUS_STYLES: Record<TenantStatus, { wrap: string; dot?: string }> = {
  ACTIVE:    { wrap: 'bg-success-bg text-success border border-success/30', dot: 'bg-success' },
  TRIAL:     { wrap: 'bg-warning-bg text-warning border border-warning/30' },
  SUSPENDED: { wrap: 'bg-danger-bg  text-danger  border border-danger/30'  },
  CANCELLED: { wrap: 'bg-border     text-secondary'                         },
};

const PLAN_STYLES: Record<PlanTier, string> = {
  STARTER:      'bg-border text-secondary',
  PROFESSIONAL: 'bg-info-bg text-info',
  ENTERPRISE:   'bg-warning-bg text-warning',
};

// ── Badge components ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TenantStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill text-label font-medium ${s.wrap}`}>
      {s.dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} aria-hidden="true" />
      )}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function PlanBadge({ plan }: { plan: PlanTier }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-badge text-label font-medium ${PLAN_STYLES[plan]}`}>
      {plan.charAt(0) + plan.slice(1).toLowerCase()}
    </span>
  );
}

// ── Action menu ────────────────────────────────────────────────────────────

function ActionMenu({ tenant, onAction }: { tenant: Tenant; onAction: (a: string, t: Tenant) => void }) {
  const [open, setOpen] = useState(false);

  const items = [
    { label: 'View Details', action: 'view',        icon: 'ti-eye'         },
    { label: 'Impersonate',  action: 'impersonate', icon: 'ti-key'         },
    { label: 'Edit Plan',    action: 'edit-plan',   icon: 'ti-edit'        },
    {
      label:  tenant.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend',
      action: tenant.status === 'SUSPENDED' ? 'reactivate' : 'suspend',
      icon:   tenant.status === 'SUSPENDED' ? 'ti-circle-check' : 'ti-lock',
      danger: tenant.status !== 'SUSPENDED',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open actions menu"
        className="p-1.5 rounded-badge hover:bg-page text-secondary hover:text-primary transition-colors"
      >
        <i className="ti ti-dots-vertical text-base" aria-hidden="true" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 bg-surface border border-border rounded-card shadow-sm overflow-hidden">
            {items.map((item) => (
              <button
                key={item.action}
                onClick={() => { onAction(item.action, tenant); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-body text-left hover:bg-page transition-colors
                  ${(item as any).danger ? 'text-danger' : 'text-secondary hover:text-primary'}`}
              >
                <i className={`ti ${item.icon} text-base`} aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Placeholder / skeleton data ────────────────────────────────────────────

const PLACEHOLDER_TENANTS: Tenant[] = Array.from({ length: 3 }).map((_, i) => ({
  id: `placeholder-${i}`, name: 'Loading hospital...', slug: 'loading',
  status: 'TRIAL', plan: 'STARTER', staffCount: 0,
  adminEmail: 'loading@example.com', mrr: 0, createdAt: new Date().toISOString(),
}));

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELLED'] as const;
const PLAN_FILTERS   = ['ALL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as const;

// ── Table ──────────────────────────────────────────────────────────────────

export function TenantsTable({ data }: { data?: Tenant[] }) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter,   setPlanFilter]   = useState<string>('ALL');
  const [search,       setSearch]       = useState('');
  const [tenants,      setTenants]      = useState<Tenant[]>(PLACEHOLDER_TENANTS);
  const [loading,      setLoading]      = useState(!data);

  useEffect(() => {
    if (data) { setTenants(data); setLoading(false); return; }
    const load = async () => {
      try {
        const res = await fetch('/api/super-admin/dashboard', { cache: 'no-store' });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setTenants(json?.tenants?.length ? json.tenants : PLACEHOLDER_TENANTS);
      } catch {
        setTenants(PLACEHOLDER_TENANTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [data]);

  const filtered = tenants.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (planFilter   !== 'ALL' && t.plan   !== planFilter)   return false;
    if (search &&
      !t.name.toLowerCase().includes(search.toLowerCase()) &&
      !t.adminEmail.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function handleAction(action: string, tenant: Tenant) {
    console.log(`Action: ${action} on ${tenant.id}`);
  }

  return (
    // Card base — §7.1: white bg, 1px border, radius-card
    <div className="bg-surface border border-border rounded-card overflow-hidden">

      {/* Card header — §7.1 */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
        {/* text-heading = 17px/600 — §4.1 */}
        <h2 className="text-heading text-primary">All Tenants</h2>

        <div className="flex items-center gap-3 flex-wrap">

          {/* Search — §7.8 */}
          <div className="relative">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-tertiary text-base" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-page border border-border rounded-badge pl-9 pr-3 py-1.5 text-body text-primary
                placeholder:text-tertiary focus:outline-none focus:border-info w-48"
            />
          </div>

          {/* Status filter tabs — §7.8 */}
          <div className="flex bg-page rounded-badge p-0.5 gap-0.5">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-badge text-label font-medium transition-colors
                  ${statusFilter === s
                    ? 'bg-surface text-primary shadow-sm border border-border'
                    : 'text-secondary hover:text-primary'}`}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Plan filter select */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-page border border-border rounded-badge px-3 py-1.5 text-label text-secondary
              focus:outline-none focus:border-info"
          >
            {PLAN_FILTERS.map((p) => (
              <option key={p} value={p}>
                {p === 'ALL' ? 'All Plans' : p.charAt(0) + p.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table — §7.8 */}
      <div className="overflow-x-auto">
        <table className="w-full text-body" style={{ tableLayout: 'fixed' }}>
          <thead>
            {/* Table header row — text-label / text-secondary, bottom border only — §7.8 */}
            <tr className="border-b border-border">
              {['Hospital', 'Status', 'Plan', 'Staff', 'MRR', 'Admin', 'Joined', ''].map((h, i) => (
                <th
                  key={`${h}-${i}`}
                  className="px-6 py-3 text-left text-label font-medium text-secondary whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-border">
                  <td className="px-6 py-4" colSpan={8}>
                    <div className="h-5 rounded bg-page" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-secondary text-body">
                  No tenants match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="border-b border-border hover:bg-page transition-colors last:border-b-0"
                >
                  {/* Hospital name + slug */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-primary">{tenant.name}</div>
                    <div className="text-label text-tertiary mt-0.5">/{tenant.slug}</div>
                  </td>

                  {/* Status badge — §3.1 semantic colors */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={tenant.status} />
                    {tenant.trialEndsAt && (
                      <div className="text-label text-warning mt-1">
                        Ends {new Date(tenant.trialEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </td>

                  {/* Plan badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PlanBadge plan={tenant.plan} />
                  </td>

                  {/* Staff count */}
                  <td className="px-6 py-4 whitespace-nowrap text-secondary tabular-nums">
                    {tenant.staffCount.toLocaleString()}
                  </td>

                  {/* MRR */}
                  <td className="px-6 py-4 whitespace-nowrap tabular-nums">
                    {tenant.mrr > 0
                      ? <span className="text-primary">${tenant.mrr.toLocaleString()}</span>
                      : <span className="text-tertiary">—</span>}
                  </td>

                  {/* Admin email — text-label / text-secondary */}
                  <td className="px-6 py-4">
                    <div className="text-label text-secondary truncate max-w-[160px]">{tenant.adminEmail}</div>
                  </td>

                  {/* Joined — text-label / text-tertiary */}
                  <td className="px-6 py-4 whitespace-nowrap text-label text-tertiary">
                    {new Date(tenant.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: '2-digit',
                    })}
                  </td>

                  {/* Action menu */}
                  <td className="px-6 py-4">
                    <ActionMenu tenant={tenant} onAction={handleAction} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border flex items-center justify-between">
        <span className="text-label text-tertiary">
          Showing {filtered.length} of {tenants.length} tenants
        </span>
        <button className="text-label text-info hover:text-info/80 transition-colors font-medium">
          Export CSV
          <i className="ti ti-arrow-right ml-1 text-sm" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}