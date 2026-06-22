'use client';

import { useParams } from 'next/navigation';
import { HODLayout } from '@/components/hod-components/layout/HODLayout';
import { StatusBadge, Spinner, Alert, Button, Modal, Select } from '@/components/ui';
import {
  DISCREPANCY_REASONS,
  fmtDateLong,
  fmtTimeLong,
  fmtTimeShort,
  useHODAttendanceDetail,
} from '../../../../hod-hooks';

export default function AttendanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    summary,
    logs,
    audit,
    loading,
    error,
    flagModal,
    setFlagModal,
    flagReason,
    setFlagReason,
    flagNote,
    setFlagNote,
    flagging,
    flagError,
    flagSuccess,
    setFlagSuccess,
    handleFlag,
    metricCards,
  } = useHODAttendanceDetail(id ?? null);

  if (loading) return (
    <HODLayout title="Attendance Detail">
      <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
    </HODLayout>
  );

  if (error || !summary) return (
    <HODLayout title="Attendance Detail">
      <Alert type="error" message={error || 'Record not found.'} />
      <Button variant="secondary" className="mt-4" onClick={() => window.history.back()}>← Back</Button>
    </HODLayout>
  );

  return (
    <HODLayout
      title="Attendance Detail"
      subtitle={`${summary.user.firstName} ${summary.user.lastName} · ${fmtDateLong(summary.date)}`}>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Button variant="secondary" size="sm" onClick={() => window.history.back()}>
          ← Back to Attendance
        </Button>
        <Button variant="secondary" size="sm" onClick={() => { setFlagModal(true); setFlagSuccess(false); }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
          </svg>
          Flag Discrepancy
        </Button>
      </div>

      {flagSuccess && (
        <div className="mb-6">
          <Alert type="success" message="Discrepancy flagged for HR review. They'll follow up on this record." />
        </div>
      )}

      <div className="bg-bg-surface rounded-card border border-border shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-info-bg flex items-center justify-center">
              <span className="text-info text-xl font-bold">
                {summary.user.firstName?.[0]}{summary.user.lastName?.[0]}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                {summary.user.firstName} {summary.user.lastName}
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                {summary.user.email}
                {summary.user.payrollNumber && (
                  <span className="ml-3 font-mono text-xs bg-slate-100 text-text-secondary px-2 py-0.5 rounded">
                    {summary.user.payrollNumber}
                  </span>
                )}
              </p>
            </div>
          </div>
          <StatusBadge status={summary.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t border-border">
          {metricCards.map(m => (
            <div key={m.label}>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{m.label}</p>
              <p className={`text-base font-semibold text-text-primary mt-1 ${m.mono ? 'font-mono' : ''}`}>
                {m.type === 'time-in' || m.type === 'time-out' ? fmtTimeLong(m.value as string | null) : m.value}
              </p>
            </div>
          ))}
        </div>

        {summary.scheduledStart && summary.scheduledEnd && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
              Shift Window — {summary.shiftName}
            </p>
            <div className="relative h-8 bg-slate-100 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-[8%] right-[8%] bg-info-bg rounded-full" />
              {summary.firstIn && (
                <div className="absolute inset-y-0 w-1 bg-success rounded-full" style={{ left: '20%' }}
                  title={`Clock in: ${fmtTimeShort(summary.firstIn)}`} />
              )}
              {summary.lastOut && (
                <div className="absolute inset-y-0 w-1 bg-info rounded-full" style={{ left: '75%' }}
                  title={`Clock out: ${fmtTimeShort(summary.lastOut)}`} />
              )}
              <div className="absolute inset-0 flex items-center justify-between px-4 text-xs text-text-secondary">
                <span className="font-mono">{fmtTimeShort(summary.scheduledStart)}</span>
                <span className="font-mono">{fmtTimeShort(summary.scheduledEnd)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-bg-surface rounded-card border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-heading font-semibold text-text-primary">Raw Clock Logs</h3>
            <p className="text-xs text-text-secondary mt-0.5">Direct from biometric terminal</p>
          </div>

          {logs.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-text-secondary">No raw logs found for this day.</p>
            </div>
          ) : (
            <div className="px-6 py-4">
              <ol className="relative border-l border-border space-y-6 ml-3">
                {logs
                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .map((log, i) => (
                    <li key={log.id} className="ml-6">
                      <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white text-xs font-bold
                        ${log.direction === 'IN' ? 'bg-success-bg text-success' : 'bg-info-bg text-info'}`}>
                        {log.direction === 'IN' ? '↓' : '↑'}
                      </span>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${log.direction === 'IN' ? 'text-success' : 'text-info'}`}>
                            {log.direction === 'IN' ? 'Clock In' : 'Clock Out'}
                          </p>
                          <p className="font-mono text-xs text-text-secondary mt-0.5">
                            {fmtTimeLong(log.timestamp)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-text-secondary">
                            {log.device?.name ?? `Device ${log.deviceId.slice(0, 8)}`}
                          </p>
                          <p className="text-xs text-text-tertiary font-mono">#{i + 1}</p>
                        </div>
                      </div>
                    </li>
                  ))}
              </ol>
            </div>
          )}
        </div>

        <div className="bg-bg-surface rounded-card border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-heading font-semibold text-text-primary">Manual Override History</h3>
            <p className="text-xs text-text-secondary mt-0.5">Changes made by HR or Admin</p>
          </div>

          {audit.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-text-secondary">No manual overrides on this record.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {audit.map((entry: any) => (
                <div key={entry.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Status changed: <StatusBadge status={entry.previousStatus} />
                        {' → '}
                        <StatusBadge status={entry.newStatus} />
                      </p>
                      {entry.reason && (
                        <p className="text-xs text-text-secondary mt-1">"{entry.reason}"</p>
                      )}
                      <p className="text-xs text-text-secondary mt-1">
                        By {entry.changedBy?.firstName} {entry.changedBy?.lastName}
                      </p>
                    </div>
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString('en-KE')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={flagModal} onClose={() => setFlagModal(false)} title="Flag Attendance Discrepancy" size="md">
        <div className="space-y-4">
          {flagError && <Alert type="error" message={flagError} />}
          <p className="text-sm text-text-secondary font-medium">
            This will notify HR to review {summary.user.firstName} {summary.user.lastName}&apos;s
            attendance record for {fmtDateLong(summary.date)}.
          </p>

          <Select label="What's wrong with this record?" value={flagReason}
            onChange={e => setFlagReason(e.target.value)}>
            {DISCREPANCY_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">Additional note (optional)</label>
            <textarea
              value={flagNote}
              onChange={e => setFlagNote(e.target.value)}
              placeholder="Any extra context HR should know…"
              rows={3}
              className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-info focus:border-info" />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setFlagModal(false)}>Cancel</Button>
            <Button onClick={handleFlag} loading={flagging}>Submit Flag to HR</Button>
          </div>
        </div>
      </Modal>
    </HODLayout>
  );
}
