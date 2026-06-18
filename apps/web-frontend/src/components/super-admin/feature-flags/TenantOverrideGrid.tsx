'use client';

import { cn } from '@/lib/(super-admin)/utils';
import { Toggle } from '@/components/ui';
import { Tenant, TenantOverride } from '@/types/(super-admin)/feature-flags';

interface TenantOverrideGridProps {
  tenants: Tenant[];
  overrides: TenantOverride[];
  onToggle: (tenantId: string, enabled: boolean) => void;
  disabled?: boolean;
}

export function TenantOverrideGrid({
  tenants,
  overrides,
  onToggle,
  disabled = false,
}: TenantOverrideGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {tenants.map((tenant) => {
        const override = overrides.find((o) => o.tenantId === tenant.id);
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
              onChange={(val) => onToggle(tenant.id, val)}
              disabled={disabled}
            />
          </div>
        );
      })}
    </div>
  );
}
