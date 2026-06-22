'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { auditLogApi, employeeApi } from '@/lib/api';
import type { Employee, EmploymentStatus } from '@/types';

export const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'LOCUM', 'INTERN'] as const;
export const EMPLOYMENT_STATUSES: EmploymentStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'];

export function useHODStaff(departmentId: string | null) {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phoneNumber: '', employmentType: '', hourlyRate: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const [statusTarget, setStatusTarget] = useState<Employee | null>(null);
  const [newStatus, setNewStatus] = useState<EmploymentStatus>('ACTIVE');
  const [statusLoading, setStatusLoading] = useState(false);

  const [newModal, setNewModal] = useState(false);
  const [newForm, setNewForm] = useState({
    firstName: '', lastName: '', email: '', password: '', employeeCode: '',
    deviceUserId: '', employmentType: 'FULL_TIME', phoneNumber: '',
  });
  const [newLoading, setNewLoading] = useState(false);
  const [newError, setNewError] = useState('');

  const loadStaff = useCallback(async (depId: string) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { departmentId: depId };
      if (statusFilter) params.employmentStatus = statusFilter;
      const data = await employeeApi.list(params);
      setStaff(data.data || data.items || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load staff.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (departmentId) loadStaff(departmentId);
  }, [departmentId, loadStaff]);

  const openEdit = useCallback((employee: Employee) => {
    setEditTarget(employee);
    setEditForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      phoneNumber: employee.phoneNumber ?? '',
      employmentType: employee.employmentType,
      hourlyRate: String(employee.hourlyRate ?? ''),
    });
    setEditError('');
  }, []);

  const handleEdit = useCallback(async () => {
    if (!editTarget || !departmentId) return;
    setEditLoading(true);
    setEditError('');
    try {
      await employeeApi.update(editTarget.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phoneNumber: editForm.phoneNumber || undefined,
        employmentType: editForm.employmentType,
        hourlyRate: editForm.hourlyRate ? Number(editForm.hourlyRate) : undefined,
      });
      auditLogApi.log('EMPLOYEE_UPDATED', `Updated profile for ${editForm.firstName} ${editForm.lastName}`);
      setEditTarget(null);
      await loadStaff(departmentId);
    } catch (e: any) {
      setEditError(e.message || 'Failed to update employee.');
    } finally {
      setEditLoading(false);
    }
  }, [editTarget, departmentId, editForm, loadStaff]);

  const handleStatusUpdate = useCallback(async () => {
    if (!statusTarget || !departmentId) return;
    setStatusLoading(true);
    try {
      await employeeApi.updateStatus(statusTarget.id, newStatus);
      auditLogApi.log(
        'EMPLOYEE_STATUS_CHANGED',
        `Changed ${statusTarget.firstName} ${statusTarget.lastName}'s status from ${statusTarget.employmentStatus} to ${newStatus}`,
      );
      setStatusTarget(null);
      await loadStaff(departmentId);
    } catch (e: any) {
      setError(e.message || 'Failed to update employment status.');
    } finally {
      setStatusLoading(false);
    }
  }, [statusTarget, departmentId, newStatus, loadStaff]);

  const handleCreate = useCallback(async () => {
    if (!departmentId) return;
    if (!newForm.firstName || !newForm.lastName || !newForm.email || !newForm.password || !newForm.employeeCode) {
      setNewError('First name, last name, email, password, and employee code are required.');
      return;
    }

    setNewLoading(true);
    setNewError('');
    try {
      await employeeApi.create({
        ...newForm,
        departmentId,
        deviceUserId: newForm.deviceUserId || undefined,
        role: 'GENERAL_STAFF',
      });
      auditLogApi.log('EMPLOYEE_REGISTERED', `Registered new employee ${newForm.firstName} ${newForm.lastName} (${newForm.employeeCode})`);
      setNewModal(false);
      setNewForm({ firstName: '', lastName: '', email: '', password: '', employeeCode: '', deviceUserId: '', employmentType: 'FULL_TIME', phoneNumber: '' });
      await loadStaff(departmentId);
    } catch (e: any) {
      setNewError(e.message || 'Failed to create employee.');
    } finally {
      setNewLoading(false);
    }
  }, [departmentId, newForm, loadStaff]);

  const displayed = useMemo(() => {
    if (!search) return staff;
    return staff.filter((employee) =>
      `${employee.firstName} ${employee.lastName} ${employee.employeeCode} ${employee.email}`.toLowerCase().includes(search.toLowerCase()),
    );
  }, [staff, search]);

  return {
    staff,
    displayed,
    loading,
    error,
    loadStaff,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    editTarget,
    setEditTarget,
    editForm,
    setEditForm,
    editLoading,
    editError,
    openEdit,
    handleEdit,
    statusTarget,
    setStatusTarget,
    newStatus,
    setNewStatus,
    statusLoading,
    handleStatusUpdate,
    newModal,
    setNewModal,
    newForm,
    setNewForm,
    newLoading,
    newError,
    handleCreate,
  };
}
