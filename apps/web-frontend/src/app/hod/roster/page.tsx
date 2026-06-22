'use client';

import { HODLayout } from '@/components/layout/HODLayout';
import { Button, Modal, Input, Spinner, Alert, EmptyState, Select } from '@/components/ui';
import { dayLabel, fmtRosterDate, SHIFT_COLORS, useHODProfile, useHODRoster } from '../../../hooks/hod-hooks';

export default function RosterPage() {
  const { departmentId } = useHODProfile();
  const {
    weekOffset,
    setWeekOffset,
    dates,
    shifts,
    staff,
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
  } = useHODRoster(departmentId);

  const handlePrintRoster = () => {
    window.print();
  };

  return (
    <HODLayout title="Roster" subtitle="Assign staff to shifts for the week">
      {error && <Alert type="error" message={error} onRetry={() => departmentId && loadRoster(departmentId)} />}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setWeekOffset(w => w - 1)}>← Prev</Button>
          <span className="text-sm font-semibold text-text-primary px-3">
            {dayLabel(dates[0])} — {dayLabel(dates[6])}, {dates[0].getFullYear()}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setWeekOffset(w => w + 1)}>Next →</Button>
          {weekOffset !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>Today</Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handlePrintRoster}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.055 48.055 0 011.913-.247m10.5 0a48.536 48.055 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Print Roster
          </Button>
          <Button variant="secondary" onClick={() => { setCopyError(''); setCopyModal(true); }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25v8.25A2.25 2.25 0 0118 21h-7.5a2.25 2.25 0 01-2.25-2.25v-2.25" />
            </svg>
            Copy Last Week
          </Button>
          <Button onClick={openAssignModal}>
            + Assign to Shift
          </Button>
        </div>
      </div>

      <div className="hidden print:block mb-4">
        <h1 className="text-lg font-bold text-text-primary">Department Roster</h1>
        <p className="text-sm text-text-secondary">{dayLabel(dates[0])} — {dayLabel(dates[6])}, {dates[0].getFullYear()}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : staff.length === 0 ? (
        <EmptyState title="No active staff" message="No active employees found in your department." />
      ) : (
        <div className="bg-bg-surface rounded-card border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary text-xs uppercase tracking-wide w-44">
                    Staff Member
                  </th>
                  {dates.map(d => (
                    <th key={d.toISOString()}
                      className={`px-2 py-3 text-center font-semibold text-xs uppercase tracking-wide
                        ${fmtRosterDate(d) === fmtRosterDate(new Date()) ? 'text-info' : 'text-text-secondary'}`}>
                      {dayLabel(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map(emp => (
                  <tr key={emp.id} className="hover:bg-info-bg/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-info-bg flex items-center justify-center flex-shrink-0">
                          <span className="text-info text-xs font-bold">
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary text-xs truncate">{emp.firstName} {emp.lastName}</p>
                          <p className="text-text-secondary text-xs">{emp.employeeCode}</p>
                        </div>
                      </div>
                    </td>
                    {dates.map(d => {
                      const a = getAssignment(emp.id, d);
                      return (
                        <td key={d.toISOString()} className="px-2 py-3 text-center">
                          {a ? (
                            <button
                              onClick={() => {
                                setUnassignTarget({ shiftId: a.shift?.id || a.shiftId || '', employeeId: emp.id, date: fmtRosterDate(d) });
                                setUnassignModal(true);
                              }}
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium
                                border hover:opacity-80 transition-opacity
                                ${SHIFT_COLORS[a.shift?.type || 'CUSTOM']}`}
                              title={`${a.shiftName || a.shift?.name} — click to unassign`}>
                              {a.shiftName || a.shift?.name || 'Assigned'}
                            </button>
                          ) : (
                            (() => {
                              const hint = getLastWeekHint(emp.id, d);
                              return (
                                <button
                                  onClick={() => {
                                    setAssignForm(f => ({
                                      ...f,
                                      employeeIds: [emp.id],
                                      shiftId: hint?.shift?.id || hint?.shiftId || '',
                                      effectiveFrom: fmtRosterDate(d),
                                      effectiveTo: fmtRosterDate(d),
                                    }));
                                    setAssignModal(true);
                                  }}
                                  title={hint ? `Last week: ${hint.shiftName || hint.shift?.name}` : 'No shift assigned — click to assign'}
                                  className={`rounded-md border border-dashed transition-all flex items-center justify-center mx-auto
                                    ${hint
                                      ? 'w-auto px-2 py-1 gap-1 border-slate-300 text-text-secondary hover:border-info hover:text-info hover:bg-info-bg'
                                      : 'w-7 h-7 border-slate-300 text-text-tertiary hover:border-info hover:text-info hover:bg-info-bg'}`}>
                                  {hint ? (
                                    <span className="text-[10px] leading-none whitespace-nowrap">
                                      + <span className="opacity-70">{hint.shiftName || hint.shift?.name}?</span>
                                    </span>
                                  ) : '+'}
                                </button>
                              );
                            })()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {shifts.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {shifts.slice(0, 6).map(s => (
            <span key={s.id} className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border ${SHIFT_COLORS[s.type] || SHIFT_COLORS.CUSTOM}`}>
              {s.name} · {s.startTime}–{s.endTime}
            </span>
          ))}
        </div>
      )}

      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign to Shift" size="lg">
        <div className="space-y-4">
          {assignError && <Alert type="error" message={assignError} />}

          <Select label="Shift Template" value={assignForm.shiftId}
            onChange={e => setAssignForm(f => ({ ...f, shiftId: e.target.value }))}>
            <option value="">Select a shift…</option>
            {shifts.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.startTime}–{s.endTime}) · {s.gracePeriodMinutes}min grace
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input label="From Date" type="date" value={assignForm.effectiveFrom}
              onChange={e => setAssignForm(f => ({ ...f, effectiveFrom: e.target.value }))} />
            <Input label="To Date (optional)" type="date" value={assignForm.effectiveTo}
              onChange={e => setAssignForm(f => ({ ...f, effectiveTo: e.target.value }))} />
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary mb-2">Select Staff</p>
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border/60">
              {staff.map(emp => (
                <label key={emp.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox"
                    checked={assignForm.employeeIds.includes(emp.id)}
                    onChange={() => toggleEmployee(emp.id)}
                    className="rounded border-border text-info focus:ring-info" />
                  <span className="text-sm text-text-primary">{emp.firstName} {emp.lastName}</span>
                  <span className="text-xs text-text-secondary ml-auto">{emp.employeeCode}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-text-secondary mt-1">{assignForm.employeeIds.length} selected</p>
          </div>

          <Input label="Reason (optional)" placeholder="e.g. Cover for annual leave"
            value={assignForm.reason}
            onChange={e => setAssignForm(f => ({ ...f, reason: e.target.value }))} />

          <div className="flex gap-2 pt-2 justify-end">
            <Button variant="secondary" onClick={() => setAssignModal(false)}>Cancel</Button>
            <Button onClick={handleAssign} loading={assigning}>Assign Staff</Button>
          </div>
        </div>
      </Modal>

      <Modal open={unassignModal} onClose={() => setUnassignModal(false)} title="Remove from Shift" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Remove this employee from their shift on{' '}
            <span className="font-medium text-text-primary">{unassignTarget?.date}</span>?
            This will be logged in the roster history.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setUnassignModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleUnassign} loading={unassigning}>Remove from Shift</Button>
          </div>
        </div>
      </Modal>

      <Modal open={copyModal} onClose={() => setCopyModal(false)} title="Copy Last Week's Roster" size="md">
        <div className="space-y-4">
          {copyError && <Alert type="error" message={copyError} />}
          <p className="text-sm text-text-secondary">
            This copies every shift assignment from last week (
            {dayLabel((() => { const d = new Date(dates[0]); d.setDate(d.getDate() - 7); return d; })())}
            {' – '}
            {dayLabel((() => { const d = new Date(dates[6]); d.setDate(d.getDate() - 7); return d; })())}
            ) forward onto this week, same employees, same shifts, shifted by exactly 7 days.
          </p>
          <p className="text-xs text-text-secondary bg-slate-50 rounded-lg px-3 py-2">
            Existing assignments already on this week won&apos;t be removed — this only adds new ones.
            Review the roster afterward in case anyone needs adjusting (leave, role change, etc.).
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setCopyModal(false)}>Cancel</Button>
            <Button onClick={handleCopyLastWeek} loading={copying}>Copy Forward</Button>
          </div>
        </div>
      </Modal>
    </HODLayout>
  );
}
