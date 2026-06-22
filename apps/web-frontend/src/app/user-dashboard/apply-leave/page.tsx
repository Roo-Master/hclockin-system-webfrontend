'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/user-components/layout/DashboardLayout';
import { applyForLeave } from '@/app/api/user-api/userService';
import { useMyLeaveBalances } from '@/hooks/user-hooks/useGeneralUser';

export default function ApplyLeavePage() {
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: balancesData } = useMyLeaveBalances();
  const balances: Array<Record<string, unknown>> = Array.isArray(balancesData)
    ? balancesData
    : (balancesData?.data ?? []);

  async function handleSubmit() {
    if (!leaveType || !startDate || !endDate) return;
    setSubmitting(true);
    try {
      await applyForLeave({ leaveType, startDate, endDate, reason });
      setSubmitted(true);
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      alert('Failed to submit: ' + message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout title="Apply for Leave">
      <div className="flex flex-col gap-5">
        {submitted && (
          <div className="flex items-center gap-3 bg-success-bg border border-success/30 rounded-card px-4 py-3">
            <span className="text-success">✓</span>
            <p className="text-body text-primary">
              Leave request submitted successfully. Your HOD will review it shortly.
            </p>
          </div>
        )}

        <div className="grid grid-cols-[1fr_300px] gap-5">
          <div className="bg-surface border border-border rounded-card p-5">
            <h2 className="text-heading text-primary mb-5">New leave request</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-label text-secondary block mb-1.5">
                  Leave type <span className="text-danger">*</span>
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full border border-border rounded-badge px-3 py-2 text-body text-primary bg-surface focus:outline-none focus:border-success"
                >
                  <option value="">Select leave type</option>
                  <option value="annual">Annual leave</option>
                  <option value="sick">Sick leave</option>
                  <option value="compassionate">Compassionate leave</option>
                  <option value="maternity">Maternity leave</option>
                  <option value="paternity">Paternity leave</option>
                  <option value="study">Study leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label text-secondary block mb-1.5">
                    Start date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-border rounded-badge px-3 py-2 text-body text-primary bg-surface focus:outline-none focus:border-success"
                  />
                </div>
                <div>
                  <label className="text-label text-secondary block mb-1.5">
                    End date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-border rounded-badge px-3 py-2 text-body text-primary bg-surface focus:outline-none focus:border-success"
                  />
                </div>
              </div>

              <div>
                <label className="text-label text-secondary block mb-1.5">Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Briefly describe the reason for your leave..."
                  className="w-full border border-border rounded-badge px-3 py-2 text-body text-primary bg-surface focus:outline-none focus:border-success resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2 bg-success text-white text-label font-medium rounded-badge hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit request'}
                </button>
                <button
                  onClick={() => {
                    setLeaveType('');
                    setStartDate('');
                    setEndDate('');
                    setReason('');
                  }}
                  className="px-5 py-2 border border-border text-label font-medium rounded-badge hover:bg-page transition-colors text-primary"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-surface border border-border rounded-card p-5">
              <h2 className="text-heading text-primary mb-4">Your balances</h2>
              <div className="flex flex-col gap-4">
                {balances.map((b) => {
                  const used = (b.usedDays ?? b.used ?? 0) as number;
                  const pending = (b.pendingDays ?? b.pending ?? 0) as number;
                  const total = (b.totalDays ?? b.total ?? 0) as number;
                  const remaining = total - used - pending;
                  const leaveTypeLabel = String(b.leaveType ?? 'Leave');

                  return (
                    <div key={String(b.id ?? b.leaveType)}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-label text-secondary">{leaveTypeLabel}</span>
                        <span className="text-label text-secondary">
                          {remaining} / {total} days
                        </span>
                      </div>
                      <div className="h-1.5 bg-page rounded-pill overflow-hidden">
                        <div
                          className="h-full rounded-pill bg-success"
                          style={{ width: `${total > 0 ? Math.round((remaining / total) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-card p-5">
              <h2 className="text-heading text-primary mb-3">Approval workflow</h2>
              <div className="flex flex-col gap-3">
                {['You submit request', 'HOD reviews', 'HR final approval', 'Leave approved'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-success-bg text-success text-xs font-semibold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-label text-secondary">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
