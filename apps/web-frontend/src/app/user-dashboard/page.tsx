'use client';

import DashboardLayout from '@/components/user-components/layout/DashboardLayout';
import {
  useMyAttendance,
  useMyCorrections,
  useMyLeaveBalances,
  useMyLeaveHistory,
  useMyNotifications,
  useMyProfile,
  useMyShifts,
} from '@/hooks/user-hooks/useGeneralUser';

export default function UserDashboardPage() {
  const { data: attendanceData, loading: attendanceLoading } = useMyAttendance();
  const { data: balancesData, loading: balancesLoading } = useMyLeaveBalances();
  const { data: leaveData, loading: leaveLoading } = useMyLeaveHistory();
  const { data: shiftsData, loading: shiftsLoading } = useMyShifts();
  const { data: notificationsData, loading: notificationsLoading } = useMyNotifications();
  const { data: profileData, loading: profileLoading } = useMyProfile();
  const { data: correctionsData, loading: correctionsLoading } = useMyCorrections();

  const attendance = attendanceData?.data ?? attendanceData ?? [];
  const balances = balancesData?.data ?? balancesData ?? [];
  const leaves = leaveData?.data ?? leaveData ?? [];
  const shifts = shiftsData?.data ?? shiftsData ?? [];
  const notifications = notificationsData?.data ?? notificationsData ?? [];
  const corrections = correctionsData?.data ?? correctionsData ?? [];
  const profile = (profileData as { data?: Record<string, unknown> })?.data ?? profileData ?? {};

  const presentDays = attendance.filter((r: { status?: string }) => r.status === 'PRESENT').length;
  const totalHours = attendance.reduce((sum: number, r: { totalHours?: number }) => sum + (r.totalHours ?? 0), 0);
  const unreadNotifications = notifications.filter((n: { readAt?: string; isRead?: boolean }) => !n.readAt && !n.isRead).length;
  const pendingLeave = leaves.filter((l: { status?: string }) => l.status === 'PENDING').length;
  const upcomingShifts = shifts.slice(0, 3);
  const recentAttendance = attendance.slice(0, 5);
  const recentNotifications = notifications.slice(0, 3);
  const recentCorrections = corrections.slice(0, 3);
  const annualBalance = balances.find((b: { leaveType?: string }) => String(b.leaveType ?? '').toUpperCase() === 'ANNUAL');
  const annualRemaining = annualBalance
    ? ((annualBalance.totalDays ?? annualBalance.total ?? 0) as number) - ((annualBalance.usedDays ?? annualBalance.used ?? 0) as number) - ((annualBalance.pendingDays ?? annualBalance.pending ?? 0) as number)
    : 0;

  const fullName = String((profile as Record<string, unknown>).fullName ?? (profile as Record<string, unknown>).name ?? 'User');
  const department = String(((profile as Record<string, unknown>).department as { name?: string })?.name ?? (profile as Record<string, unknown>).department ?? '—');
  const position = String((profile as Record<string, unknown>).position ?? (profile as Record<string, unknown>).jobTitle ?? '—');
  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const latestMissingCorrection = corrections.find((item: { status?: string }) => item.status === 'PENDING');

  return (
    <DashboardLayout title="Dashboard">
      <div className="flex flex-col gap-5">
        {latestMissingCorrection && (
          <div className="flex items-center gap-3 bg-warning-bg border border-warning/30 rounded-card px-4 py-3 text-sm text-primary">
            <span className="text-warning text-base">⚠</span>
            <span className="flex-1">You have a pending correction request under review.</span>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Present days</p>
            <p className="text-stat font-bold text-success">{attendanceLoading ? '—' : presentDays}</p>
            <p className="text-label text-secondary mt-1">This month</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Hours worked</p>
            <p className="text-stat font-bold text-info">{attendanceLoading ? '—' : `${totalHours.toFixed(0)}h`}</p>
            <p className="text-label text-secondary mt-1">This month</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Pending leave</p>
            <p className="text-stat font-bold text-warning">{leaveLoading ? '—' : pendingLeave}</p>
            <p className="text-label text-secondary mt-1">Awaiting approval</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Unread notifications</p>
            <p className="text-stat font-bold text-primary">{notificationsLoading ? '—' : unreadNotifications}</p>
            <p className="text-label text-secondary mt-1">Needs your attention</p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_300px] gap-5">
          <div className="flex flex-col gap-5">
            <div className="bg-surface border border-border rounded-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading text-primary">Recent attendance</h2>
                <a href="/user-dashboard/attendance" className="text-label text-success hover:underline">View full history →</a>
              </div>
              {attendanceLoading ? (
                <p className="text-label text-secondary">Loading...</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentAttendance.map((row: { id?: string; date?: string; totalHours?: number; status?: string }, index: number) => (
                    <div key={String(row.id ?? index)} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-body font-medium text-primary">{row.date ? new Date(row.date).toDateString() : '—'}</p>
                        <p className="text-label text-secondary">{row.totalHours ? `${row.totalHours} hours worked` : 'No hours recorded'}</p>
                      </div>
                      <span className="text-label font-medium text-secondary">{row.status ?? '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-surface border border-border rounded-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading text-primary">Upcoming shifts</h2>
                <a href="/user-dashboard/shifts" className="text-label text-success hover:underline">Full schedule →</a>
              </div>
              {shiftsLoading ? (
                <p className="text-label text-secondary">Loading...</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcomingShifts.map((shift: Record<string, unknown>, index: number) => {
                    const shiftName = String(shift.shiftName ?? shift.name ?? (shift.shift as { name?: string })?.name ?? 'Shift');
                    const date = (shift.date ?? shift.startTime) as string | undefined;
                    const startTime = shift.startTime as string | undefined;
                    const endTime = shift.endTime as string | undefined;
                    return (
                      <div key={String(shift.id ?? index)} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="text-body font-medium text-primary">{shiftName}</p>
                          <p className="text-label text-secondary">
                            {date ? new Date(date).toDateString() : '—'}
                            {startTime ? ` · ${new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                            {endTime ? ` - ${new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                          </p>
                        </div>
                        <span className="text-label font-medium text-secondary">{String(shift.status ?? '—')}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-surface border border-border rounded-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading text-primary">Leave requests</h2>
                <a href="/user-dashboard/leave-history" className="text-label text-success hover:underline">See all →</a>
              </div>
              {leaveLoading ? (
                <p className="text-label text-secondary">Loading...</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {leaves.slice(0, 3).map((leave: Record<string, unknown>, index: number) => (
                    <div key={String(leave.id ?? index)} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-body font-medium text-primary">{String(leave.leaveType ?? leave.type ?? 'Leave')}</p>
                        <p className="text-label text-secondary">
                          {(leave.startDate as string) ? new Date(String(leave.startDate)).toDateString() : '—'}
                          {' - '}
                          {(leave.endDate as string) ? new Date(String(leave.endDate)).toDateString() : '—'}
                        </p>
                      </div>
                      <span className="text-label font-medium text-secondary">{String(leave.status ?? '—')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="bg-surface border border-border rounded-card p-5 text-center">
              <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center text-success text-2xl font-semibold mx-auto mb-3">
                {profileLoading ? '—' : initials}
              </div>
              <h3 className="text-body font-bold text-primary">{profileLoading ? 'Loading...' : fullName}</h3>
              <p className="text-label text-secondary">{position} · {department}</p>
            </div>

            <div className="bg-surface border border-border rounded-card p-5">
              <h2 className="text-heading text-primary mb-4">Leave balance</h2>
              {balancesLoading ? (
                <p className="text-label text-secondary">Loading...</p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-stat font-bold text-success">{annualRemaining}</p>
                    <p className="text-label text-secondary">Annual days remaining</p>
                  </div>
                  {balances.slice(0, 4).map((balance: Record<string, unknown>, index: number) => {
                    const total = Number(balance.totalDays ?? balance.total ?? 0);
                    const used = Number(balance.usedDays ?? balance.used ?? 0);
                    const pending = Number(balance.pendingDays ?? balance.pending ?? 0);
                    const remaining = total - used - pending;
                    return (
                      <div key={String(balance.id ?? index)}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-label text-secondary">{String(balance.leaveType ?? 'Leave')}</span>
                          <span className="text-label text-secondary">{remaining} / {total} days</span>
                        </div>
                        <div className="h-1.5 bg-page rounded-pill overflow-hidden">
                          <div className="h-full rounded-pill bg-success" style={{ width: `${total > 0 ? Math.max(0, Math.round((remaining / total) * 100)) : 0}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-surface border border-border rounded-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading text-primary">Notifications</h2>
                <a href="/user-dashboard/notifications" className="text-label text-success hover:underline">See all →</a>
              </div>
              {notificationsLoading ? (
                <p className="text-label text-secondary">Loading...</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentNotifications.map((notification: Record<string, unknown>, index: number) => (
                    <div key={String(notification.id ?? index)} className="border-b border-border pb-3 last:border-0 last:pb-0">
                      <p className="text-body text-primary">{String(notification.message ?? notification.body ?? notification.title ?? 'Notification')}</p>
                      <p className="text-label text-secondary mt-1">
                        {notification.createdAt ? new Date(String(notification.createdAt)).toLocaleString() : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-surface border border-border rounded-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading text-primary">Corrections</h2>
                <a href="/user-dashboard/correction-request" className="text-label text-success hover:underline">Manage →</a>
              </div>
              {correctionsLoading ? (
                <p className="text-label text-secondary">Loading...</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentCorrections.map((item: Record<string, unknown>, index: number) => (
                    <div key={String(item.id ?? index)} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-body text-primary">{String(item.issueType ?? item.issue ?? 'Correction')}</p>
                        <p className="text-label text-secondary">{item.date ? new Date(String(item.date)).toDateString() : '—'}</p>
                      </div>
                      <span className="text-label font-medium text-secondary">{String(item.status ?? 'PENDING')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
