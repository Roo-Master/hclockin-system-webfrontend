'use client';
import { useEffect } from 'react';
import { HODLayout } from '@/components/layout/HODLayout';
import { StatCard, StatusBadge, Spinner, Alert, EmptyState } from '@/components/ui';
import { getDisplayStatus, useHODDashboard, useHODProfile } from '../../../hod-hooks';
import type { AttendanceSummary } from '@/types';



function formatTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function HODDashboardPage() {
  const { user, departmentId, error: profileError } = useHODProfile();
  const { summaries, loading, error, setError, loadDashboard, metrics } = useHODDashboard();
  const { presentCount, lateCount, absentCount, pendingCount, leaveCount, total, rate } = metrics;

  useEffect(() => {
    if (profileError) setError(profileError);
  }, [profileError, setError]);

  useEffect(() => {
    if (departmentId) loadDashboard(departmentId);
  }, [departmentId, loadDashboard]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <HODLayout
      title="Dashboard"
      subtitle={`${user?.department?.name ?? 'Department'} · Today's Overview`}>

      {error && (
        <Alert type="error" message={error} onRetry={() => departmentId && loadDashboard(departmentId)} />
      )}

      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-display font-semibold text-text-primary">
          {greeting()}{user?.firstName ? `, ${user.firstName}` : ''}.
        </h2>
        <p className="text-text-primary text-body font-medium mt-1">
          Here&apos;s your department snapshot for{' '}
          <span className="font-semibold text-text-primary">
            {new Date().toLocaleDateString('en-KE', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard label="Present" value={presentCount} sub={`of ${total} staff`} accent="success"
              icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <StatCard label="Late" value={lateCount} sub="flagged arrivals" accent="warning"
              icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <StatCard label="Absent" value={absentCount} sub="shift already started" accent="danger"
              icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            {pendingCount > 0 && (
              <StatCard label="Not Started Yet" value={pendingCount} sub="shift hasn't begun" accent="info"
                icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            )}
            <StatCard label="On Leave" value={leaveCount} sub="approved" accent="warning"
              icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>} />
          </div>

          {/* Attendance Rate Bar */}
          <div className="bg-bg-surface rounded-card border border-border p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold text-text-primary">Department Attendance Rate</span>
              <span className={`text-base font-bold ${rate >= 80 ? 'text-success' : rate >= 60 ? 'text-warning' : 'text-danger'}`}>
                {rate}%
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${rate >= 80 ? 'bg-success' : rate >= 60 ? 'bg-warning' : 'bg-danger'}`}
                style={{ width: `${rate}%` }} />
            </div>
            <div className="flex justify-between text-sm font-bold text-text-primary mt-1">
              <span>0%</span>
              <span>Target: 85%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Today's Staff Status Table */}
          <div className="bg-bg-surface rounded-card border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-2xl font-bold text-text-primary">Today&apos;s Staff Status</h3>
              <a href="/hod/attendance" className="text-sm text-info hover:text-blue-700 font-bold transition-colors">
                View all →
              </a>
            </div>

            {summaries.length === 0 ? (
              <EmptyState
                title="No attendance records yet"
                message="Staff clock-in data for today will appear here as the day progresses."
                icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-6 py-3 font-bold text-text-primary text-xs uppercase tracking-wide">Employee</th>
                      <th className="px-4 py-3 font-bold text-text-primary text-xs uppercase tracking-wide">Shift</th>
                      <th className="px-4 py-3 font-bold text-text-primary text-xs uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 font-bold text-text-primary text-xs uppercase tracking-wide">Clock In</th>
                      <th className="px-4 py-3 font-bold text-text-primary text-xs uppercase tracking-wide">Clock Out</th>
                      <th className="px-4 py-3 font-bold text-text-primary text-xs uppercase tracking-wide">Late (min)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {summaries.map((s: AttendanceSummary) => (
                      <tr key={s.id} className="hover:bg-info-bg/40 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/hod/attendance/${s.id}`}>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-info-bg flex items-center justify-center flex-shrink-0">
                              <span className="text-info text-xs font-bold">
                                {s.user.firstName?.[0]}{s.user.lastName?.[0]}
                              </span>
                            </div>
                            <span className="font-semibold text-text-primary">
                              {s.user.firstName} {s.user.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-text-primary font-semibold">{s.shiftName ?? '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={getDisplayStatus(s).status} /></td>
                        <td className="px-4 py-3 font-mono text-text-primary text-xs">{formatTime(s.firstIn)}</td>
                        <td className="px-4 py-3 font-mono text-text-primary text-xs">{formatTime(s.lastOut)}</td>
                        <td className="px-4 py-3">
                          {s.lateMinutes > 0
                            ? <span className="text-warning font-bold">{s.lateMinutes}</span>
                            : <span className="text-text-primary/60">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </HODLayout>
  );
}
