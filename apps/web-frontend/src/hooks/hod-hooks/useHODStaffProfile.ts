'use client';

import { useEffect, useMemo, useState } from 'react';
import { attendanceApi, employeeApi } from '@/lib/api';
import type { AttendanceSummary, Employee } from '@/types/hod';
import { monthStartStr, todayStr } from './utils';

export function useHODStaffProfile(id: string | null) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [history, setHistory] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    employeeApi.getById(id)
      .then(async (employee: Employee) => {
        setEmployee(employee);
        try {
          const attendance = await attendanceApi.getSummaries({
            userId: id,
            startDate: monthStartStr(),
            endDate: todayStr(),
            limit: 30,
          });
          setHistory(attendance.data || []);
        } catch {
          setHistory([]);
        }
      })
      .catch((e: any) => setError(e.message || 'Employee not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const stats = useMemo(() => {
    const presentDays = history.filter((entry) => entry.status === 'PRESENT').length;
    const lateDays = history.filter((entry) => entry.status === 'LATE').length;
    const absentDays = history.filter((entry) => entry.status === 'ABSENT').length;
    const totalHours = history.reduce((sum, entry) => sum + (entry.totalHours ?? 0), 0);
    return { presentDays, lateDays, absentDays, totalHours };
  }, [history]);

  return {
    employee,
    history,
    loading,
    error,
    stats,
  };
}
