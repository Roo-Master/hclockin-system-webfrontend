'use client';
import DashboardLayout from '@/components/employee-components/layout/DashboardLayout';
import { useMyClockLogs } from '@/hooks/hr-hooks/useGeneralUser';

export default function ClockHistoryPage() {
  const { data, loading, error } = useMyClockLogs();
  const logs = data?.data ?? [];

  const clockIns = logs.filter((l: { direction: string }) => l.direction === 'IN').length;
  const clockOuts = logs.filter((l: { direction: string }) => l.direction === 'OUT').length;
  const missing = clockIns - clockOuts;

  return (
    <DashboardLayout title="Clock History">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Total clock-ins</p>
            <p className="text-stat font-bold text-success">{loading ? '—' : clockIns}</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Total clock-outs</p>
            <p className="text-stat font-bold text-info">{loading ? '—' : clockOuts}</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Missing clock-outs</p>
            <p className="text-stat font-bold text-warning">{loading ? '—' : missing > 0 ? missing : 0}</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-4">Clock log</h2>
          {loading && <p className="text-label text-secondary">Loading...</p>}
          {error && <p className="text-label text-danger">Error: {error}</p>}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-[160px_80px_100px_1fr_90px] gap-3 px-2 pb-2 border-b border-border">
                <span className="text-label text-secondary">Date</span>
                <span className="text-label text-secondary">Time</span>
                <span className="text-label text-secondary">Type</span>
                <span className="text-label text-secondary">Device</span>
                <span className="text-label text-secondary">Status</span>
              </div>
              {logs.map((log: { id: string; timestamp: string; direction: string; deviceId?: string }) => (
                <div
                  key={log.id}
                  className="grid grid-cols-[160px_80px_100px_1fr_90px] gap-3 px-2 py-3 border-b border-border last:border-0 items-center"
                >
                  <span className="text-label text-secondary">{new Date(log.timestamp).toDateString()}</span>
                  <span className="text-body font-medium text-primary">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`text-label font-medium ${log.direction === 'IN' ? 'text-success' : 'text-info'}`}>
                    Clock {log.direction === 'IN' ? 'In' : 'Out'}
                  </span>
                  <span className="text-label text-secondary">{log.deviceId ?? '—'}</span>
                  <span className="text-label font-medium px-2 py-0.5 rounded-pill w-fit bg-success-bg text-success">
                    Success
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
