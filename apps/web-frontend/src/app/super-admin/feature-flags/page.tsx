"use client";

import { useState, useEffect } from "react";

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
  stable: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<FlagCategory, { label: string; icon: string; bg: string; text: string; border: string }> = {
  attendance: { 
    label: "Attendance", 
    icon: "⏱", 
    bg: "bg-[#DBEAFE]", 
    text: "text-[#2563EB]", 
    border: "border-[#2563EB]" 
  },
  notifications: { 
    label: "Notifications", 
    icon: "🔔", 
    bg: "bg-[#E5E7EB]", 
    text: "text-[#6B7280]", 
    border: "border-[#6B7280]" 
  },
  auth: { 
    label: "Auth", 
    icon: "🔒", 
    bg: "bg-[#DCFCE7]", 
    text: "text-[#16A34A]", 
    border: "border-[#16A34A]" 
  },
  reporting: { 
    label: "Reporting", 
    icon: "📊", 
    bg: "bg-[#FFEDD5]", 
    text: "text-[#EA580C]", 
    border: "border-[#EA580C]" 
  },
  experimental: { 
    label: "Experimental", 
    icon: "⚗️", 
    bg: "bg-[#FEE2E2]", 
    text: "text-[#DC2626]", 
    border: "border-[#DC2626]" 
  },
};

const STRATEGY_META: Record<RolloutStrategy, { label: string; bg: string; text: string; border: string }> = {
  global: { 
    label: "Global", 
    bg: "bg-[#F5F6FA]", 
    text: "text-[#6B7280]", 
    border: "border-[#E5E7EB]" 
  },
  per_tenant: { 
    label: "Per-tenant", 
    bg: "bg-[#DBEAFE]", 
    text: "text-[#2563EB]", 
    border: "border-[#2563EB]" 
  },
  percentage: { 
    label: "Percentage", 
    bg: "bg-[#FFEDD5]", 
    text: "text-[#EA580C]", 
    border: "border-[#EA580C]" 
  },
};

function tenantById(id: string, tenants: Tenant[]) {
  return tenants.find((t) => t.id === id)!;
}

