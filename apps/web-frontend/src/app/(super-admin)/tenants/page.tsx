'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

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
};

type DrawerMode = 'view' | 'edit' | 'create' | null;

const STATUS_COLORS: Record<TenantStatus, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  TRIAL: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  SUSPENDED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  CANCELLED: 'bg-gray-500/15 text-gray-500 border-gray-600/30',
};

const PLAN_COLORS: Record<PlanTier, string> = {
  STARTER: 'text-gray-400 bg-gray-800',
  PROFESSIONAL: 'text-blue-300 bg-blue-600/20',
  ENTERPRISE: 'text-violet-300 bg-violet-600/20',
};

const PLAN_PRICE: Record<PlanTier, string> = {
  STARTER: '$400',
  PROFESSIONAL: '$1,200',
  ENTERPRISE: '$2,400',
};

const EMPTY_TENANT: Tenant = {
  id: '',
  name: '',
  slug: '',
  status: 'TRIAL',
  plan: 'STARTER',
  staffCount: 0,
  adminEmail: '',
  mrr: 0,
  createdAt: new Date().toISOString(),
  trialEndsAt: null,
  country: 'Kenya',
  lastActive: '—',
  contactName: '',
  notes: '',
};

function cap(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function inputCls(disabled: boolean) {
  return `w-full rounded-lg px-3 py-2.5 text-sm transition-colors focus:outline-none ${
    disabled
      ? 'bg-transparent text-gray-300 border-0 cursor-default'
      : 'bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-600 focus:border-blue-500'
  }`;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-mono uppercase tracking-wider text-gray-500">{label}</label>
      {children}
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

function PlaceholderState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-16 text-center">
      <div className="text-white font-medium mb-1">{title}</div>
      <div className="text-gray-500 text-sm">{description}</div>
    </div>
  );
}

function ConfirmDeleteModal({
  tenant,
  onConfirm,
  onCancel,
}: {
  tenant: Tenant;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState('');
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-gray-950 shadow-2xl p-6 flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-lg shrink-0">
            ⚠
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Delete tenant?</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          All data for <span className="text-white font-medium">{tenant.name}</span> will be permanently removed.
        </p>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-gray-500 uppercase tracking-wider">
            Type <span className="text-red-400 font-semibold">{tenant.name}</span> to confirm
          </label>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={tenant.name}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500/60 font-mono transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-gray-200 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={typed !== tenant.name}
            className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            Delete tenant
          </button>
        </div>
      </div>
    </div>
  );
}

