'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { attendanceApi } from '@/lib/api';
import type { AttendanceSummary } from '@/types/hod';

const todayStr = () => new Date().toISOString().split('T')[0];
const monthStartStr = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
};

export function useHODAttendance(departmentId: string | null) {
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: monthStartStr(),
    endDate: todayStr(),
    status: '',
    search: '',
  });

  const loadAttendance = useCallback(async (depId: string) => {
    setLoading(true);
    setError('');

    try {
      const params: any = {
        departmentId: depId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page,
        limit: 50,
      };

      if (filters.status) params.status = filters.status;

      const data = await attendanceApi.getSummaries(params);
      setSummaries(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (e: any) {
      setError(e.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    if (departmentId) loadAttendance(departmentId);
  }, [departmentId, loadAttendance]);

  const displayed = useMemo(() => {
    if (!filters.search) return summaries;

    return summaries.filter(s =>
      `${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(filters.search.toLowerCase()),
    );
  }, [summaries, filters.search]);

  const resetFilters = useCallback(() => {
    setFilters({
      startDate: monthStartStr(),
      endDate: todayStr(),
      status: '',
      search: '',
    });
    setPage(1);
  }, []);

  return {
    summaries,
    displayed,
    loading,
    error,
    total,
    page,
    setPage,
    filters,
    setFilters,
    loadAttendance,
    resetFilters,
  };
}
