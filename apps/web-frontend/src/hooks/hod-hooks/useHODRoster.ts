'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch, auditLogApi, employeeApi, rosterApi } from '@/lib/api';
import type { Employee, ShiftTemplate } from '@/types/hod';
import { dayLabel, fmtRosterDate, weekDates } from './utils';

export const SHIFT_COLORS: Record<string, string> = {
  MORNING: 'bg-warning-bg text-warning border-warning/20',
  AFTERNOON: 'bg-info-bg text-info border-info/20',
  NIGHT: 'bg-danger-bg text-danger border-danger/20',
  FLEXIBLE: 'bg-success-bg text-success border-success/20',
  CUSTOM: 'bg-slate-100 text-text-secondary border-slate-200',
};

export function useHODRoster(departmentId: string | null) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [shifts, setShifts] = useState<ShiftTemplate[]>([]);
  const [staff, setStaff] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [previousWeekAssignments, setPreviousWeekAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [assignModal, setAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ employeeIds: [] as string[], shiftId: '', effectiveFrom: '', effectiveTo: '', reason: '' });
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  const [unassignModal, setUnassignModal] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState<{ shiftId: string; employeeId: string; date: string } | null>(null);
  const [unassigning, setUnassigning] = useState(false);

  const [copyModal, setCopyModal] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyError, setCopyError] = useState('');

  const dates = useMemo(() => weekDates(weekOffset), [weekOffset]);

  const loadRoster = useCallback(async (depId: string) => {
    setLoading(true);
    setError('');
    try {
      const start = fmtRosterDate(dates[0]);
      const end = fmtRosterDate(dates[6]);
      const prevStart = new Date(dates[0]); prevStart.setDate(prevStart.getDate() - 7);
      const prevEnd = new Date(dates[6]); prevEnd.setDate(prevEnd.getDate() - 7);

      const [shiftsData, staffData, summaryData, prevSummaryData] = await Promise.all([
        rosterApi.listShifts({ isActive: true }),
        employeeApi.list({ departmentId: depId, employmentStatus: 'ACTIVE' }),
        apiFetch(`/attendance/summaries?departmentId=${depId}&startDate=${start}&endDate=${end}&limit=500`),
        apiFetch(`/attendance/summaries?departmentId=${depId}&startDate=${fmtRosterDate(prevStart)}&endDate=${fmtRosterDate(prevEnd)}&limit=500`).catch(() => ({ data: [] })),
      ]);

      setShifts(shiftsData.data || shiftsData.items || []);
      setStaff(staffData.data || staffData.items || []);
      setAssignments(summaryData.data || []);
      setPreviousWeekAssignments(prevSummaryData.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load roster.');
    } finally {
      setLoading(false);
    }
  }, [dates]);

  useEffect(() => {
    if (departmentId) loadRoster(departmentId);
  }, [departmentId, loadRoster]);

  const getAssignment = useCallback((userId: string, date: Date) => {
    const day = fmtRosterDate(date);
    return assignments.find((assignment) => assignment.userId === userId && assignment.date?.startsWith(day));
  }, [assignments]);

  const getLastWeekHint = useCallback((userId: string, date: Date) => {
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 7);
    const day = fmtRosterDate(prevDate);
    return previousWeekAssignments.find((assignment) => assignment.userId === userId && assignment.date?.startsWith(day));
  }, [previousWeekAssignments]);

  const handleAssign = useCallback(async () => {
    if (!departmentId) return;
    if (!assignForm.shiftId || assignForm.employeeIds.length === 0 || !assignForm.effectiveFrom) {
      setAssignError('Shift, at least one employee, and start date are required.');
      return;
    }

    setAssigning(true);
    setAssignError('');
    try {
      const shiftName = shifts.find((shift) => shift.id === assignForm.shiftId)?.name ?? 'shift';
      await rosterApi.assignEmployees(assignForm.shiftId, {
        employeeIds: assignForm.employeeIds,
        departmentId,
        effectiveFrom: assignForm.effectiveFrom,
        effectiveTo: assignForm.effectiveTo || assignForm.effectiveFrom,
        reason: assignForm.reason || undefined,
      });
      auditLogApi.log(
        'ROSTER_ASSIGNED',
        `Assigned ${assignForm.employeeIds.length} employee${assignForm.employeeIds.length > 1 ? 's' : ''} to ${shiftName} (${assignForm.effectiveFrom} → ${assignForm.effectiveTo || assignForm.effectiveFrom})`,
      );
      setAssignModal(false);
      setAssignForm({ employeeIds: [], shiftId: '', effectiveFrom: '', effectiveTo: '', reason: '' });
      await loadRoster(departmentId);
    } catch (e: any) {
      setAssignError(e.message || 'Failed to assign staff to shift.');
    } finally {
      setAssigning(false);
    }
  }, [departmentId, assignForm, shifts, loadRoster]);

  const handleUnassign = useCallback(async () => {
    if (!departmentId || !unassignTarget) return;
    setUnassigning(true);
    try {
      const employee = staff.find((entry) => entry.id === unassignTarget.employeeId);
      await rosterApi.unassignEmployees(unassignTarget.shiftId, {
        employeeIds: [unassignTarget.employeeId],
        effectiveFrom: unassignTarget.date,
        effectiveTo: unassignTarget.date,
        reason: 'Unassigned by HOD',
      });
      auditLogApi.log(
        'ROSTER_UNASSIGNED',
        `Removed ${employee ? `${employee.firstName} ${employee.lastName}` : 'an employee'} from their shift on ${unassignTarget.date}`,
      );
      setUnassignModal(false);
      await loadRoster(departmentId);
    } catch (e: any) {
      setError(e.message || 'Failed to remove employee from shift.');
    } finally {
      setUnassigning(false);
    }
  }, [departmentId, unassignTarget, staff, loadRoster]);

  const handleCopyLastWeek = useCallback(async () => {
    if (!departmentId) return;
    setCopying(true);
    setCopyError('');
    try {
      const prevStart = new Date(dates[0]); prevStart.setDate(prevStart.getDate() - 7);
      const prevEnd = new Date(dates[6]); prevEnd.setDate(prevEnd.getDate() - 7);
      const prevData = await apiFetch(`/attendance/summaries?departmentId=${departmentId}&startDate=${fmtRosterDate(prevStart)}&endDate=${fmtRosterDate(prevEnd)}&limit=500`);
      const prevAssignments = prevData.data || [];
      setPreviousWeekAssignments(prevAssignments);

      if (prevAssignments.length === 0) {
        setCopyError('No assignments found in the previous week to copy.');
        return;
      }

      const byShift: Record<string, { employeeIds: string[]; dates: string[] }> = {};
      prevAssignments.forEach((assignment: any) => {
        const shiftId = assignment.shift?.id || assignment.shiftId;
        if (!shiftId) return;
        const prevDate = new Date(assignment.date);
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() + 7);
        const newDateStr = fmtRosterDate(newDate);
        if (!byShift[shiftId]) byShift[shiftId] = { employeeIds: [], dates: [] };
        if (!byShift[shiftId].employeeIds.includes(assignment.userId)) byShift[shiftId].employeeIds.push(assignment.userId);
        if (!byShift[shiftId].dates.includes(newDateStr)) byShift[shiftId].dates.push(newDateStr);
      });

      let totalAssigned = 0;
      for (const [shiftId, group] of Object.entries(byShift)) {
        const sortedDates = group.dates.sort();
        await rosterApi.assignEmployees(shiftId, {
          employeeIds: group.employeeIds,
          departmentId,
          effectiveFrom: sortedDates[0],
          effectiveTo: sortedDates[sortedDates.length - 1],
          reason: 'Copied forward from previous week by HOD',
        });
        totalAssigned += group.employeeIds.length;
      }

      auditLogApi.log(
        'ROSTER_BULK_COPY',
        `Copied last week's roster pattern forward to ${dayLabel(dates[0])}–${dayLabel(dates[6])} (${totalAssigned} assignment${totalAssigned !== 1 ? 's' : ''})`,
      );
      setCopyModal(false);
      await loadRoster(departmentId);
    } catch (e: any) {
      setCopyError(e.message || 'Failed to copy last week roster.');
    } finally {
      setCopying(false);
    }
  }, [departmentId, dates, loadRoster]);

  const toggleEmployee = useCallback((id: string) => {
    setAssignForm((form) => ({
      ...form,
      employeeIds: form.employeeIds.includes(id)
        ? form.employeeIds.filter((employeeId) => employeeId !== id)
        : [...form.employeeIds, id],
    }));
  }, []);

  const openAssignModal = useCallback(() => {
    setAssignForm({
      employeeIds: [],
      shiftId: '',
      effectiveFrom: fmtRosterDate(dates[0]),
      effectiveTo: fmtRosterDate(dates[6]),
      reason: '',
    });
    setAssignModal(true);
  }, [dates]);

  return {
    weekOffset,
    setWeekOffset,
    dates,
    shifts,
    staff,
    assignments,
    loading,
    error,
    loadRoster,
    getAssignment,
    getLastWeekHint,
    assignModal,
    setAssignModal,
    assignForm,
    setAssignForm,
    assigning,
    assignError,
    handleAssign,
    unassignModal,
    setUnassignModal,
    unassignTarget,
    setUnassignTarget,
    unassigning,
    handleUnassign,
    copyModal,
    setCopyModal,
    copying,
    copyError,
    setCopyError,
    handleCopyLastWeek,
    toggleEmployee,
    openAssignModal,
  };
}
