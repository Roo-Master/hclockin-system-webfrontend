'use client';

import { useState } from 'react';
import { Card, StatusBadge, Button } from '@/components/common';
import { Toggle } from '@/components/ui';
import { cn } from '@/lib/utils';
import { FeatureFlag, Tenant } from '@/types/feature-flags';

interface FlagCardProps {
  flag: FeatureFlag;
  tenants: Tenant[];
  onToggleGlobal: (flagId: string, enabled: boolean) => Promise<void>;
  onToggleTenant: (flagId: string, tenantId: string, enabled: boolean) => Promise<void>;
  onEdit?: (flag: FeatureFlag) => void;
  onDelete?: (flagId: string) => void;
}

const CATEGORY_META: Record<string, { label: string; icon: string; bg: string; text: string; border: string }> = {
  attendance: {
    label: 'Attendance',
    icon: '⏱',
    bg: 'bg-info-bg',
    text: 'text-info',
    border: 'border-info/30',
  },
  notifications: {
    label: 'Notifications',
    icon: '🔔',
    bg: 'bg-[#E5E7EB]',
    text: 'text-text-secondary',
    border: 'border-border',
  },
  auth: {
    label: 'Auth',
    icon: '🔒',
    bg: 'bg-success-bg',
    text: 'text-success',
    border: 'border-success/30',
  },
  reporting: {
    label: 'Reporting',
    icon: '📊',
    bg: 'bg-warning-bg',
    text: 'text-warning',
    border: 'border-warning/30',
  },
  experimental: {
    label: 'Experimental',
    icon: '⚗️',
    bg: 'bg-danger-bg',
    text: 'text-danger',
    border: 'border-danger/30',
  },
};

const STRATEGY_META: Record<string, { label: string; bg: string; text: string; border: string }> = {
  global: {
    label: 'Global',
    bg: 'bg-page',
    text: 'text-text-secondary',
    border: 'border-border',
  },
  per_tenant: {
    label: 'Per-tenant',
    bg: 'bg-info-bg',
    text: 'text-info',
    border: 'border-info/30',
  },
  percentage: {
    label: 'Percentage',
    bg: 'bg-warning-bg',
    text: 'text-warning',
    border: 'border-warning/30',
  },
};

export function FlagCard({
  flag,
  tenants,
  onToggleGlobal,
  onToggleTenant,
  onEdit,
  onDelete,
}: FlagCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const cat = CATEGORY_META[flag.category] || CATEGORY_META.attendance;
  const strat = STRATEGY_META[flag.strategy] || STRATEGY_META.global;

  const enabledCount = flag.tenantOverrides.filter((o) => o.enabled).length;
  const isEnabled = flag.strategy === 'global' 
    ? flag.globalEnabled 
    : enabledCount > 0;

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (flag.strategy === 'global') {
        await onToggleGlobal(flag.id, !flag.globalEnabled);
      } else {
        // For per_tenant, toggle all tenants
        await Promise.all(
          tenants.map((tenant) => {
            const override = flag.tenantOverrides.find((o) => o.tenantId === tenant.id);
            const currentState = override?.enabled || false;
            return onToggleTenant(flag.id, tenant.id, !currentState);
          })
        );
      }
    } catch (error) {
      console.error('Failed to toggle flag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantToggle = async (tenantId: string, enabled: boolean) => {
    setLoading(true);
    try {
      await onToggleTenant(flag.id, tenantId, enabled);
    } catch (error) {
      console.error('Failed to toggle tenant flag:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        'transition-colors',
        !flag.stable && 'border-danger/30',
        loading && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Left: Flag info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border',
                cat.bg,
                cat.text,
                cat.border
              )}
            >
              {cat.icon} {cat.label}
            </span>
            <span
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border',
                strat.bg,
                strat.text,
                strat.border
              )}
            >
              {strat.label}
            </span>
            {!flag.stable && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border text-danger bg-danger-bg border-danger/30">
                ⚠ Unstable
              </span>
            )}
            {flag.strategy === 'percentage' && flag.percentage !== undefined && (
              <span className="text-[10px] font-medium text-warning">
                {flag.percentage}% rollout
              </span>
            )}
          </div>

          <div className="mt-1.5">
            <h3 className="text-sm font-semibold text-text-primary">{flag.name}</h3>
            <p className="text-[11px] font-medium text-text-secondary mt-0.5 truncate">
              {flag.key}
            </p>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed hidden sm:block mt-2">
            {flag.description}
          </p>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-text-secondary">
              {flag.strategy === 'global'
                ? flag.globalEnabled ? 'On' : 'Off'
                : `${enabledCount} / ${tenants.length}`}
            </span>
            <Toggle
              enabled={isEnabled}
              onChange={handleToggle}
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-text-tertiary">
              {flag.lastModified}
            </span>
            <span className="text-[10px] font-medium text-text-tertiary">
              by {flag.modifiedBy.split('@')[0]}
            </span>
          </div>
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(flag)}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(flag.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description on mobile */}
      <p className="text-xs text-text-secondary leading-relaxed sm:hidden mt-3">
        {flag.description}
      </p>

      {/* Per-tenant section */}
      {flag.strategy === 'per_tenant' && tenants.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors w-full"
          >
            <span className={cn(
              'transition-transform duration-200',
              expanded && 'rotate-90'
            )}>
              ▶
            </span>
            Per-tenant overrides
            <span className="ml-auto text-[10px] font-medium">
              {enabledCount} enabled
            </span>
          </button>

          {expanded && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {tenants.map((tenant) => {
                const override = flag.tenantOverrides.find(
                  (o) => o.tenantId === tenant.id
                );
                const enabled = override ? override.enabled : false;

                return (
                  <div
                    key={tenant.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-3 py-2 transition-colors',
                      enabled
                        ? 'border-info/30 bg-info-bg'
                        : 'border-border bg-surface'
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={cn('h-1.5 w-1.5 rounded-full', tenant.color)} />
                      <span className="text-[11px] font-medium text-text-secondary">
                        {tenant.shortCode}
                      </span>
                    </div>
                    <Toggle
                      size="sm"
                      enabled={enabled}
                      onChange={(val) => handleTenantToggle(tenant.id, val)}
                      disabled={loading || flag.strategy === 'global'}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Percentage bar */}
      {flag.strategy === 'percentage' && flag.percentage !== undefined && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between text-[11px] font-medium text-text-secondary">
            <span>Rollout percentage</span>
            <span className="text-warning">{flag.percentage}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-warning transition-all duration-700"
              style={{ width: `${flag.percentage}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
