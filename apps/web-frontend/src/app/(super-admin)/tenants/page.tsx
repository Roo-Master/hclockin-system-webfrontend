'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { superAdminApi, Tenant } from '@/lib/(super-admin)/api/super-admin';
type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

type DrawerMode = 'view' | 'edit' | 'create' | null;

// ─── Semantic Color Mapping ──────────────────────────────────────────────

const STATUS_COLORS: Record<TenantStatus, { bg: string; text: string; border: string; dot: string }> = {
  ACTIVE: { 
    bg: 'bg-[#DCFCE7]', 
    text: 'text-[#16A34A]', 
    border: 'border-[#16A34A]',
    dot: 'bg-[#16A34A]'
  },
  TRIAL: { 
    bg: 'bg-[#FFEDD5]', 
    text: 'text-[#EA580C]', 
    border: 'border-[#EA580C]',
    dot: 'bg-[#EA580C]'
  },
  SUSPENDED: { 
    bg: 'bg-[#FEE2E2]', 
    text: 'text-[#DC2626]', 
    border: 'border-[#DC2626]',
    dot: 'bg-[#DC2626]'
  },
  CANCELLED: { 
    bg: 'bg-[#F5F6FA]', 
    text: 'text-[#6B7280]', 
    border: 'border-[#6B7280]',
    dot: 'bg-[#9CA3AF]'
  },
};

