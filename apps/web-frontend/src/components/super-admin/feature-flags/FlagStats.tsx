'use client';

import { Card } from '@/components/common';
import { FeatureFlag } from '@/types/(super-admin)/feature-flags';

interface FlagStatsProps {
  flags: FeatureFlag[];
}

export function FlagStats({ flags }: FlagStatsProps) {
  const total = flags.length;
  const enabled = flags.filter((f) => {
    if (f.strategy === 'global') return f.globalEnabled;
    if (f.strategy === 'per_tenant') return f.tenantOverrides.some((o) => o.enabled);
    return f.globalEnabled;
  }).length;
  const disabled = total - enabled;
  const experimental = flags.filter((f) => !f.stable).length;

  const stats = [
    { label: 'Total Flags', value: total, color: 'text-text-primary' },
    { label: 'Enabled', value: enabled, color: 'text-success' },
    { label: 'Disabled', value: disabled, color: 'text-text-secondary' },
    { label: 'Experimental', value: experimental, color: 'text-danger' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-secondary mt-0.5">
            {stat.label}
          </p>
        </Card>
      ))}
    </div>
  );
}
