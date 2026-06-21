'use client';
import DashboardLayout from '@/components/employee-components/layout/DashboardLayout';
import { useMyLeaveBalances } from '@/hooks/hr-hooks/useGeneralUser';

const COLORS: Record<string, string> = {
  ANNUAL: 'bg-success',
  SICK: 'bg-info',
  COMPASSIONATE: 'bg-warning',
  MATERNITY: 'bg-danger',
  PATERNITY: 'bg-primary',
  STUDY: 'bg-secondary',
};

export default function LeaveBalancesPage() {
  const { data, loading, error } = useMyLeaveBalances();
  const balances: Array<Record<string, unknown>> = Array.isArray(data) ? data : (data?.data ?? []);

  return (
    <DashboardLayout title="Leave Balances">
      <div className="flex flex-col gap-5">
        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-4">Leave balance summary</h2>
          {loading && <p className="text-label text-secondary">Loading...</p>}
          {error && <p className="text-label text-danger">Error: {error}</p>}
          {!loading && !error && (
            <div className="flex flex-col gap-5">
              {balances.map((b) => {
                const used = (b.usedDays ?? b.used ?? 0) as number;
                const pending = (b.pendingDays ?? b.pending ?? 0) as number;
                const total = (b.totalDays ?? b.total ?? 0) as number;
                const remaining = total - used - pending;
                const usedPct = total > 0 ? Math.round((used / total) * 100) : 0;
                const pendPct = total > 0 ? Math.round((pending / total) * 100) : 0;
                const leaveType = String(b.leaveType ?? '');
                const color = COLORS[leaveType.toUpperCase()] ?? 'bg-primary';

                return (
                  <div key={String(b.id ?? b.leaveType)}>
                    <div className="flex justify-between mb-2">
                      <span className="text-body font-medium text-primary">{leaveType}</span>
                      <span className="text-label text-secondary">{remaining} days remaining</span>
                    </div>
                    <div className="h-2 bg-page rounded-pill overflow-hidden flex">
                      <div className={`h-full ${color}`} style={{ width: `${usedPct}%` }} />
                      <div className="h-full bg-warning" style={{ width: `${pendPct}%` }} />
                    </div>
                    <div className="flex justify-between mt-1 text-[11px] text-tertiary">
                      <span>Used: {used} days</span>
                      <span>Pending: {pending} days</span>
                      <span>Remaining: {remaining} days</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
