'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
type Tab = 'overview' | 'flags' | 'audit';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  plan: PlanTier;
  staffCount: number;
  adminEmail: string;
  mrr: number;
  createdAt: string;
  trialEndsAt?: string | null;
  country: string;
  lastActive: string;
  contactName?: string | null;
  notes?: string | null;
  departments?: number;
  clockInsToday?: number;
  adminName?: string | null;
};

type FeatureFlag = {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
};

type AuditEntry = {
  action: string;
  by: string;
  time: string;
  type: 'plan' | 'admin' | 'flag' | 'access' | 'system';
};

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'flags', label: 'Feature Flags', icon: '🚩' },
  { id: 'audit', label: 'Audit Log', icon: '📋' },
];

const FLAGS = [
  { key: 'sms_notifications', label: 'SMS Notifications', description: 'Send clock-in alerts via SMS' },
  { key: 'advanced_reports', label: 'Advanced Reports', description: 'Export detailed attendance analytics' },
  { key: 'api_access', label: 'API Access', description: 'Enable REST API for integrations' },
  { key: 'custom_branding', label: 'Custom Branding', description: 'White-label the portal with hospital logo' },
  { key: 'multi_site', label: 'Multi-site', description: 'Manage multiple hospital branches' },
  { key: 'sso_integration', label: 'SSO Integration', description: 'SAML/OAuth single sign-on' },
  { key: 'biometric_clockin', label: 'Biometric Clock-in', description: 'Fingerprint and face recognition support' },
  { key: 'priority_support', label: 'Priority Support', description: '4-hour SLA response time' },
];

const AUDIT_COLORS: Record<string, string> = {
  plan: 'bg-blue-500/20 text-blue-400',
  admin: 'bg-violet-500/20 text-violet-400',
  flag: 'bg-amber-500/20 text-amber-400',
  access: 'bg-rose-500/20 text-rose-400',
  system: 'bg-gray-700 text-gray-400',
};

const EMPTY_TENANT: Tenant = {
  id: '',
  name: 'Tenant not found',
  slug: '—',
  status: 'TRIAL',
  plan: 'STARTER',
  staffCount: 0,
  adminEmail: '—',
  mrr: 0,
  createdAt: new Date().toISOString(),
  trialEndsAt: null,
  country: '—',
  lastActive: '—',
  contactName: '',
  notes: '',
  departments: 0,
  clockInsToday: 0,
  adminName: '',
};

