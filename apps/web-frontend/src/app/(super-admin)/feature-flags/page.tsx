"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FlagCategory = "attendance" | "notifications" | "auth" | "reporting" | "experimental";
type RolloutStrategy = "global" | "per_tenant" | "percentage";

interface Tenant {
  id: string;
  name: string;
  shortCode: string;
  color: string;
}

interface TenantOverride {
  tenantId: string;
  enabled: boolean;
}

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  category: FlagCategory;
  strategy: RolloutStrategy;
  globalEnabled: boolean;
  percentage?: number;
  tenantOverrides: TenantOverride[];
  lastModified: string;
  modifiedBy: string;
  stable: boolean; // false = experimental / risky
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const TENANTS: Tenant[] = [
  { id: "knh", name: "Kenyatta National Hospital", shortCode: "KNH", color: "bg-blue-500" },
  { id: "aga", name: "Aga Khan University Hospital", shortCode: "AKU", color: "bg-emerald-500" },
  { id: "nai", name: "Nairobi Hospital", shortCode: "TNH", color: "bg-violet-500" },
  { id: "mp", name: "Mater Misericordiae Hospital", shortCode: "MMH", color: "bg-rose-500" },
];

const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: "f1",
    key: "attendance.geofence_check",
    name: "Geofence Clock-in Check",
    description: "Enforces GPS boundary validation when staff clock in. Rejects submissions outside the hospital perimeter.",
    category: "attendance",
    strategy: "per_tenant",
    globalEnabled: false,
    tenantOverrides: [
      { tenantId: "knh", enabled: true },
      { tenantId: "aga", enabled: true },
      { tenantId: "nai", enabled: false },
      { tenantId: "mp", enabled: false },
    ],
    lastModified: "2 hours ago",
    modifiedBy: "a.osei@knh.go.ke",
    stable: true,
  },
  {
    id: "f2",
    key: "attendance.late_window_grace",
    name: "Late Submission Grace Window",
    description: "Allows clock-in submissions up to 15 minutes after the shift window closes without flagging as a violation.",
    category: "attendance",
    strategy: "global",
    globalEnabled: true,
    tenantOverrides: [],
    lastModified: "Yesterday",
    modifiedBy: "j.mwangi@knh.go.ke",
    stable: true,
  },
  {
    id: "f3",
    key: "notifications.digest_mode",
    name: "Notification Digest Mode",
    description: "Batches non-urgent notifications into hourly digest emails instead of dispatching them individually.",
    category: "notifications",
    strategy: "per_tenant",
    globalEnabled: false,
    tenantOverrides: [
      { tenantId: "knh", enabled: true },
      { tenantId: "aga", enabled: false },
      { tenantId: "nai", enabled: true },
      { tenantId: "mp", enabled: false },
    ],
    lastModified: "3 days ago",
    modifiedBy: "s.kariuki@nairobihospital.org",
    stable: true,
  },
  {
    id: "f4",
    key: "notifications.sms_fallback",
    name: "SMS Fallback on Email Failure",
    description: "Automatically falls back to SMS dispatch when the SMTP service times out or returns a 5xx error.",
    category: "notifications",
    strategy: "global",
    globalEnabled: false,
    tenantOverrides: [],
    lastModified: "1 week ago",
    modifiedBy: "p.mehta@agakhan.org",
    stable: true,
  },
  {
    id: "f5",
    key: "auth.mfa_enforcement",
    name: "MFA Enforcement",
    description: "Requires all admin accounts to complete TOTP or SMS multi-factor authentication on login.",
    category: "auth",
    strategy: "per_tenant",
    globalEnabled: false,
    tenantOverrides: [
      { tenantId: "knh", enabled: true },
      { tenantId: "aga", enabled: true },
      { tenantId: "nai", enabled: false },
      { tenantId: "mp", enabled: false },
    ],
    lastModified: "5 days ago",
    modifiedBy: "l.wambui@materhospital.org",
    stable: true,
  },
  {
    id: "f6",
    key: "auth.session_inactivity_lock",
    name: "Session Inactivity Lock",
    description: "Automatically locks the session and requires re-authentication after 30 minutes of inactivity.",
    category: "auth",
    strategy: "global",
    globalEnabled: true,
    tenantOverrides: [],
    lastModified: "2 weeks ago",
    modifiedBy: "j.mwangi@knh.go.ke",
    stable: true,
  },
  {
    id: "f7",
    key: "reporting.pdf_export",
    name: "PDF Report Export",
    description: "Enables one-click PDF export for attendance summaries, payroll snapshots, and audit logs.",
    category: "reporting",
    strategy: "percentage",
    globalEnabled: true,
    percentage: 75,
    tenantOverrides: [],
    lastModified: "4 days ago",
    modifiedBy: "b.achieng@nairobihospital.org",
    stable: true,
  },
  {
    id: "f8",
    key: "reporting.realtime_dashboard",
    name: "Real-time Analytics Dashboard",
    description: "Replaces the static daily-snapshot dashboard with a live WebSocket-driven metrics view.",
    category: "reporting",
    strategy: "per_tenant",
    globalEnabled: false,
    tenantOverrides: [
      { tenantId: "knh", enabled: true },
      { tenantId: "aga", enabled: true },
      { tenantId: "nai", enabled: false },
      { tenantId: "mp", enabled: false },
    ],
    lastModified: "1 day ago",
    modifiedBy: "a.osei@knh.go.ke",
    stable: false,
  },
  {
    id: "f9",
    key: "experimental.ai_shift_scheduler",
    name: "AI Shift Scheduler",
    description: "Uses a constraint-satisfaction model to auto-suggest optimal shift rosters based on staff availability and skills.",
    category: "experimental",
    strategy: "per_tenant",
    globalEnabled: false,
    tenantOverrides: [
      { tenantId: "aga", enabled: true },
      { tenantId: "knh", enabled: false },
      { tenantId: "nai", enabled: false },
      { tenantId: "mp", enabled: false },
    ],
    lastModified: "6 hours ago",
    modifiedBy: "p.mehta@agakhan.org",
    stable: false,
  },
  {
    id: "f10",
    key: "experimental.biometric_clockin",
    name: "Biometric Clock-in (Beta)",
    description: "Integrates with fingerprint and facial-recognition hardware for contactless shift verification.",
    category: "experimental",
    strategy: "per_tenant",
    globalEnabled: false,
    tenantOverrides: [
      { tenantId: "knh", enabled: false },
      { tenantId: "aga", enabled: false },
      { tenantId: "nai", enabled: false },
      { tenantId: "mp", enabled: false },
    ],
    lastModified: "3 weeks ago",
    modifiedBy: "s.kariuki@nairobihospital.org",
    stable: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<FlagCategory, { label: string; icon: string; cls: string }> = {
  attendance:    { label: "Attendance",    icon: "⏱", cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  notifications: { label: "Notifications", icon: "🔔", cls: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  auth:          { label: "Auth",          icon: "🔒", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  reporting:     { label: "Reporting",     icon: "📊", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  experimental:  { label: "Experimental",  icon: "⚗️", cls: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
};

const STRATEGY_META: Record<RolloutStrategy, { label: string; cls: string }> = {
  global:     { label: "Global",     cls: "text-slate-400 bg-slate-700/60 border-slate-600/40" },
  per_tenant: { label: "Per-tenant", cls: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  percentage: { label: "Percentage", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
};

function tenantById(id: string) {
  return TENANTS.find((t) => t.id === id)!;
}

function flagEnabledCount(flag: FeatureFlag): number {
  if (flag.strategy === "global") return flag.globalEnabled ? TENANTS.length : 0;
  return flag.tenantOverrides.filter((o) => o.enabled).length;
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({
  enabled,
  onChange,
  size = "md",
  disabled = false,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  size?: "sm" | "md";
  disabled?: boolean;
}) {
  const track = size === "sm" ? "h-4 w-7" : "h-5 w-9";
  const thumb = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const translate = size === "sm" ? "translate-x-3.5" : "translate-x-4";

  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none ${track} ${
        enabled ? "bg-blue-600" : "bg-slate-700"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block ${thumb} rounded-full bg-white shadow transform transition-transform duration-200 ml-0.5 ${
          enabled ? translate : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  flag,
  action,
  tenantId,
  onConfirm,
  onCancel,
}: {
  flag: FeatureFlag;
  action: "enable" | "disable";
  tenantId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const tenant = tenantId ? tenantById(tenantId) : null;
  const isRisky = !flag.stable;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#0f1422] shadow-2xl p-6 flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${
            action === "enable" ? "bg-blue-500/15 border border-blue-500/30" : "bg-slate-800 border border-slate-700"
          }`}>
            {action === "enable" ? "✓" : "○"}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">
              {action === "enable" ? "Enable" : "Disable"} flag?
            </h2>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">{flag.key}</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {tenant
            ? <>This will {action} <span className="text-slate-200 font-medium">{flag.name}</span> for <span className={`font-mono font-semibold`} style={{}}>{tenant.shortCode}</span> only.</>
            : <>This will {action} <span className="text-slate-200 font-medium">{flag.name}</span> globally across all tenants.</>
          }
        </p>

        {isRisky && (
          <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
            <span className="text-rose-400 text-xs mt-px">⚠</span>
            <p className="text-[11px] text-rose-400 leading-relaxed">
              This is an experimental flag. Changes may cause instability. Proceed with caution.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors ${
              action === "enable"
                ? "bg-blue-600 hover:bg-blue-500"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            {action === "enable" ? "Enable" : "Disable"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tenant Override Grid ─────────────────────────────────────────────────────

function TenantOverrideGrid({
  flag,
  onToggleTenant,
}: {
  flag: FeatureFlag;
  onToggleTenant: (flagId: string, tenantId: string, newVal: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
      {TENANTS.map((tenant) => {
        const override = flag.tenantOverrides.find((o) => o.tenantId === tenant.id);
        const enabled = flag.strategy === "global" ? flag.globalEnabled : (override ? override.enabled : false);
        return (
          <div
            key={tenant.id}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-colors ${
              enabled
                ? "border-blue-500/30 bg-blue-500/5"
                : "border-slate-800 bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${tenant.color}`} />
              <span className="text-[11px] font-mono text-slate-400">{tenant.shortCode}</span>
            </div>
            <Toggle
              size="sm"
              enabled={enabled}
              disabled={flag.strategy === "global"}
              onChange={(v) => onToggleTenant(flag.id, tenant.id, v)}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Flag Card ────────────────────────────────────────────────────────────────

function FlagCard({
  flag,
  onToggleGlobal,
  onToggleTenant,
  onConfirmRequest,
}: {
  flag: FeatureFlag;
  onToggleGlobal: (flagId: string, newVal: boolean) => void;
  onToggleTenant: (flagId: string, tenantId: string, newVal: boolean) => void;
  onConfirmRequest: (flag: FeatureFlag, action: "enable" | "disable", tenantId: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_META[flag.category];
  const strat = STRATEGY_META[flag.strategy];
  const enabledCount = flagEnabledCount(flag);

  return (
    <div className={`rounded-xl border transition-colors ${
      flag.stable ? "border-slate-800" : "border-rose-500/20"
    } bg-slate-900/60 backdrop-blur-sm overflow-hidden`}>
      {/* Card header */}
      <div className="flex items-start gap-4 px-4 py-4">
        {/* Left: text */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cat.cls}`}>
              {cat.icon} {cat.label}
            </span>
            <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${strat.cls}`}>
              {strat.label}
            </span>
            {!flag.stable && (
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border text-rose-400 bg-rose-500/10 border-rose-500/20">
                ⚠ Unstable
              </span>
            )}
            {flag.strategy === "percentage" && flag.percentage !== undefined && (
              <span className="text-[10px] font-mono text-amber-400">{flag.percentage}% rollout</span>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100">{flag.name}</h3>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">{flag.key}</p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed hidden sm:block">{flag.description}</p>
        </div>

        {/* Right: global toggle + meta */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500">
              {flag.strategy === "global"
                ? flag.globalEnabled ? "On" : "Off"
                : `${enabledCount} / ${TENANTS.length}`}
            </span>
            <Toggle
              enabled={flag.strategy === "global" ? flag.globalEnabled : enabledCount > 0}
              onChange={(v) => {
                if (flag.strategy === "global") {
                  onConfirmRequest(flag, v ? "enable" : "disable", null);
                }
              }}
              disabled={flag.strategy !== "global"}
            />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-slate-600">{flag.lastModified}</p>
            <p className="text-[10px] font-mono text-slate-600 truncate max-w-[140px]">{flag.modifiedBy}</p>
          </div>
        </div>
      </div>

      {/* Description on mobile */}
      <p className="text-xs text-slate-400 leading-relaxed px-4 pb-3 sm:hidden">{flag.description}</p>

      {/* Per-tenant section */}
      {flag.strategy === "per_tenant" && (
        <div className="border-t border-slate-800 px-4 py-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors w-full"
          >
            <span className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}>▶</span>
            Per-tenant overrides
            <span className="ml-auto text-[10px]">
              {enabledCount} enabled
            </span>
          </button>
          {expanded && (
            <TenantOverrideGrid
              flag={flag}
              onToggleTenant={(fId, tId, val) => onConfirmRequest(flag, val ? "enable" : "disable", tId)}
            />
          )}
        </div>
      )}

      {/* Percentage bar */}
      {flag.strategy === "percentage" && flag.percentage !== undefined && (
        <div className="border-t border-slate-800 px-4 py-3 flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>Rollout percentage</span>
            <span className="text-amber-400">{flag.percentage}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-700"
              style={{ width: `${flag.percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [categoryFilter, setCategoryFilter] = useState<FlagCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [showEnabled, setShowEnabled] = useState<"all" | "on" | "off">("all");
  const [pendingConfirm, setPendingConfirm] = useState<{
    flag: FeatureFlag;
    action: "enable" | "disable";
    tenantId: string | null;
  } | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = flags.filter((f) => {
    const matchCat = categoryFilter === "all" || f.category === categoryFilter;
    const matchSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.key.toLowerCase().includes(search.toLowerCase());
    const enabled = f.strategy === "global" ? f.globalEnabled : flagEnabledCount(f) > 0;
    const matchEnabled =
      showEnabled === "all" ||
      (showEnabled === "on" && enabled) ||
      (showEnabled === "off" && !enabled);
    return matchCat && matchSearch && matchEnabled;
  });

  const totalOn = flags.filter((f) =>
    f.strategy === "global" ? f.globalEnabled : flagEnabledCount(f) > 0
  ).length;
  const totalExperimental = flags.filter((f) => !f.stable).length;

  // ── Mutations ──────────────────────────────────────────────────────────────

  function applyConfirm() {
    if (!pendingConfirm) return;
    const { flag, action, tenantId } = pendingConfirm;
    const val = action === "enable";

    setFlags((prev) =>
      prev.map((f) => {
        if (f.id !== flag.id) return f;
        if (tenantId === null) {
          return { ...f, globalEnabled: val, lastModified: "Just now", modifiedBy: "you" };
        }
        const overrides = f.tenantOverrides.map((o) =>
          o.tenantId === tenantId ? { ...o, enabled: val } : o
        );
        return { ...f, tenantOverrides: overrides, lastModified: "Just now", modifiedBy: "you" };
      })
    );
    setPendingConfirm(null);
  }

  function handleConfirmRequest(
    flag: FeatureFlag,
    action: "enable" | "disable",
    tenantId: string | null
  ) {
    setPendingConfirm({ flag, action, tenantId });
  }

  const categories: Array<FlagCategory | "all"> = ["all", "attendance", "notifications", "auth", "reporting", "experimental"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Chronos · Platform</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Feature Flags</h1>
          <p className="text-sm text-slate-500 mt-1">Control feature rollout per tenant. Unstable flags require confirmation.</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-[11px] font-mono text-slate-400">{totalOn} active</span>
          </div>
          {totalExperimental > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              <span className="text-[11px] font-mono text-rose-400">⚗ {totalExperimental} experimental</span>
            </div>
          )}
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total flags", value: flags.length, color: "text-slate-200" },
          { label: "Enabled", value: totalOn, color: "text-blue-400" },
          { label: "Disabled", value: flags.length - totalOn, color: "text-slate-500" },
          { label: "Experimental", value: totalExperimental, color: "text-rose-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 flex flex-col gap-0.5">
            <span className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm pointer-events-none">⌕</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or key…"
            className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-8 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors font-mono"
          />
        </div>
        {/* Status toggle */}
        <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-lg p-1 h-fit">
          {(["all", "on", "off"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setShowEnabled(opt)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-wider transition-all ${
                showEnabled === opt
                  ? "bg-slate-700 text-slate-100"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const meta = cat === "all" ? null : CATEGORY_META[cat];
          const count = cat === "all" ? flags.length : flags.filter((f) => f.category === cat).length;
          const active = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                active
                  ? "border-slate-600 bg-slate-800 text-slate-100"
                  : "border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700"
              }`}
            >
              {meta && <span>{meta.icon}</span>}
              {cat === "all" ? "All" : meta!.label}
              <span className={`rounded px-1 py-px text-[10px] ${active ? "bg-slate-700 text-slate-300" : "bg-slate-900 text-slate-600"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Flag cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-16 flex flex-col items-center gap-2">
          <p className="text-slate-500 text-sm font-mono">No flags match your filters.</p>
          <p className="text-slate-600 text-xs font-mono">Try adjusting the search or category.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((flag) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              onToggleGlobal={() => {}}
              onToggleTenant={() => {}}
              onConfirmRequest={handleConfirmRequest}
            />
          ))}
        </div>
      )}

      {/* Confirm modal */}
      {pendingConfirm && (
        <ConfirmModal
          flag={pendingConfirm.flag}
          action={pendingConfirm.action}
          tenantId={pendingConfirm.tenantId}
          onConfirm={applyConfirm}
          onCancel={() => setPendingConfirm(null)}
        />
      )}
    </div>
  );
}