function flagEnabledCount(flag: FeatureFlag, tenants: Tenant[]): number {
  if (flag.strategy === "global") return flag.globalEnabled ? tenants.length : 0;
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
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#DBEAFE] ${track} ${
        enabled ? "bg-[#2563EB]" : "bg-[#E5E7EB]"
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
  tenants,
  onConfirm,
  onCancel,
}: {
  flag: FeatureFlag;
  action: "enable" | "disable";
  tenantId: string | null;
  tenants: Tenant[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const tenant = tenantId ? tenantById(tenantId, tenants) : null;
  const isRisky = !flag.stable;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl border border-[#E5E7EB] bg-white shadow-xl p-6 flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${
            action === "enable" ? "bg-[#DBEAFE] border border-[#2563EB]/30" : "bg-[#F5F6FA] border border-[#E5E7EB]"
          }`}>
            {action === "enable" ? "✓" : "○"}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">
              {action === "enable" ? "Enable" : "Disable"} flag?
            </h2>
            <p className="text-[11px] font-medium text-[#6B7280] mt-0.5">{flag.key}</p>
          </div>
        </div>

        <p className="text-xs text-[#6B7280] leading-relaxed">
          {tenant
            ? <>This will {action} <span className="text-[#111827] font-medium">{flag.name}</span> for <span className="font-mono font-semibold text-[#111827]">{tenant.shortCode}</span> only.</>
            : <>This will {action} <span className="text-[#111827] font-medium">{flag.name}</span> globally across all tenants.</>
          }
        </p>

        {isRisky && (
          <div className="flex items-start gap-2 bg-[#FEE2E2] border border-[#DC2626]/30 rounded-lg px-3 py-2.5">
            <span className="text-[#DC2626] text-xs mt-px">⚠</span>
            <p className="text-[11px] text-[#DC2626] leading-relaxed">
              This is an experimental flag. Changes may cause instability. Proceed with caution.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#6B7280] text-sm transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors ${
              action === "enable"
                ? "bg-[#2563EB] hover:bg-[#1D4ED8]"
                : "bg-[#6B7280] hover:bg-[#4B5563]"
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
  tenants,
  onToggleTenant,
}: {
  flag: FeatureFlag;
  tenants: Tenant[];
  onToggleTenant: (flagId: string, tenantId: string, newVal: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
      {tenants.map((tenant) => {
        const override = flag.tenantOverrides.find((o) => o.tenantId === tenant.id);
        const enabled = flag.strategy === "global" ? flag.globalEnabled : (override ? override.enabled : false);
        return (
          <div
            key={tenant.id}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-colors ${
              enabled
                ? "border-[#2563EB]/30 bg-[#DBEAFE]"
                : "border-[#E5E7EB] bg-white"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${tenant.color}`} />
              <span className="text-[11px] font-medium text-[#6B7280]">{tenant.shortCode}</span>
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
  tenants,
  onToggleGlobal,
  onToggleTenant,
  onConfirmRequest,
}: {
  flag: FeatureFlag;
  tenants: Tenant[];
  onToggleGlobal: (flagId: string, newVal: boolean) => void;
  onToggleTenant: (flagId: string, tenantId: string, newVal: boolean) => void;
  onConfirmRequest: (flag: FeatureFlag, action: "enable" | "disable", tenantId: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_META[flag.category];
  const strat = STRATEGY_META[flag.strategy];
  const enabledCount = flagEnabledCount(flag, tenants);

  return (
    <div className={`rounded-xl border transition-colors ${
      flag.stable ? "border-[#E5E7EB]" : "border-[#DC2626]/30"
    } bg-white shadow-sm overflow-hidden`}>
      {/* Card header */}
      <div className="flex items-start gap-4 px-4 py-4">
        {/* Left: text */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cat.bg} ${cat.text} ${cat.border}/30`}>
              {cat.icon} {cat.label}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${strat.bg} ${strat.text} ${strat.border}/30`}>
              {strat.label}
            </span>
            {!flag.stable && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border text-[#DC2626] bg-[#FEE2E2] border-[#DC2626]/30">
                ⚠ Unstable
              </span>
            )}
            {flag.strategy === "percentage" && flag.percentage !== undefined && (
              <span className="text-[10px] font-medium text-[#EA580C]">{flag.percentage}% rollout</span>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#111827]">{flag.name}</h3>
            <p className="text-[11px] font-medium text-[#6B7280] mt-0.5 truncate">{flag.key}</p>
          </div>

          <p className="text-xs text-[#6B7280] leading-relaxed hidden sm:block">{flag.description}</p>
        </div>

        {/* Right: global toggle + meta */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#6B7280]">
              {flag.strategy === "global"
                ? flag.globalEnabled ? "On" : "Off"
                : `${enabledCount} / ${tenants.length}`}
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
            <p className="text-[10px] font-medium text-[#6B7280]">{flag.lastModified}</p>
            <p className="text-[10px] font-medium text-[#6B7280] truncate max-w-[140px]">{flag.modifiedBy}</p>
          </div>
        </div>
      </div>

      {/* Description on mobile */}
      <p className="text-xs text-[#6B7280] leading-relaxed px-4 pb-3 sm:hidden">{flag.description}</p>

      {/* Per-tenant section */}
      {flag.strategy === "per_tenant" && (
        <div className="border-t border-[#E5E7EB] px-4 py-3 bg-[#F5F6FA]">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors w-full"
          >
            <span className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}>▶</span>
            Per-tenant overrides
            <span className="ml-auto text-[10px] font-medium">
              {enabledCount} enabled
            </span>
          </button>
          {expanded && (
            <TenantOverrideGrid
              flag={flag}
              tenants={tenants}
              onToggleTenant={(fId, tId, val) => onConfirmRequest(flag, val ? "enable" : "disable", tId)}
            />
          )}
        </div>
      )}

      {/* Percentage bar */}
      {flag.strategy === "percentage" && flag.percentage !== undefined && (
        <div className="border-t border-[#E5E7EB] px-4 py-3 flex flex-col gap-1.5 bg-[#F5F6FA]">
          <div className="flex justify-between text-[11px] font-medium text-[#6B7280]">
            <span>Rollout percentage</span>
            <span className="text-[#EA580C]">{flag.percentage}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#EA580C] transition-all duration-700"
              style={{ width: `${flag.percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Loading State ────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="h-4 w-32 bg-[#F5F6FA] rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-[#F5F6FA] rounded mt-2 animate-pulse"></div>
          <div className="h-4 w-64 bg-[#F5F6FA] rounded mt-1 animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
            <div className="h-8 w-16 bg-[#F5F6FA] rounded animate-pulse"></div>
            <div className="h-3 w-20 bg-[#F5F6FA] rounded mt-1 animate-pulse"></div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 h-11 bg-[#F5F6FA] rounded-lg animate-pulse"></div>
        <div className="h-11 w-32 bg-[#F5F6FA] rounded-lg animate-pulse"></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-20 bg-[#F5F6FA] rounded-lg animate-pulse"></div>
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-[#F5F6FA] rounded-xl animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<FlagCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [showEnabled, setShowEnabled] = useState<"all" | "on" | "off">("all");
  const [pendingConfirm, setPendingConfirm] = useState<{
    flag: FeatureFlag;
    action: "enable" | "disable";
    tenantId: string | null;
  } | null>(null);

  // ── Load Data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch tenants
        const tenantsRes = await fetch('/api/tenants', { cache: 'no-store' });
        if (!tenantsRes.ok) throw new Error('Failed to load tenants');
        const tenantsData = await tenantsRes.json();
        const tenantsList = Array.isArray(tenantsData.tenants) ? tenantsData.tenants : 
                           Array.isArray(tenantsData) ? tenantsData : [];
        setTenants(tenantsList);

        // Fetch feature flags
        const flagsRes = await fetch('/api/feature-flags', { cache: 'no-store' });
        if (!flagsRes.ok) throw new Error('Failed to load feature flags');
        const flagsData = await flagsRes.json();
        const flagsList = Array.isArray(flagsData.flags) ? flagsData.flags : 
                         Array.isArray(flagsData) ? flagsData : [];
        setFlags(flagsList);
      } catch (err: any) {
        setError(err?.message || 'Unable to load feature flags');
        setFlags([]);
        setTenants([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = flags.filter((f) => {
    const matchCat = categoryFilter === "all" || f.category === categoryFilter;
    const matchSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.key.toLowerCase().includes(search.toLowerCase());
    const enabled = f.strategy === "global" ? f.globalEnabled : flagEnabledCount(f, tenants) > 0;
    const matchEnabled =
      showEnabled === "all" ||
      (showEnabled === "on" && enabled) ||
      (showEnabled === "off" && !enabled);
    return matchCat && matchSearch && matchEnabled;
  });

  const totalOn = flags.filter((f) =>
    f.strategy === "global" ? f.globalEnabled : flagEnabledCount(f, tenants) > 0
  ).length;
  const totalExperimental = flags.filter((f) => !f.stable).length;

  // ── Mutations ──────────────────────────────────────────────────────────────

  async function applyConfirm() {
    if (!pendingConfirm) return;
    const { flag, action, tenantId } = pendingConfirm;
    const val = action === "enable";

    try {
      // Optimistic update
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

      // API call
      const endpoint = tenantId === null 
        ? `/api/feature-flags/${flag.id}/global`
        : `/api/feature-flags/${flag.id}/tenants/${tenantId}`;
      
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: val }),
      });

      if (!res.ok) {
        // Revert on error
        throw new Error('Failed to update flag');
      }

      // Refresh data to ensure consistency
      const refreshRes = await fetch('/api/feature-flags', { cache: 'no-store' });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setFlags(Array.isArray(data.flags) ? data.flags : Array.isArray(data) ? data : []);
      }
    } catch (err) {
      // Revert optimistic update by refetching
      const refreshRes = await fetch('/api/feature-flags', { cache: 'no-store' });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setFlags(Array.isArray(data.flags) ? data.flags : Array.isArray(data) ? data : []);
      }
    } finally {
      setPendingConfirm(null);
    }
  }

  function handleConfirmRequest(
    flag: FeatureFlag,
    action: "enable" | "disable",
    tenantId: string | null
  ) {
    setPendingConfirm({ flag, action, tenantId });
  }

  const categories: Array<FlagCategory | "all"> = ["all", "attendance", "notifications", "auth", "reporting", "experimental"];

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">Feature Flags</h1>
          <p className="text-[#6B7280] text-sm mt-1">Control feature rollout per tenant.</p>
        </div>
        <div className="bg-[#FEE2E2] border border-[#DC2626]/30 rounded-xl p-4 text-[#DC2626] text-sm">
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-3 text-[#2563EB] hover:text-[#1D4ED8] font-medium underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280]">Chronos · Platform</p>
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">Feature Flags</h1>
          <p className="text-sm text-[#6B7280] mt-1">Control feature rollout per tenant. Unstable flags require confirmation.</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
            <span className="text-[11px] font-medium text-[#6B7280]">{totalOn} active</span>
          </div>
          {totalExperimental > 0 && (
            <div className="flex items-center gap-1.5 bg-[#FEE2E2] border border-[#DC2626]/30 rounded-lg px-3 py-2">
              <span className="text-[11px] font-medium text-[#DC2626]">⚗ {totalExperimental} experimental</span>
            </div>
          )}
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total flags", value: flags.length, color: "text-[#111827]" },
          { label: "Enabled", value: totalOn, color: "text-[#2563EB]" },
          { label: "Disabled", value: flags.length - totalOn, color: "text-[#6B7280]" },
          { label: "Experimental", value: totalExperimental, color: "text-[#DC2626]" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 flex flex-col gap-0.5 shadow-sm">
            <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            <span className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm pointer-events-none">⌕</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or key…"
            className="w-full bg-white border border-[#E5E7EB] rounded-lg pl-8 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] transition-colors"
          />
        </div>
        {/* Status toggle */}
        <div className="flex items-center gap-1 bg-white border border-[#E5E7EB] rounded-lg p-1 h-fit shadow-sm">
          {(["all", "on", "off"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setShowEnabled(opt)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium uppercase tracking-wider transition-all ${
                showEnabled === opt
                  ? "bg-[#2563EB] text-white"
                  : "text-[#6B7280] hover:text-[#111827]"
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                active
                  ? "border-[#2563EB] bg-[#DBEAFE] text-[#2563EB]"
                  : "border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:border-[#6B7280]"
              }`}
            >
              {meta && <span>{meta.icon}</span>}
              {cat === "all" ? "All" : meta!.label}
              <span className={`rounded px-1.5 py-px text-[10px] font-medium ${
                active ? "bg-[#2563EB]/10 text-[#2563EB]" : "bg-[#F5F6FA] text-[#6B7280]"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Flag cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-16 flex flex-col items-center gap-2 shadow-sm">
          <p className="text-[#6B7280] text-sm font-medium">No flags match your filters.</p>
          <p className="text-[#9CA3AF] text-xs font-medium">Try adjusting the search or category.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((flag) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              tenants={tenants}
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
          tenants={tenants}
          onConfirm={applyConfirm}
          onCancel={() => setPendingConfirm(null)}
        />
      )}
    </div>
  );
}