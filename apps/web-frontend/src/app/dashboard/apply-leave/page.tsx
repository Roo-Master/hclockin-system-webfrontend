'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/employee-components/layout/DashboardLayout';

export default function ApplyLeavePage() {
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!leaveType || !startDate || !endDate) return;
    setSubmitted(true);
    setLeaveType('');
    setStartDate('');
    setEndDate('');
    setReason('');
  }

  return (
    <DashboardLayout title="Apply for Leave">
      <div className="flex flex-col gap-5">

        {/* Success message */}
        {submitted && (
          <div className="flex items-center gap-3 bg-success-bg border border-success/30 rounded-card px-4 py-3">
            <span className="text-success">✓</span>
            <p className="text-body text-primary">
              Leave request submitted successfully. Your HOD will review it shortly.
            </p>
          </div>
        )}

        <div className="grid grid-cols-[1fr_300px] gap-5">

          {/* Form */}
          <div className="bg-surface border border-border rounded-card p-5">
            <h2 className="text-heading text-primary mb-5">New leave request</h2>

            <div className="flex flex-col gap-4">
              {/* Leave type */}
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

              {/* Date range */}
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

              {/* Reason */}
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

              {/* Submit */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 bg-success text-white text-label font-medium rounded-badge hover:opacity-90 transition-opacity"
                >
                  Submit request
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

          {/* Leave balances sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-surface border border-border rounded-card p-5">
              <h2 className="text-heading text-primary mb-4">Your balances</h2>
              <div className="flex flex-col gap-4">
                {[
                  { type: 'Annual', remaining: 9, total: 21, color: 'bg-success' },
                  { type: 'Sick', remaining: 8, total: 10, color: 'bg-info' },
                  { type: 'Compassionate', remaining: 3, total: 3, color: 'bg-warning' },
                  { type: 'Maternity', remaining: 90, total: 90, color: 'bg-danger' },
                ].map((b) => (
                  <div key={b.type}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-label text-secondary">{b.type}</span>
                      <span className="text-label text-secondary">{b.remaining} / {b.total} days</span>
                    </div>
                    <div className="h-1.5 bg-page rounded-pill overflow-hidden">
                      <div
                        className={`h-full rounded-pill ${b.color}`}
                        style={{ width: `${Math.round((b.remaining / b.total) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
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