const PLAN_COLORS: Record<PlanTier, { bg: string; text: string; border: string }> = {
  STARTER: { 
    bg: 'bg-[#F5F6FA]', 
    text: 'text-[#6B7280]', 
    border: 'border-[#E5E7EB]' 
  },
  PROFESSIONAL: { 
    bg: 'bg-[#DBEAFE]', 
    text: 'text-[#2563EB]', 
    border: 'border-[#2563EB]' 
  },
  ENTERPRISE: { 
    bg: 'bg-[#FFEDD5]', 
    text: 'text-[#EA580C]', 
    border: 'border-[#EA580C]' 
  },
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
      ? 'bg-transparent text-[#111827] border-0 cursor-default'
      : 'bg-white border border-[#E5E7EB] text-[#111827] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE]'
  }`;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[#6B7280]">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'}`}
      aria-label={enabled ? 'Disable' : 'Enable'}
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
    <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-16 text-center shadow-sm">
      <div className="text-[#111827] font-medium mb-1">{title}</div>
      <div className="text-[#6B7280] text-sm">{description}</div>
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl border border-[#DC2626]/30 bg-white shadow-xl p-6 flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#FEE2E2] border border-[#DC2626]/30 flex items-center justify-center text-lg shrink-0">
            ⚠
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">Delete tenant?</h2>
            <p className="text-[11px] text-[#6B7280] mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-xs text-[#6B7280] leading-relaxed">
          All data for <span className="text-[#111827] font-medium">{tenant.name}</span> will be permanently removed.
        </p>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[#6B7280]">
            Type <span className="text-[#DC2626] font-semibold">{tenant.name}</span> to confirm
          </label>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={tenant.name}
            className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#FEE2E2] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={typed !== tenant.name}
            className="flex-1 py-2.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
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
        className="px-2.5 py-1 text-xs bg-[#F5F6FA] text-[#6B7280] hover:bg-[#E5E7EB] rounded transition-colors"
        aria-label="Row actions menu"
      >
        ···
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-[#E5E7EB] bg-white shadow-xl overflow-hidden">
            <button
              onClick={() => {
                onView();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-xs text-[#111827] hover:bg-[#F5F6FA] transition-colors font-medium"
            >
              View details
            </button>
            <button
              onClick={() => {
                onEdit();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-xs text-[#111827] hover:bg-[#F5F6FA] transition-colors font-medium"
            >
              Edit
            </button>
            <div className="border-t border-[#E5E7EB]" />
            <button
              onClick={() => {
                onSuspend();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-xs text-[#EA580C] hover:bg-[#F5F6FA] transition-colors font-medium"
            >
              Suspend
            </button>
            <button
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-xs text-[#DC2626] hover:bg-[#F5F6FA] transition-colors font-medium"
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
  const [loading, setLoading] = useState(false);
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
    return `${inputCls(false)} ${hasError ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#FEE2E2]' : ''}`;
  }

  function showError(name: keyof typeof errors) {
    return submitted && errors[name] ? <div className="text-xs text-[#DC2626] mt-1">{errors[name]}</div> : null;
  }

  async function handleCreate() {
    setSubmitted(true);
    if (!step1Valid || !step2Valid) return;

    setLoading(true);
    try {
      const trialDays = parseInt(form.trial);
      const trialEndsAt = isNaN(trialDays)
        ? undefined
        : new Date(Date.now() + trialDays * 86400000).toISOString();

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        planId: form.plan === 'STARTER' ? 'plan_starter' : 
                form.plan === 'PROFESSIONAL' ? 'plan_professional' : 'plan_enterprise',
        settings: {
          subdomain: form.subdomain.trim().toLowerCase(),
          country: form.country,
          adminEmail: form.adminEmail.trim(),
          contactName: form.contactName.trim(),
          billingCycle: form.billingCycle,
          licenseKey: form.licenseKey.trim(),
          trialEndsAt: trialEndsAt ?? null,
        }
      };

      const result = await superAdminApi.createTenant(payload);
      
      // Map the response to our Tenant type
      const newTenant: Tenant = {
        id: result.id,
        name: result.name,
        slug: result.slug,
        status: trialEndsAt ? 'TRIAL' : 'ACTIVE',
        plan: form.plan,
        staffCount: 0,
        adminEmail: form.adminEmail.trim(),
        mrr: 0,
        createdAt: new Date().toISOString(),
        trialEndsAt: trialEndsAt ?? null,
        country: form.country,
        lastActive: 'Just now',
        contactName: form.contactName.trim(),
        notes: '',
      };
      
      onCreate(newTenant);
      onClose();
    } catch (error) {
      console.error('Failed to create tenant:', error);
      alert('Failed to create tenant. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-[#E5E7EB] rounded-xl w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">Onboard New Hospital</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827] text-lg leading-none">
            ✕
          </button>
        </div>

        <div className="flex gap-1 px-6 pt-4">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'}`}
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
                  onChange={(e) => f('plan', e.target.value as PlanTier)}
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

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB]">
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
            disabled={loading}
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          <button
            onClick={() => {
              setSubmitted(true);
              if (step === 1 && step1Valid) setStep(2);
              else if (step === 2 && step2Valid) handleCreate();
            }}
            disabled={loading}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : step === 1 ? 'Continue →' : 'Create & Send Invite'}
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
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F5F6FA]">
            {['Hospital', 'Status', 'Plan', 'Staff', 'MRR', 'Last Active', 'Joined', ''].map((h) => (
              <th
                key={h}
                className="px-5 py-3.5 text-left text-[12px] font-medium text-[#6B7280] uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB]">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-5 py-12 text-center text-sm text-[#6B7280]">
                No tenants match your filters.
              </td>
            </tr>
          ) : (
            filtered.map((t) => {
              const statusColors = STATUS_COLORS[t.status];
              const planColors = PLAN_COLORS[t.plan];
              return (
                <tr key={t.id} className="hover:bg-[#F5F6FA] transition-colors group">
                  <td className="px-5 py-4">
                    <Link href={`/super-admin/tenants/${t.id}`} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] border border-[#2563EB]/20 flex items-center justify-center text-xs font-bold text-[#2563EB] flex-shrink-0">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-[#111827] group-hover:text-[#2563EB] transition-colors">{t.name}</div>
                        <div className="text-xs text-[#6B7280] mt-0.5">/{t.slug}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                      {t.status === 'ACTIVE' && <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot} animate-pulse`} />}
                      {cap(t.status)}
                    </span>
                    {t.trialEndsAt && (
                      <div className="text-xs text-[#EA580C] mt-1">
                        Ends {new Date(t.trialEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${planColors.bg} ${planColors.text} border ${planColors.border}/30`}>
                      {cap(t.plan)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#111827] tabular-nums">{t.staffCount.toLocaleString()}</td>
                  <td className="px-5 py-4 tabular-nums">
                    {t.mrr > 0 ? <span className="text-[#111827] font-medium">${t.mrr.toLocaleString()}</span> : <span className="text-[#9CA3AF]">—</span>}
                  </td>
                  <td className="px-5 py-4 text-[#6B7280] text-xs">{t.lastActive}</td>
                  <td className="px-5 py-4 text-[#6B7280] text-xs">
                    {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/super-admin/tenants/${t.id}`}
                        className="px-2.5 py-1 text-xs bg-[#DBEAFE] text-[#2563EB] hover:bg-[#2563EB] hover:text-white rounded transition-colors"
                      >
                        View
                      </Link>
                      <RowMenu
                        onView={() => onView(t)}
                        onEdit={() => onEdit(t)}
                        onSuspend={() => onSuspend(t.id)}
                        onDelete={() => onDelete(t)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F5F6FA] flex items-center justify-between">
        <span className="text-xs text-[#6B7280]">Showing {filtered.length} of {total} tenants</span>
        <button className="text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors font-medium">Export CSV →</button>
      </div>
    </div>
  );
}

function GridView({ filtered }: { filtered: Tenant[] }) {
  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-16 text-center text-sm text-[#6B7280] shadow-sm">
        No tenants match your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((t) => {
        const statusColors = STATUS_COLORS[t.status];
        const planColors = PLAN_COLORS[t.plan];
        return (
          <Link
            key={t.id}
            href={`/super-admin/tenants/${t.id}`}
            className="bg-white border border-[#E5E7EB] hover:border-[#2563EB] rounded-xl p-5 cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] border border-[#2563EB]/20 flex items-center justify-center text-sm font-bold text-[#2563EB]">
                {t.name.charAt(0)}
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                {t.status === 'ACTIVE' && <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot} animate-pulse`} />}
                {cap(t.status)}
              </span>
            </div>
            <div className="font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors text-sm leading-snug">{t.name}</div>
            <div className="text-xs text-[#6B7280] mt-0.5 mb-4">/{t.slug}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#F5F6FA] rounded-lg px-2.5 py-2">
                <div className="text-[#6B7280]">Staff</div>
                <div className="font-semibold text-[#111827] mt-0.5">{t.staffCount.toLocaleString()}</div>
              </div>
              <div className="bg-[#F5F6FA] rounded-lg px-2.5 py-2">
                <div className="text-[#6B7280]">MRR</div>
                <div className="font-semibold text-[#111827] mt-0.5">{t.mrr > 0 ? `$${t.mrr.toLocaleString()}` : 'Trial'}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${planColors.bg} ${planColors.text} border ${planColors.border}/30`}>
                {cap(t.plan)}
              </span>
              <span className="text-xs text-[#6B7280]">{t.lastActive}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// Tenant Drawer Component (simplified version)
function TenantDrawer({ 
  tenant, 
  mode, 
  onClose, 
  onSave, 
  onDelete, 
  onSuspend, 
  onActivate 
}: { 
  tenant: Tenant; 
  mode: DrawerMode; 
  onClose: () => void; 
  onSave: (t: Tenant) => void; 
  onDelete: (id: string) => void; 
  onSuspend: (id: string) => void; 
  onActivate: (id: string) => void; 
}) {
  const [editData, setEditData] = useState(tenant);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditData(tenant);
  }, [tenant]);

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isCreate = mode === 'create';

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(editData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white h-full shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#111827]">
            {isCreate ? 'New Tenant' : isView ? 'Tenant Details' : 'Edit Tenant'}
          </h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827] text-xl">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#6B7280]">Name</label>
              {isView ? (
                <p className="text-sm text-[#111827] mt-1">{tenant.name}</p>
              ) : (
                <input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm mt-1"
                />
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B7280]">Slug</label>
              {isView ? (
                <p className="text-sm text-[#111827] mt-1">/{tenant.slug}</p>
              ) : (
                <input
                  value={editData.slug}
                  onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm mt-1"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#6B7280]">Status</label>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[tenant.status].bg} ${STATUS_COLORS[tenant.status].text} ${STATUS_COLORS[tenant.status].border}`}>
                  {cap(tenant.status)}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B7280]">Plan</label>
              {isView ? (
                <p className="text-sm text-[#111827] mt-1">{cap(tenant.plan)}</p>
              ) : (
                <select
                  value={editData.plan}
                  onChange={(e) => setEditData({ ...editData, plan: e.target.value as PlanTier })}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm mt-1"
                >
                  <option value="STARTER">Starter</option>
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#6B7280]">Admin Email</label>
              {isView ? (
                <p className="text-sm text-[#111827] mt-1">{tenant.adminEmail}</p>
              ) : (
                <input
                  value={editData.adminEmail}
                  onChange={(e) => setEditData({ ...editData, adminEmail: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm mt-1"
                />
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B7280]">Staff Count</label>
              <p className="text-sm text-[#111827] mt-1">{tenant.staffCount.toLocaleString()}</p>
            </div>
          </div>

          {tenant.trialEndsAt && (
            <div>
              <label className="text-xs font-medium text-[#6B7280]">Trial Ends</label>
              <p className="text-sm text-[#EA580C] mt-1">
                {new Date(tenant.trialEndsAt).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          )}

          {tenant.notes && (
            <div>
              <label className="text-xs font-medium text-[#6B7280]">Notes</label>
              <p className="text-sm text-[#111827] mt-1">{tenant.notes}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] px-6 py-4 flex justify-between">
          <div>
            {!isView && !isCreate && (
              <button
                onClick={() => onDelete(tenant.id)}
                className="text-[#DC2626] hover:text-[#B91C1C] text-sm font-medium"
              >
                Delete Tenant
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              Close
            </button>
            {!isView && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            {isView && tenant.status === 'ACTIVE' && (
              <button
                onClick={() => onSuspend(tenant.id)}
                className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-medium rounded-lg transition-colors"
              >
                Suspend
              </button>
            )}
            {isView && tenant.status === 'SUSPENDED' && (
              <button
                onClick={() => onActivate(tenant.id)}
                className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-medium rounded-lg transition-colors"
              >
                Activate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TenantStatus>('ALL');
  const [planFilter, setPlanFilter] = useState<'ALL' | PlanTier>('ALL');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [quickDeleteTarget, setQuickDeleteTarget] = useState<Tenant | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await superAdminApi.getTenants();
      // Transform API response to match our Tenant type
      const mappedTenants = (data.tenants || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        status: t.status === 'active' ? 'ACTIVE' : 
                t.status === 'suspended' ? 'SUSPENDED' : 
                t.status === 'deleted' ? 'CANCELLED' : 'TRIAL',
        plan: t.plan?.code === 'pro' ? 'PROFESSIONAL' :
              t.plan?.code === 'enterprise' ? 'ENTERPRISE' : 'STARTER',
        staffCount: t._count?.admins || 0,
        adminEmail: t.admins?.[0]?.user?.email || '',
        mrr: t.subscription?.plan?.priceMonthly || 0,
        createdAt: t.createdAt,
        trialEndsAt: t.subscription?.trialEndsAt || null,
        country: t.settings?.country || 'Kenya',
        lastActive: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : '—',
        contactName: t.settings?.contactName || '',
        notes: t.settings?.notes || '',
      }));
      setTenants(mappedTenants);
    } catch (err) {
      console.error('Failed to load tenants:', err);
      setError('Failed to load tenants. Please try again.');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

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
      const result = await superAdminApi.updateTenant(data.id, {
        name: data.name,
        slug: data.slug,
        planId: data.plan === 'STARTER' ? 'plan_starter' : 
                data.plan === 'PROFESSIONAL' ? 'plan_professional' : 'plan_enterprise',
        settings: {
          adminEmail: data.adminEmail,
          contactName: data.contactName,
          notes: data.notes,
        }
      });
      
      const updated = {
        ...data,
        ...result,
      };
      
      setTenants((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setSelectedTenant(updated);
    } catch (error) {
      console.error('Failed to save tenant:', error);
      alert('Failed to save changes. Please try again.');
    }
  }

  async function handleCreate(t: Tenant) {
    setTenants((prev) => [t, ...prev]);
    await loadTenants(); // Refresh from API
  }

  async function handleDelete(id: string) {
    try {
      await superAdminApi.deleteTenant(id);
      setTenants((prev) => prev.filter((t) => t.id !== id));
      closeDrawer();
    } catch (error) {
      console.error('Failed to delete tenant:', error);
      alert('Failed to delete tenant. Please try again.');
    }
  }

  async function handleSuspend(id: string) {
    try {
      await superAdminApi.suspendTenant(id);
      setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'SUSPENDED' } : t)));
    } catch (error) {
      console.error('Failed to suspend tenant:', error);
      alert('Failed to suspend tenant. Please try again.');
    }
  }

  async function handleActivate(id: string) {
    try {
      await superAdminApi.activateTenant(id);
      setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'ACTIVE' } : t)));
    } catch (error) {
      console.error('Failed to activate tenant:', error);
      alert('Failed to activate tenant. Please try again.');
    }
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

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">Tenants</h1>
          <p className="text-[#6B7280] text-sm mt-1">Manage all hospital accounts on the Chronos platform</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <span className="text-base leading-none">+</span> Onboard Hospital
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: tenants.length, color: 'text-[#111827]' },
          { label: 'Active', value: tenants.filter((t) => t.status === 'ACTIVE').length, color: 'text-[#16A34A]' },
          { label: 'Trial', value: tenants.filter((t) => t.status === 'TRIAL').length, color: 'text-[#EA580C]' },
          { label: 'MRR', value: `$${totalMrr.toLocaleString()}`, color: 'text-[#2563EB]' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">
            <div className="text-[12px] font-medium text-[#6B7280]">{s.label}</div>
            <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex flex-1 gap-3 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenants..."
            className="w-full lg:w-80 bg-white border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] transition-colors"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | TenantStatus)}
            className="bg-white border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] transition-colors appearance-none"
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
            className="bg-white border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] transition-colors appearance-none"
          >
            <option value="ALL">All Plans</option>
            <option value="STARTER">Starter</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>
        <div className="flex rounded-lg border border-[#E5E7EB] overflow-hidden shadow-sm">
          <button
            onClick={() => setView('table')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              view === 'table' ? 'bg-[#2563EB] text-white' : 'bg-white text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              view === 'grid' ? 'bg-[#2563EB] text-white' : 'bg-white text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <PlaceholderState title="Loading tenants..." description="Fetching the latest tenant data from the backend." />
      ) : error ? (
        <PlaceholderState title="⚠️ Error loading tenants" description={error} />
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