function RowMenu({
  onView,
  onEdit,
  onSuspend,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onSuspend: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="px-2.5 py-1 text-xs bg-gray-800 text-gray-400 hover:bg-gray-700 rounded transition-colors"
      >
        ···
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-gray-700 bg-gray-950 shadow-xl overflow-hidden">
            <button
              onClick={() => {
                onView();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-xs text-gray-300 hover:bg-gray-800 transition-colors font-mono"
            >
              View details
            </button>
            <button
              onClick={() => {
                onEdit();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-xs text-gray-300 hover:bg-gray-800 transition-colors font-mono"
            >
              Edit
            </button>
            <div className="border-t border-gray-800" />
            <button
              onClick={() => {
                onSuspend();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-xs text-amber-400 hover:bg-gray-800 transition-colors font-mono"
            >
              Suspend
            </button>
            <button
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-xs text-red-400 hover:bg-gray-800 transition-colors font-mono"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CreateTenantModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (tenant: Tenant) => void;
}) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    subdomain: '',
    slug: '',
    licenseKey: '',
    billingCycle: 'MONTHLY',
    country: 'Kenya',
    adminEmail: '',
    contactName: '',
    plan: 'PROFESSIONAL' as PlanTier,
    trial: '7 days',
  });

  function f(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!form.name.trim()) e.name = 'Hospital name is required.';
    else if (form.name.trim().length < 3) e.name = 'Hospital name must be at least 3 characters.';
    else if (form.name.trim().length > 100) e.name = 'Hospital name must be at most 100 characters.';

    if (!form.subdomain.trim()) e.subdomain = 'Subdomain is required.';
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.subdomain.trim())) e.subdomain = 'Use lowercase letters, numbers, and hyphens only.';
    else if (form.subdomain.trim().length < 3) e.subdomain = 'Subdomain must be at least 3 characters.';
    else if (form.subdomain.trim().length > 63) e.subdomain = 'Subdomain must be at most 63 characters.';

    if (!form.slug.trim()) e.slug = 'Slug is required.';
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug.trim())) e.slug = 'Slug must use lowercase letters, numbers, and hyphens only.';
    else if (form.slug.trim().length < 3) e.slug = 'Slug must be at least 3 characters.';
    else if (form.slug.trim().length > 100) e.slug = 'Slug must be at most 100 characters.';

    if (!form.licenseKey.trim()) e.licenseKey = 'License key is required.';
    else if (form.licenseKey.trim().length < 8) e.licenseKey = 'License key is too short.';
    else if (form.licenseKey.trim().length > 255) e.licenseKey = 'License key is too long.';

    if (!form.billingCycle.trim()) e.billingCycle = 'Billing cycle is required.';

    if (!form.country.trim()) e.country = 'Country is required.';

    if (!form.adminEmail.trim()) e.adminEmail = 'Admin email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail.trim())) e.adminEmail = 'Enter a valid email address.';
    else if (form.adminEmail.trim().length > 255) e.adminEmail = 'Email must be at most 255 characters.';

    if (!form.contactName.trim()) e.contactName = 'Admin name is required.';
    else if (form.contactName.trim().length < 3) e.contactName = 'Admin name must be at least 3 characters.';
    else if (form.contactName.trim().length > 100) e.contactName = 'Admin name must be at most 100 characters.';

    if (!form.plan.trim()) e.plan = 'Plan is required.';
    if (!form.trial.trim()) e.trial = 'Trial period is required.';

    return e;
  }, [form]);

  const step1Valid = !errors.name && !errors.subdomain && !errors.slug && !errors.licenseKey && !errors.billingCycle && !errors.country;
  const step2Valid = !errors.adminEmail && !errors.contactName && !errors.plan && !errors.trial;

  function fieldClass(name: keyof typeof errors) {
    const hasError = Boolean(errors[name]);
    return `${inputCls(false)} ${hasError ? 'border-red-500 focus:border-red-500' : ''}`;
  }

  function showError(name: keyof typeof errors) {
    return submitted && errors[name] ? <div className="text-xs text-red-400 mt-1">{errors[name]}</div> : null;
  }

  async function handleCreate() {
    setSubmitted(true);
    if (!step1Valid || !step2Valid) return;

    const trialDays = parseInt(form.trial);
    const trialEndsAt = isNaN(trialDays)
      ? undefined
      : new Date(Date.now() + trialDays * 86400000).toISOString();

    const payload = {
      name: form.name.trim(),
      subdomain: form.subdomain.trim().toLowerCase(),
      slug: form.slug.trim().toLowerCase(),
      licenseKey: form.licenseKey.trim(),
      billingCycle: form.billingCycle,
      country: form.country,
      adminEmail: form.adminEmail.trim(),
      contactName: form.contactName.trim(),
      plan: form.plan,
      status: trialEndsAt ? 'TRIAL' : 'ACTIVE',
      trialEndsAt: trialEndsAt ?? null,
    };

    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      onCreate(data.tenant ?? data);
      onClose();
      return;
    }

    onCreate({
      ...EMPTY_TENANT,
      id: `temp-${Date.now()}`,
      ...payload,
      staffCount: 0,
      mrr: 0,
      lastActive: 'Just now',
      createdAt: new Date().toISOString(),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-base font-semibold text-white">Onboard New Hospital</h2>
            <p className="text-xs text-gray-500 mt-0.5">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">
            ✕
          </button>
        </div>

        <div className="flex gap-1 px-6 pt-4">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-blue-500' : 'bg-gray-700'}`}
            />
          ))}
        </div>

        <div className="p-6 space-y-4">
          {step === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Hospital Name">
                <input
                  required
                  minLength={3}
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => f('name', e.target.value)}
                  className={fieldClass('name')}
                  placeholder="e.g. Nairobi West Hospital"
                />
                {showError('name')}
              </FormField>

              <FormField label="Subdomain">
                <input
                  required
                  minLength={3}
                  maxLength={63}
                  pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
                  value={form.subdomain}
                  onChange={(e) => f('subdomain', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className={fieldClass('subdomain')}
                  placeholder="nairobi-west"
                />
                {showError('subdomain')}
              </FormField>

              <FormField label="Slug">
                <input
                  required
                  minLength={3}
                  maxLength={100}
                  pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
                  value={form.slug}
                  onChange={(e) => f('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className={fieldClass('slug')}
                  placeholder="nairobi-west"
                />
                {showError('slug')}
              </FormField>

              <FormField label="License Key">
                <input
                  required
                  minLength={8}
                  maxLength={255}
                  value={form.licenseKey}
                  onChange={(e) => f('licenseKey', e.target.value)}
                  className={fieldClass('licenseKey')}
                  placeholder="LIC-XXXX-XXXX-XXXX"
                />
                {showError('licenseKey')}
              </FormField>

              <FormField label="Billing Cycle">
                <select
                  required
                  value={form.billingCycle}
                  onChange={(e) => f('billingCycle', e.target.value)}
                  className={fieldClass('billingCycle')}
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
                {showError('billingCycle')}
              </FormField>

              <FormField label="Country">
                <select
                  required
                  value={form.country}
                  onChange={(e) => f('country', e.target.value)}
                  className={fieldClass('country')}
                >
                  {['Kenya', 'Uganda', 'Tanzania', 'Rwanda'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {showError('country')}
              </FormField>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Admin Email">
                <input
                  required
                  type="email"
                  maxLength={255}
                  value={form.adminEmail}
                  onChange={(e) => f('adminEmail', e.target.value)}
                  className={fieldClass('adminEmail')}
                  placeholder="admin@hospital.co.ke"
                />
                {showError('adminEmail')}
              </FormField>

              <FormField label="Admin Full Name">
                <input
                  required
                  minLength={3}
                  maxLength={100}
                  value={form.contactName}
                  onChange={(e) => f('contactName', e.target.value)}
                  className={fieldClass('contactName')}
                  placeholder="Dr. John Mwangi"
                />
                {showError('contactName')}
              </FormField>

              <FormField label="Plan">
                <select
                  required
                  value={form.plan}
                  onChange={(e) => f('plan', e.target.value)}
                  className={fieldClass('plan')}
                >
                  <option value="STARTER">Starter</option>
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
                {showError('plan')}
              </FormField>

              <FormField label="Trial Period">
                <select
                  required
                  value={form.trial}
                  onChange={(e) => f('trial', e.target.value)}
                  className={fieldClass('trial')}
                >
                  {['3 days', '7 days', '10 days', 'No trial'].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                {showError('trial')}
              </FormField>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          <button
            onClick={() => {
              setSubmitted(true);
              if (step === 1 && step1Valid) setStep(2);
              else if (step === 2 && step2Valid) handleCreate();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {step === 1 ? 'Continue →' : 'Create & Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TableView({
  filtered,
  total,
  onView,
  onEdit,
  onSuspend,
  onDelete,
}: {
  filtered: Tenant[];
  total: number;
  onView: (t: Tenant) => void;
  onEdit: (t: Tenant) => void;
  onSuspend: (id: string) => void;
  onDelete: (t: Tenant) => void;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900/80">
            {['Hospital', 'Status', 'Plan', 'Staff', 'MRR', 'Last Active', 'Joined', ''].map((h) => (
              <th
                key={h}
                className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-600">
                No tenants match your filters.
              </td>
            </tr>
          ) : (
            filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-800/30 transition-colors group">
                <td className="px-5 py-4">
                  <Link href={`/tenants/${t.id}`} className="flex items-center gap-3 cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{t.name}</div>
                      <div className="text-xs text-gray-600 mt-0.5">/{t.slug}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[t.status]}`}>
                    {t.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    {cap(t.status)}
                  </span>
                  {t.trialEndsAt && (
                    <div className="text-xs text-amber-500 mt-1">
                      Ends {new Date(t.trialEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${PLAN_COLORS[t.plan]}`}>{cap(t.plan)}</span>
                </td>
                <td className="px-5 py-4 text-gray-300 tabular-nums">{t.staffCount.toLocaleString()}</td>
                <td className="px-5 py-4 tabular-nums">
                  {t.mrr > 0 ? <span className="text-white font-medium">${t.mrr.toLocaleString()}</span> : <span className="text-gray-700">—</span>}
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">{t.lastActive}</td>
                <td className="px-5 py-4 text-gray-600 text-xs">
                  {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>
                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/tenants/${t.id}`}
                      className="px-2.5 py-1 text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded transition-colors"
                    >
                      View
                    </Link>
                    <RowMenu
                      onView={() => {}}
                      onEdit={() => onEdit(t)}
                      onSuspend={() => onSuspend(t.id)}
                      onDelete={() => onDelete(t)}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-600">Showing {filtered.length} of {total} tenants</span>
        <button className="text-xs text-blue-500 hover:text-blue-400 transition-colors">Export CSV →</button>
      </div>
    </div>
  );
}

function GridView({ filtered }: { filtered: Tenant[] }) {
  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-16 text-center text-sm text-gray-600">
        No tenants match your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((t) => (
        <Link
          key={t.id}
          href={`/tenants/${t.id}`}
          className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-sm font-bold text-white">
              {t.name.charAt(0)}
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[t.status]}`}>
              {t.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              {cap(t.status)}
            </span>
          </div>
          <div className="font-semibold text-white group-hover:text-blue-400 transition-colors text-sm leading-snug">{t.name}</div>
          <div className="text-xs text-gray-600 mt-0.5 mb-4">/{t.slug}</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-800/60 rounded-lg px-2.5 py-2">
              <div className="text-gray-500">Staff</div>
              <div className="font-semibold text-white mt-0.5">{t.staffCount.toLocaleString()}</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg px-2.5 py-2">
              <div className="text-gray-500">MRR</div>
              <div className="font-semibold text-white mt-0.5">{t.mrr > 0 ? `$${t.mrr.toLocaleString()}` : 'Trial'}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${PLAN_COLORS[t.plan]}`}>{cap(t.plan)}</span>
            <span className="text-xs text-gray-600">{t.lastActive}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TenantStatus>('ALL');
  const [planFilter, setPlanFilter] = useState<'ALL' | PlanTier>('ALL');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [quickDeleteTarget, setQuickDeleteTarget] = useState<Tenant | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/tenants');
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        if (!active) return;
        setTenants(Array.isArray(data.tenants) ? data.tenants : Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setTenants([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return tenants.filter((t) => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (planFilter !== 'ALL' && t.plan !== planFilter) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tenants, search, statusFilter, planFilter]);

  const totalMrr = tenants.filter((t) => t.status === 'ACTIVE').reduce((s, t) => s + t.mrr, 0);

  function openView(t: Tenant) {
    setSelectedTenant(t);
    setDrawerMode('view');
  }

  function openEdit(t: Tenant) {
    setSelectedTenant(t);
    setDrawerMode('edit');
  }

  function closeDrawer() {
    setDrawerMode(null);
    setSelectedTenant(null);
  }

  async function handleSave(data: Tenant) {
    try {
      const method = data.id && tenants.some((t) => t.id === data.id) ? 'PATCH' : 'POST';
      const url = method === 'POST' ? '/api/tenants' : `/api/tenants/${data.id}`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const payload = await res.json();
        const updated = payload.tenant ?? payload;
        setTenants((prev) =>
          prev.find((t) => t.id === updated.id)
            ? prev.map((t) => (t.id === updated.id ? updated : t))
            : [updated, ...prev]
        );
        setSelectedTenant(updated);
        if (drawerMode === 'create') setDrawerMode('view');
        return;
      }
    } catch {}

    setTenants((prev) =>
      prev.find((t) => t.id === data.id)
        ? prev.map((t) => (t.id === data.id ? data : t))
        : [data, ...prev]
    );
    setSelectedTenant(data);
    if (drawerMode === 'create') setDrawerMode('view');
  }

  async function handleCreate(t: Tenant) {
    setTenants((prev) => [t, ...prev]);
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/tenants/${id}`, { method: 'DELETE' });
    } catch {}
    setTenants((prev) => prev.filter((t) => t.id !== id));
    closeDrawer();
  }

  async function handleSuspend(id: string) {
    try {
      const res = await fetch(`/api/tenants/${id}/suspend`, { method: 'POST' });
      if (res.ok) {
        setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'SUSPENDED' } : t)));
        return;
      }
    } catch {}
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'SUSPENDED' } : t)));
  }

  async function handleActivate(id: string) {
    try {
      const res = await fetch(`/api/tenants/${id}/activate`, { method: 'POST' });
      if (res.ok) {
        setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'ACTIVE' } : t)));
        return;
      }
    } catch {}
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'ACTIVE' } : t)));
  }

  return (
    <div className="space-y-6">
      {showCreate && <CreateTenantModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {quickDeleteTarget && (
        <ConfirmDeleteModal
          tenant={quickDeleteTarget}
          onConfirm={() => {
            handleDelete(quickDeleteTarget.id);
            setQuickDeleteTarget(null);
          }}
          onCancel={() => setQuickDeleteTarget(null)}
        />
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tenants</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all hospital accounts on the Chronos platform</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
        >
          <span className="text-base leading-none">+</span> Onboard Hospital
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: tenants.length, color: 'text-white' },
          { label: 'Active', value: tenants.filter((t) => t.status === 'ACTIVE').length, color: 'text-emerald-400' },
          { label: 'Trial', value: tenants.filter((t) => t.status === 'TRIAL').length, color: 'text-amber-400' },
          { label: 'MRR', value: `$${totalMrr.toLocaleString()}`, color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex flex-1 gap-3 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenants..."
            className="w-full lg:w-80 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | TenantStatus)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAL">Trial</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as 'ALL' | PlanTier)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Plans</option>
            <option value="STARTER">Starter</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>
        <div className="flex rounded-lg border border-gray-800 overflow-hidden">
          <button
            onClick={() => setView('table')}
            className={`px-4 py-2.5 text-sm transition-colors ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400'}`}
          >
            Table
          </button>
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2.5 text-sm transition-colors ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400'}`}
          >
            Grid
          </button>
        </div>
      </div>

      {loading ? (
        <PlaceholderState title="Loading tenants..." description="Fetching the latest tenant data from the backend." />
      ) : view === 'table' ? (
        <TableView
          filtered={filtered}
          total={tenants.length}
          onView={openView}
          onEdit={openEdit}
          onSuspend={handleSuspend}
          onDelete={(t) => setQuickDeleteTarget(t)}
        />
      ) : (
        <GridView filtered={filtered} />
      )}

      {drawerMode && selectedTenant && (
        <TenantDrawer
          tenant={selectedTenant}
          mode={drawerMode}
          onClose={closeDrawer}
          onSave={handleSave}
          onDelete={handleDelete}
          onSuspend={handleSuspend}
          onActivate={handleActivate}
        />
      )}
    </div>
  );
}