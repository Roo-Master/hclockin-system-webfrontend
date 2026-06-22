'use client';

import { useCallback, useMemo, useState } from 'react';
import { attendanceApi } from '@/lib/api';
import type { AttendanceSummary, DashboardStats } from '@/types';

const todayStr = () => new Date().toISOString().split('T')[0];

export function getDisplayStatus(summary: AttendanceSummary): { status: string; isPending: boolean } {
  if (summary.status === 'ABSENT' && summary.scheduledStart) {
    const startTime = new Date(summary.scheduledStart);
    if (startTime.getTime() > Date.now()) {
      return { status: 'NOT_STARTED', isPending: true };
    }
  }

  return { status: summary.status, isPending: false };
}

export function useHODDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async (departmentId: string) => {
    setLoading(true);
    setError('');

    try {
      const date = todayStr();
      const [statsData, summaryData] = await Promise.all([
        attendanceApi.getDashboardStats(date),
        attendanceApi.getSummaries({ departmentId, startDate: date, endDate: date, limit: 100 }),
      ]);

      setStats(statsData);
      setSummaries(summaryData.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const metrics = useMemo(() => {
    const presentCount = summaries.filter(s => s.status === 'PRESENT').length;
    const lateCount = summaries.filter(s => s.status === 'LATE').length;
    const absentCount = summaries.filter(s => getDisplayStatus(s).status === 'ABSENT').length;
    const pendingCount = summaries.filter(s => getDisplayStatus(s).isPending).length;
    const leaveCount = summaries.filter(s => s.status === 'ON_LEAVE').length;
    const total = summaries.length;
    const rate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

    return {
      presentCount,
      lateCount,
      absentCount,
      pendingCount,
      leaveCount,
      total,
      rate,
    };
  }, [summaries]);

  return {
    stats,
    summaries,
    loading,
    error,
    setError,
    loadDashboard,
    metrics,
  };
}