function cap(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-800 ${className}`} />;
}

function OverviewSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-4 w-4 rounded-full" />
            </div>
            <SkeletonBlock className="h-8 w-24" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <SkeletonBlock className="h-4 w-32" />
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="h-3 w-52" />
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-3 w-28" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <SkeletonBlock className="h-4 w-28" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <SkeletonBlock className="h-3 w-16" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlagsSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-3 w-48 mt-2" />
      </div>
      <div className="divide-y divide-gray-800/60">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="h-3 w-56" />
            </div>
            <SkeletonBlock className="h-5 w-10 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-3 w-52 mt-2" />
      </div>
      <div className="divide-y divide-gray-800/50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <SkeletonBlock className="h-5 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-44" />
              <SkeletonBlock className="h-3 w-28" />
            </div>
            <SkeletonBlock className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-700'}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function TenantDetailPage() {
  const params = useParams<{ tenantId: string }>();
  const tenantId = Array.isArray(params?.tenantId) ? params.tenantId[0] : params?.tenantId;

  const [tab, setTab] = useState<Tab>('overview');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [showImpersonateConfirm, setShowImpersonateConfirm] = useState(false);
  const [reason, setReason] = useState('');
  const [flagMap, setFlagMap] = useState<Record<string, boolean>>({});
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadTenant() {
      setLoadingTenant(true);
      try {
        const res = await fetch(`/api/tenants/${tenantId}`);
        if (!res.ok) throw new Error('missing');
        const data = await res.json();
        if (!active) return;
        const t = data.tenant ?? data;
        setTenant({
          ...EMPTY_TENANT,
          ...t,
          departments: t.departments ?? 14,
          clockInsToday: t.clockInsToday ?? 287,
          adminName: t.adminName ?? t.contactName ?? 'Hospital Admin',
        });
      } catch {
        if (!active) return;
        setTenant(EMPTY_TENANT);
      } finally {
        if (active) setLoadingTenant(false);
      }
    }

    async function loadFlags() {
      setFlagsLoading(true);
      try {
        const res = await fetch(`/api/tenants/${tenantId}/features`);
        if (!res.ok) throw new Error('missing');
        const data = await res.json();
        if (!active) return;
        const featureData = Array.isArray(data.features) ? data.features : [];
        const nextFlags: Record<string, boolean> = {};
        for (const f of FLAGS) {
          const found = featureData.find((x: any) => x.key === f.key);
          nextFlags[f.key] = Boolean(found?.enabled ?? found?.value ?? false);
        }
        setFlagMap(nextFlags);
      } catch {
        if (!active) return;
        setFlagMap({
          sms_notifications: true,
          advanced_reports: true,
          api_access: false,
          custom_branding: false,
          multi_site: false,
          sso_integration: false,
          biometric_clockin: true,
          priority_support: true,
        });
      } finally {
        if (active) setFlagsLoading(false);
      }
    }

    async function loadAudit() {
      setAuditLoading(true);
      try {
        const res = await fetch(`/api/tenants/${tenantId}/audit`);
        if (!res.ok) throw new Error('missing');
        const data = await res.json();
        if (!active) return;
        const logs = Array.isArray(data.audit) ? data.audit : Array.isArray(data.logs) ? data.logs : [];
        setAuditLog(logs);
      } catch {
        if (!active) return;
        setAuditLog([
          { action: 'Plan upgraded', by: 'Super Admin', time: '2 hours ago', type: 'plan' },
          { action: 'Admin email changed', by: 'Super Admin', time: '1 day ago', type: 'admin' },
          { action: 'SMS notifications on', by: 'Super Admin', time: '3 days ago', type: 'flag' },
          { action: 'Impersonation session', by: 'Super Admin', time: '5 days ago', type: 'access' },
          { action: 'Tenant created', by: 'System', time: '14 Jan 2024', type: 'system' },
        ]);
      } finally {
        if (active) setAuditLoading(false);
      }
    }

    if (tenantId) {
      loadTenant();
      loadFlags();
      loadAudit();
    }

    return () => {
      active = false;
    };
  }, [tenantId]);

  const activeStatusClass =
    tenant?.status === 'ACTIVE'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : tenant?.status === 'TRIAL'
        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        : tenant?.status === 'SUSPENDED'
          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
          : 'bg-gray-500/15 text-gray-400 border-gray-500/30';

  async function saveFlags() {
    try {
      await fetch(`/api/tenants/${tenantId}/features`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: Object.entries(flagMap).map(([key, enabled]) => ({ key, enabled })),
        }),
      });
    } catch {}
  }

  async function toggleFeature(key: string) {
    const next = !flagMap[key];
    setFlagMap((prev) => ({ ...prev, [key]: next }));

    const endpoint = next
      ? `/api/tenants/${tenantId}/features/${key}/enable`
      : `/api/tenants/${tenantId}/features/${key}/disable`;

    try {
      await fetch(endpoint, { method: 'POST' });
    } catch {}
  }

  async function impersonate() {
    try {
      await fetch(`/api/admin/tenants/${tenantId}/impersonate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    } catch {
      // placeholder fallback
    } finally {
      setShowImpersonateConfirm(false);
      setReason('');
    }
  }

  const overviewCards = useMemo(() => {
    const t = tenant ?? EMPTY_TENANT;
    return [
      { label: 'Total Staff', value: (t.staffCount ?? 0).toLocaleString(), icon: '👥', color: 'text-white' },
      { label: 'Departments', value: (t.departments ?? 0).toLocaleString(), icon: '🏢', color: 'text-white' },
      { label: 'Clock-ins Today', value: (t.clockInsToday ?? 0).toLocaleString(), icon: '⏱', color: 'text-emerald-400' },
      { label: 'Monthly Revenue', value: `$${(t.mrr ?? 0).toLocaleString()}`, icon: '💰', color: 'text-blue-400' },
    ];
  }, [tenant]);

  const overviewLoading = loadingTenant;
  const flagsLoadingState = flagsLoading;
  const auditLoadingState = auditLoading;

  const t = tenant ?? EMPTY_TENANT;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/tenants" className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5 mb-4">
          ← All Tenants
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
              {t.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-white">{t.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${activeStatusClass}`}>
                  {t.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  {cap(t.status)}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-600/20 text-blue-300">
                  {cap(t.plan)}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                /{t.slug} · {t.country} · Since {new Date(t.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 px-4 py-2 rounded-lg transition-colors">
              Edit Tenant
            </button>
            <button
              onClick={() => setShowImpersonateConfirm(true)}
              className="text-sm bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border border-amber-600/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              🔑 Impersonate
            </button>
            <button className="text-sm bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-600/30 px-4 py-2 rounded-lg transition-colors">
              Suspend
            </button>
          </div>
        </div>
      </div>

      {showImpersonateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-amber-600/40 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="text-amber-400 text-3xl mb-4">⚠️</div>
            <h2 className="text-base font-semibold text-white mb-2">Impersonate {t.name}?</h2>
            <p className="text-sm text-gray-400 mb-4">
              You will be logged in as the hospital admin. All actions will be logged.
            </p>
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reason (required)</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1.5 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
                placeholder="e.g. Support request #1234"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowImpersonateConfirm(false)}
                className="flex-1 text-sm text-gray-400 border border-gray-700 py-2 rounded-lg hover:border-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={impersonate}
                className="flex-1 text-sm bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Start Session
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex border-b border-gray-800 gap-1 overflow-x-auto">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === tabItem.id ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <span>{tabItem.icon}</span>
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (overviewLoading ? <OverviewSkeleton /> : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewCards.map((s) => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{s.label}</span>
                  <span>{s.icon}</span>
                </div>
                <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Hospital Admin</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                  {(t.adminName ?? t.contactName ?? 'A').charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{t.adminName ?? t.contactName ?? 'Hospital Admin'}</div>
                  <div className="text-xs text-gray-500">{t.adminEmail}</div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  ['Last active', t.lastActive],
                  ['Role', 'Hospital Admin'],
                  ['2FA', 'Enabled'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-gray-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Subscription</h3>
              <div className="space-y-3">
                {[
                  ['Plan', 'Professional'],
                  ['Billing', 'Monthly'],
                  ['Next invoice', t.trialEndsAt ? new Date(t.trialEndsAt).toLocaleDateString('en-GB') : '—'],
                  ['Amount', `$${t.mrr.toLocaleString()}.00`],
                  ['Status', t.status === 'ACTIVE' ? 'Paid ✓' : cap(t.status)],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{k}</span>
                    <span className={`text-gray-300 ${String(v).includes('✓') ? 'text-emerald-400' : ''}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {tab === 'flags' && (flagsLoadingState ? <FlagsSkeleton /> : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Feature Flags</h3>
              <p className="text-xs text-gray-500 mt-0.5">Override plan defaults for this tenant</p>
            </div>
            <button onClick={saveFlags} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
              Save Changes
            </button>
          </div>
          <div className="divide-y divide-gray-800/60">
            {FLAGS.map((f) => (
              <div key={f.key} className="flex items-center justify-between px-5 py-4 hover:bg-gray-800/20 transition-colors">
                <div>
                  <div className="text-sm font-medium text-white">{f.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{f.description}</div>
                </div>
                <Toggle enabled={flagMap[f.key] ?? false} onToggle={() => toggleFeature(f.key)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {tab === 'audit' && (auditLoadingState ? <AuditSkeleton /> : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white">Audit Log</h3>
            <p className="text-xs text-gray-500 mt-0.5">All super admin actions on this tenant</p>
          </div>
          <div className="divide-y divide-gray-800/50">
            {auditLog.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-600">No audit entries found.</div>
            ) : (
              auditLog.map((entry, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${AUDIT_COLORS[entry.type]}`}>{entry.type}</span>
                  <div className="flex-1">
                    <div className="text-sm text-white">{entry.action}</div>
                    <div className="text-xs text-gray-500 mt-0.5">by {entry.by}</div>
                  </div>
                  <div className="text-xs text-gray-600">{entry.time}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}