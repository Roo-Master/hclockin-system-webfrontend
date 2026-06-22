'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { attendanceApi, auditLogApi } from '@/lib/api';
import type { AttendanceLog, AttendanceSummary } from '@/types/hod';

export const DISCREPANCY_REASONS = [
  { value: 'DUPLICATE_CLOCK_IN', label: 'Duplicate clock-in detected' },
  { value: 'MISSING_CLOCK_OUT', label: 'Missing clock-out' },
  { value: 'SUSPICIOUS_GAP', label: 'Unusual gap between logs' },
  { value: 'WRONG_DEVICE', label: 'Clocked in from wrong device/location' },
  { value: 'OTHER', label: 'Other (explain in note)' },
] as const;

export function useHODAttendanceDetail(id: string | null) {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [flagModal, setFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('DUPLICATE_CLOCK_IN');
  const [flagNote, setFlagNote] = useState('');
  const [flagging, setFlagging] = useState(false);
  const [flagError, setFlagError] = useState('');
  const [flagSuccess, setFlagSuccess] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const summaryData: AttendanceSummary = await attendanceApi.getSummaryById(id);
      setSummary(summaryData);
      const [logsData, auditData] = await Promise.allSettled([
        attendanceApi.getRawLogs({ userId: summaryData.userId, startDate: summaryData.date, endDate: summaryData.date }),
        attendanceApi.getAuditTrail(id),
      ]);
      if (logsData.status === 'fulfilled') setLogs(logsData.value.data || logsData.value || []);
      if (auditData.status === 'fulfilled') setAudit(auditData.value.data || auditData.value || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load attendance detail.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleFlag = useCallback(async () => {
    if (!id || !summary) return;
    setFlagging(true);
    setFlagError('');
    try {
      await attendanceApi.flagDiscrepancy(id, { reason: flagReason, note: flagNote || undefined });
      const reasonLabel = DISCREPANCY_REASONS.find((reason) => reason.value === flagReason)?.label ?? flagReason;
      auditLogApi.log(
        'ATTENDANCE_FLAGGED',
        `Flagged ${summary.user.firstName} ${summary.user.lastName}'s attendance for ${summary.date}: ${reasonLabel}`,
      );
      setFlagSuccess(true);
      setFlagModal(false);
      setFlagNote('');
    } catch (e: any) {
      setFlagError(e.message || 'Failed to flag discrepancy.');
    } finally {
      setFlagging(false);
    }
  }, [id, summary, flagReason, flagNote]);

  const metricCards = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Clock In', value: summary.firstIn, mono: true, type: 'time-in' },
      { label: 'Clock Out', value: summary.lastOut, mono: true, type: 'time-out' },
      { label: 'Total Hours', value: summary.totalHours != null ? `${summary.totalHours.toFixed(2)}h` : '—', mono: true, type: 'hours' },
      { label: 'Late', value: summary.lateMinutes > 0 ? `${summary.lateMinutes} min` : 'On time', mono: false, type: 'late' },
      { label: 'Overtime', value: summary.overtimeHours > 0 ? `${summary.overtimeHours.toFixed(2)}h` : '—', mono: true, type: 'overtime' },
      { label: 'Scheduled', value: summary.shiftName ?? 'No shift', mono: false, type: 'scheduled' },
    ];
  }, [summary]);

  return {
    summary,
    logs,
    audit,
    loading,
    error,
    loadDetail,
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
  };
}
