'use client';

import { useEffect, useState } from 'react';
import { employeeApi, getCurrentUser } from '@/lib/api';
import type { AuthUser, Employee } from '@/types/hod';

function mapEmployeeToAuthUser(emp: any): AuthUser {
  return {
    id: emp.id,
    firstName: emp.firstName,
    lastName: emp.lastName,
    email: emp.email,
    role: emp.role,
    tenantId: emp.tenantId,
    departmentId: emp.departmentId,
    department: emp.department,
  };
}

export function useHODProfile() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = getCurrentUser();
    if (!raw) {
      setLoading(false);
      setError('No active session found.');
      return;
    }

    employeeApi.getById(raw.id || raw.sub)
      .then((emp: any) => {
        setEmployee(emp);
        setUser(mapEmployeeToAuthUser(emp));
        setDepartmentId(emp.departmentId ?? null);
      })
      .catch((e: any) => {
        setError(e.message || 'Could not load your profile.');
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    user,
    employee,
    departmentId,
    loading,
    error,
    setError,
  };
}
