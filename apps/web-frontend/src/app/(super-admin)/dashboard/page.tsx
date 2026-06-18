'use client';

import { useEffect, useState } from 'react';
import { PlatformStatsGrid } from '@/components/super-admin/stats/PlatformStatsGrid';
import { TenantsTable } from '@/components/super-admin/tenants/TenantsTable';
import { MrrChart, TenantStatusBreakdown } from '@/components/super-admin/stats/Charts';

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/super-admin/dashboard', { cache: 'no-store' });
        const json = await res.json();
        setData(json);
      } catch {
        setData(null);
      }
    };
    load();
  }, []);

  return (
    // bg-page = #F5F6FA per design doc §3.2
    <div className="min-h-screen bg-page px-8 py-8 space-y-6">

      {/* Header bar — §7.3 */}
      <div className="flex items-start justify-between">
        <div>
          {/* text-display = 24px/600 per §4.1 */}
          <h1 className="text-display text-primary">Platform Overview</h1>
          {/* text-body = 14px per §4.1 */}
          <p className="text-body text-secondary mt-1">Chronos Super Admin Console</p>
        </div>

        {/* Live indicator — right side of header */}
        <div className="flex items-center gap-2 text-label text-secondary bg-surface border border-border px-3 py-1.5 rounded-badge">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" aria-hidden="true" />
          Live
        </div>
      </div>

      {/* KPI stat row — §7.2 */}
      <PlatformStatsGrid data={data?.stats} />

      {/* Trends row: ~5:3.5 split — §2.2 */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <MrrChart data={data?.mrrSeries ?? []} />
        </div>
        <div className="col-span-4">
          <TenantStatusBreakdown data={data?.tenantStatusBreakdown ?? []} />
        </div>
      </div>

      {/* Tenants table — full width */}
      <TenantsTable data={data?.tenants ?? []} />
    </div>
  );
}