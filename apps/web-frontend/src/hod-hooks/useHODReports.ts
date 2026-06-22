'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { reportsApi } from '@/lib/api';
import type { CompiledReport } from '@/types';
import { monthStartStr, todayStr } from './utils';

export const HOD_REPORT_TYPES = [
  { value: 'MONTHLY_ATTENDANCE', label: 'Monthly Attendance', desc: 'Per-employee daily breakdown with status and hours' },
  { value: 'LATENESS_AUDIT', label: 'Lateness Audit', desc: 'All late arrivals, worst offenders first' },
  { value: 'ABSENCE_AUDIT', label: 'Absence Audit', desc: 'All unexcused absences with top absentees' },
  { value: 'OVERTIME_AUDIT', label: 'Overtime Audit', desc: 'All overtime hours logged, highest first' },
] as const;

const MAX_DAYS = 93;

export function useHODReports(departmentId: string | null) {
  const [reports, setReports] = useState<CompiledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    reportType: 'MONTHLY_ATTENDANCE',
    startDate: monthStartStr(),
    endDate: todayStr(),
  });
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [viewing, setViewing] = useState<CompiledReport | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reportsApi.list({ page: 1, limit: 25 });
      setReports(data.data || data.items || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const rangeError = useMemo(() => {
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (end < start) return 'End date must be on or after start date.';
    if (diffDays > MAX_DAYS) return `Range cannot exceed ${MAX_DAYS} days.`;
    return '';
  }, [form.startDate, form.endDate]);

  const handleGenerate = useCallback(async () => {
    if (rangeError) return;
    if (!departmentId) {
      setGenError('Could not determine your department.');
      return;
    }

    setGenerating(true);
    setGenError('');
    try {
      const result = await reportsApi.generate({
        reportType: form.reportType,
        startDate: form.startDate,
        endDate: form.endDate,
        departmentId,
      });
      setReports((prev) => [result, ...prev]);
      setViewing(result);
    } catch (e: any) {
      setGenError(e.message || 'Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  }, [departmentId, form, rangeError]);

  const handleView = useCallback(async (report: CompiledReport) => {
    if (report.compiledData) {
      setViewing(report);
      return;
    }

    setViewLoading(true);
    try {
      const full = await reportsApi.getById(report.id);
      setViewing(full);
    } catch (e: any) {
      setError(e.message || 'Failed to load report.');
    } finally {
      setViewLoading(false);
    }
  }, []);

  return {
    reports,
    loading,
    error,
    loadReports,
    form,
    setForm,
    generating,
    genError,
    rangeError,
    viewing,
    setViewing,
    viewLoading,
    handleGenerate,
    handleView,
  };
}
