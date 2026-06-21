'use client';
import DashboardLayout from '@/components/employee-components/layout/DashboardLayout';
import { useMyShifts } from '@/hooks/hr-hooks/useGeneralUser';

export default function ShiftsPage() {
  const { data, loading, error } = useMyShifts();
  const shifts: Array<Record<string, unknown>> = data?.data ?? data ?? [];

  const confirmed = shifts.filter((s) => s.status === 'CONFIRMED').length;
  const pendingRoster = shifts.filter((s) => s.status === 'PENDING').length;

  return (
    <DashboardLayout title="My Shifts">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Upcoming shifts</p>
            <p className="text-stat font-bold text-success">{loading ? '—' : shifts.length}</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Confirmed</p>
            <p className="text-stat font-bold text-info">{loading ? '—' : confirmed}</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Pending roster</p>
            <p className="text-stat font-bold text-warning">{loading ? '—' : pendingRoster}</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-4">Upcoming schedule</h2>
          {loading && <p className="text-label text-secondary">Loading...</p>}
          {error && <p className="text-label text-danger">Error: {error}</p>}
          {!loading &&
            !error &&
            shifts.map((shift, i) => {
              const date = (shift.date ?? shift.startTime) as string | undefined;
              const startTime = shift.startTime as string | undefined;
              const endTime = shift.endTime as string | undefined;
              const status = String(shift.status ?? '');

              return (
                <div
                  key={String(shift.id ?? i)}
                  className="grid grid-cols-[150px_1fr_100px_80px_80px_110px] gap-3 px-2 py-3 border-b border-border last:border-0 items-center"
                >
                  <span className="text-label text-secondary">
                    {date ? new Date(date).toDateString() : '—'}
                  </span>
                  <span className="text-body font-medium text-primary">
                    {String(shift.shiftName ?? shift.name ?? (shift.shift as { name?: string })?.name ?? '—')}
                  </span>
                  <span className="text-label text-secondary">
                    {String((shift.department as { name?: string })?.name ?? '—')}
                  </span>
                  <span className="text-label text-primary">
                    {startTime
                      ? new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </span>
                  <span className="text-label text-primary">
                    {endTime
                      ? new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </span>
                  <span
                    className={`text-label font-medium px-2 py-0.5 rounded-pill w-fit ${
                      status === 'CONFIRMED' ? 'bg-success-bg text-success' : 'bg-info-bg text-info'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </DashboardLayout>
  );
}
