'use client';

import { useEffect, useState, useCallback } from 'react';
import { HODLayout } from '@/components/hod-components/layout/HODLayout';
import { StatusBadge, Spinner, Alert, Button, Input, Select, Modal, EmptyState } from '@/components/ui';
import { employeeApi, getCurrentUser, auditLogApi } from '@/lib/api';
import type { Employee, EmploymentStatus } from '@/types';

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'LOCUM', 'INTERN'];
const EMPLOYMENT_STATUSES: EmploymentStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'];

export default function StaffPage() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [deptId, setDeptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatus] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  // Edit modal
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState({ 
    firstName: '', 
    lastName: '', 
    phoneNumber: '', 
    employmentType: '', 
    hourlyRate: '' 
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Status update modal
  const [statusTarget, setStatusTarget] = useState<Employee | null>(null);
  const [newStatus, setNewStatus] = useState<EmploymentStatus>('ACTIVE');
  const [statusLoading, setStatusLoading] = useState(false);

  // New employee modal
  const [newModal, setNewModal] = useState(false);
  const [newForm, setNewForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    employeeCode: '',
    deviceUserId: '',
    employmentType: 'FULL_TIME',
    phoneNumber: '',
  });
  const [newLoading, setNewLoading] = useState(false);
  const [newError, setNewError] = useState('');

  const load = useCallback(async (depId: string) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { departmentId: depId };
      if (statusFilter) params.employmentStatus = statusFilter;
      const data = await employeeApi.list(params);
      setStaff(data.data || data.items || []);
      setInitialLoad(false);
    } catch (e: any) {
      // Clean the error message - remove any Markdown or special characters
      const errorMsg = e.message || 'Failed to load staff. Please try again.';
      const cleanError = errorMsg.replace(/\*\*/g, '').replace(/#/g, '').trim();
      setError(cleanError);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const raw = getCurrentUser();
    if (!raw) {
      setLoading(false);
      setError('Unable to authenticate. Please log in again.');
      return;
    }
    
    employeeApi.getById(raw.id || raw.sub)
      .then((emp: any) => {
        setDeptId(emp.departmentId);
        if (emp.departmentId) {
          load(emp.departmentId);
        } else {
          setError('No department found for this user.');
          setLoading(false);
        }
      })
      .catch((err: any) => {
        const errorMsg = err.message || 'Failed to load user profile.';
        setError(errorMsg.replace(/\*\*/g, '').replace(/#/g, '').trim());
        setLoading(false);
      });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (deptId) load(deptId);
  }, [deptId, statusFilter, load]);

  const openEdit = (emp: Employee) => {
    setEditTarget(emp);
    setEditForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      phoneNumber: emp.phoneNumber ?? '',
      employmentType: emp.employmentType,
      hourlyRate: String(emp.hourlyRate ?? ''),
    });
    setEditError('');
  };

  const handleEdit = async () => {
    if (!editTarget) return;
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
      if (deptId) load(deptId);
    } catch (e: any) {
      const errorMsg = e.message || 'Failed to update employee.';
      setEditError(errorMsg.replace(/\*\*/g, '').replace(/#/g, '').trim());
    } finally {
      setEditLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusTarget) return;
    setStatusLoading(true);
    try {
      await employeeApi.updateStatus(statusTarget.id, newStatus);
      auditLogApi.log(
        'EMPLOYEE_STATUS_CHANGED',
        `Changed ${statusTarget.firstName} ${statusTarget.lastName}'s status from ${statusTarget.employmentStatus} to ${newStatus}`,
      );
      setStatusTarget(null);
      if (deptId) load(deptId);
    } catch (e: any) {
      const errorMsg = e.message || 'Failed to update status.';
      setError(errorMsg.replace(/\*\*/g, '').replace(/#/g, '').trim());
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newForm.firstName || !newForm.lastName || !newForm.email || !newForm.password || !newForm.employeeCode) {
      setNewError('First name, last name, email, password, and employee code are required.');
      return;
    }
    setNewLoading(true);
    setNewError('');
    try {
      await employeeApi.create({
        ...newForm,
        departmentId: deptId,
        deviceUserId: newForm.deviceUserId || undefined,
        role: 'GENERAL_STAFF',
      });
      auditLogApi.log('EMPLOYEE_REGISTERED', `Registered new employee ${newForm.firstName} ${newForm.lastName} (${newForm.employeeCode})`);
      setNewModal(false);
      setNewForm({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        password: '', 
        employeeCode: '', 
        deviceUserId: '', 
        employmentType: 'FULL_TIME', 
        phoneNumber: '' 
      });
      if (deptId) load(deptId);
    } catch (e: any) {
      const errorMsg = e.message || 'Failed to create employee.';
      setNewError(errorMsg.replace(/\*\*/g, '').replace(/#/g, '').trim());
    } finally {
      setNewLoading(false);
    }
  };

  const displayed = search
    ? staff.filter(e => 
        `${e.firstName} ${e.lastName} ${e.employeeCode} ${e.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : staff;

  // Show a friendly error state if there's an error and no staff
  if (error && staff.length === 0 && !loading) {
    return (
      <HODLayout title="Staff" subtitle="Department staff directory">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Unable to Load Staff</h3>
            <p className="text-gray-600 max-w-md">{error}</p>
            <Button onClick={() => deptId && load(deptId)}>Try Again</Button>
          </div>
        </div>
      </HODLayout>
    );
  }

  return (
    <HODLayout title="Staff" subtitle="Department staff directory">
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onRetry={() => deptId && load(deptId)} 
        />
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="flex-1 min-w-48">
          <Input 
            label="Search" 
            placeholder="Name, code, or email…" 
            value={search}
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="w-44">
          <Select 
            label="Status" 
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {EMPLOYMENT_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
        <Button onClick={() => setNewModal(true)}>+ New Employee</Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 font-medium">Loading staff directory...</p>
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          title={search ? "No matching staff found" : "No staff in your department"}
          message={search 
            ? "No employees match your search criteria. Try adjusting your filters." 
            : "Your department doesn't have any employees yet. Get started by adding your first team member."
          }
          action={<Button onClick={() => setNewModal(true)}>Add First Employee</Button>}
          icon={
            <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-600">
              {displayed.length} employee{displayed.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {['Employee', 'Code', 'Email', 'Type', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map(emp => (
                  <tr key={emp.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-xs font-bold">
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-gray-500">{emp.payrollNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{emp.employeeCode}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{emp.email}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{emp.employmentType?.replace('_', ' ')}</td>
                    <td className="px-4 py-3"><StatusBadge status={emp.employmentStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm"
                          onClick={() => window.location.href = `/hod/staff/${emp.id}`}>
                          View
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => openEdit(emp)}>Edit</Button>
                        <Button variant="secondary" size="sm"
                          onClick={() => { 
                            setStatusTarget(emp); 
                            setNewStatus(emp.employmentStatus); 
                          }}>
                          Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Employee" size="md">
        {editError && <Alert type="error" message={editError} />}
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="First Name" 
              value={editForm.firstName}
              onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} 
            />
            <Input 
              label="Last Name" 
              value={editForm.lastName}
              onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} 
            />
          </div>
          <Input 
            label="Phone Number" 
            value={editForm.phoneNumber}
            onChange={e => setEditForm(f => ({ ...f, phoneNumber: e.target.value }))} 
          />
          <div className="grid grid-cols-2 gap-3">
            <Select 
              label="Employment Type" 
              value={editForm.employmentType}
              onChange={e => setEditForm(f => ({ ...f, employmentType: e.target.value }))}
            >
              {EMPLOYMENT_TYPES.map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </Select>
            <Input 
              label="Hourly Rate (KES)" 
              type="number" 
              value={editForm.hourlyRate}
              onChange={e => setEditForm(f => ({ ...f, hourlyRate: e.target.value }))} 
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleEdit} loading={editLoading}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Status Modal */}
      <Modal open={!!statusTarget} onClose={() => setStatusTarget(null)} title="Update Employment Status" size="sm">
        <div className="space-y-4 mt-2">
          <p className="text-sm text-gray-600 font-medium">
            Change status for <span className="font-semibold text-gray-900">
              {statusTarget?.firstName} {statusTarget?.lastName}
            </span>
          </p>
          <Select 
            label="New Status" 
            value={newStatus}
            onChange={e => setNewStatus(e.target.value as EmploymentStatus)}
          >
            {EMPLOYMENT_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setStatusTarget(null)}>Cancel</Button>
            <Button
              variant={newStatus === 'TERMINATED' || newStatus === 'SUSPENDED' ? 'danger' : 'primary'}
              onClick={handleStatusUpdate} 
              loading={statusLoading}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Employee Modal */}
      <Modal open={newModal} onClose={() => setNewModal(false)} title="Register New Employee" size="lg">
        {newError && <Alert type="error" message={newError} />}
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="First Name *" 
              value={newForm.firstName}
              onChange={e => setNewForm(f => ({ ...f, firstName: e.target.value }))} 
            />
            <Input 
              label="Last Name *" 
              value={newForm.lastName}
              onChange={e => setNewForm(f => ({ ...f, lastName: e.target.value }))} 
            />
          </div>
          <Input 
            label="Email *" 
            type="email" 
            value={newForm.email}
            onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))} 
          />
          <Input 
            label="Initial Password *" 
            type="password" 
            value={newForm.password}
            onChange={e => setNewForm(f => ({ ...f, password: e.target.value }))}
            hint="Employee should change this on first login" 
          />
          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="Employee Code *" 
              placeholder="e.g. EMP-0099" 
              value={newForm.employeeCode}
              onChange={e => setNewForm(f => ({ ...f, employeeCode: e.target.value }))} 
            />
            <Input 
              label="Device PIN (biometric)" 
              placeholder="e.g. 4012" 
              value={newForm.deviceUserId}
              onChange={e => setNewForm(f => ({ ...f, deviceUserId: e.target.value }))}
              hint="The PIN enrolled on the ZKTeco terminal" 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="Phone Number" 
              value={newForm.phoneNumber}
              onChange={e => setNewForm(f => ({ ...f, phoneNumber: e.target.value }))} 
            />
            <Select 
              label="Employment Type" 
              value={newForm.employmentType}
              onChange={e => setNewForm(f => ({ ...f, employmentType: e.target.value }))}
            >
              {EMPLOYMENT_TYPES.map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </Select>
          </div>
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 font-medium">
            This employee will be automatically assigned to your department.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setNewModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={newLoading}>Register Employee</Button>
          </div>
        </div>
      </Modal>
    </HODLayout>
  );
}