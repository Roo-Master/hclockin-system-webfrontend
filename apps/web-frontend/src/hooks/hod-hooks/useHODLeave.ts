'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { auditLogApi, employeeApi, leaveApi } from '@/lib/api';
import type { Employee, LeaveRequest, LeaveStatus } from '@/types/hod';

export function useHODLeave(departmentId: string | null) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [staffMap, setStaffMap] = useState<Record<string, Employee>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | ''>('');

  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState('');

  const loadLeaves = useCallback(async (depId: string) => {
    setLoading(true);
    setError('');
    try {
      const staffData = await employeeApi.list({ departmentId: depId });
      const staffList: Employee[] = staffData.data || staffData.items || [];
      const map: Record<string, Employee> = {};
      staffList.forEach((employee) => { map[employee.id] = employee; });
      setStaffMap(map);

      const leaveData = await leaveApi.getByDepartmentStaff(
        staffList.map((employee) => employee.id),
        statusFilter || undefined,
      );
      setLeaves(leaveData.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (departmentId) loadLeaves(departmentId);
  }, [departmentId, loadLeaves]);

  const handleReject = useCallback(async () => {
    if (!selected || !departmentId) return;
    setRejecting(true);
    setRejectError('');
    try {
      await leaveApi.updateStatus(selected.id, 'REJECTED', rejectReason || undefined);
      const employee = staffMap[selected.employeeId];
      auditLogApi.log(
        'LEAVE_REJECTED',
        `Rejected ${employee ? `${employee.firstName} ${employee.lastName}'s` : 'a'} ${selected.leaveType?.replace('_', ' ').toLowerCase()} request`,
      );
      setSelected(null);
      setShowRejectForm(false);
      setRejectReason('');
      await loadLeaves(departmentId);
    } catch (e: any) {
      setRejectError(e.message || 'Failed to reject leave request.');
    } finally {
      setRejecting(false);
    }
  }, [selected, departmentId, rejectReason, staffMap, loadLeaves]);

  const closeModal = useCallback(() => {
    setSelected(null);
    setShowRejectForm(false);
    setRejectReason('');
    setRejectError('');
  }, []);

  const requestCountLabel = useMemo(
    () => `${leaves.length} request${leaves.length !== 1 ? 's' : ''}`,
    [leaves.length],
  );

  return {
    leaves,
    staffMap,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    loadLeaves,
    selected,
    setSelected,
    showRejectForm,
    setShowRejectForm,
    rejectReason,
    setRejectReason,
    rejecting,
    rejectError,
    handleReject,
    closeModal,
    requestCountLabel,
  };
}
