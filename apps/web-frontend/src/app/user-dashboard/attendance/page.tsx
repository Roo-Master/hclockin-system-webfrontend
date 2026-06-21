'use client';
import DashboardLayout from '@/components/employee-components/layout/DashboardLayout';
import { useMyAttendance } from '@/hooks/hr-hooks/useGeneralUser';

export default function AttendancePage() {
  const { data, loading, error } = useMyAttendance();
  const records = data?.data ?? [];

  const presentDays = records.filter((r: { status: string }) => r.status === 'PRESENT').length;
  const absentDays = records.filter((r: { status: string }) => r.status === 'ABSENT').length;
  const totalHours = records.reduce(
    (acc: number, r: { totalHours?: number }) => acc + (r.totalHours ?? 0),
    0
  );

  const statusStyle = (status: string) => {
    if (status === 'PRESENT') return 'bg-success-bg text-success';
    if (status === 'ABSENT') return 'bg-danger-bg text-danger';
    if (status === 'LATE') return 'bg-warning-bg text-warning';
    return 'bg-page text-secondary';
  };

  return (
    <DashboardLayout title="My Attendance">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Present days</p>
            <p className="text-stat font-bold text-success">{loading ? '—' : presentDays}</p>
            <p className="text-label text-secondary mt-1">This month</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Absent days</p>
            <p className="text-stat font-bold text-danger">{loading ? '—' : absentDays}</p>
            <p className="text-label text-secondary mt-1">This month</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Attendance rate</p>
            <p className="text-stat font-bold text-primary">
              {loading ? '—' : presentDays + absentDays > 0
                ? `${Math.round((presentDays / (presentDays + absentDays)) * 100)}%`
                : '—'}
            </p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Hours worked</p>
            <p className="text-stat font-bold text-info">{loading ? '—' : `${totalHours.toFixed(0)}h`}</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-4">Attendance history</h2>
          {loading && <p className="text-label text-secondary">Loading...</p>}
          {error && <p className="text-label text-danger">Failed to load attendance: {error}</p>}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-[140px_80px_80px_90px_100px] gap-3 px-2 pb-2 border-b border-border">
                <span className="text-label text-secondary">Date</span>
                <span className="text-label text-secondary">Clock in</span>
                <span className="text-label text-secondary">Clock out</span>
                <span className="text-label text-secondary">Hours</span>
                <span className="text-label text-secondary">Status</span>
              </div>
              {records.map((row: {
                id: string;
                date: string;
                firstIn?: string;
                lastOut?: string;
                totalHours?: number;
                status: string;
              }) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[140px_80px_80px_90px_100px] gap-3 px-2 py-3 border-b border-border last:border-0 items-center"
                >
                  <span className="text-label text-secondary">{new Date(row.date).toDateString()}</span>
                  <span className="text-label text-secondary">
                    {row.firstIn
                      ? new Date(row.firstIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </span>
                  <span className="text-label text-secondary">
                    {row.lastOut
                      ? new Date(row.lastOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </span>
                  <span className="text-label text-primary font-medium">
                    {row.totalHours ? `${row.totalHours}h` : '—'}
                  </span>
                  <span className={`text-label font-medium px-2 py-0.5 rounded-pill w-fit ${statusStyle(row.status)}`}>
                    {row.status}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
