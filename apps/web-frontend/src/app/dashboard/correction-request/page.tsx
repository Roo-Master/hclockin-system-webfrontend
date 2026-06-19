'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/employee-components/layout/DashboardLayout';

const pastRequests = [
  {
    date: 'Thu, 11 Jun 2026',
    shift: 'Morning · ICU',
    issue: 'Missing clock-out',
    submitted: '14 Jun 2026',
    status: 'Pending',
    statusStyle: 'bg-warning-bg text-warning',
  },
];

export default function CorrectionRequestPage() {
  const [date, setDate] = useState('');
  const [issue, setIssue] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!date || !issue) return;
    setSubmitted(true);
    setDate('');
    setIssue('');
    setNotes('');
  }

  return (
    <DashboardLayout title="Correction Request">
      <div className="flex flex-col gap-5">

        {/* Alert */}
        <div className="flex items-center gap-3 bg-warning-bg border border-warning/30 rounded-card px-4 py-3">
          <span className="text-warning">⚠</span>
          <p className="text-body text-primary">
            You have a missing clock-out on <strong>Thu 11 Jun</strong>. Please submit a correction request below.
          </p>
        </div>

        {/* Success message */}
        {submitted && (
          <div className="flex items-center gap-3 bg-success-bg border border-success/30 rounded-card px-4 py-3">
            <span className="text-success">✓</span>
            <p className="text-body text-primary">Correction request submitted successfully. HR will review it shortly.</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-5">Submit a correction</h2>

          <div className="flex flex-col gap-4">
            {/* Date */}
            <div>
              <label className="text-label text-secondary block mb-1.5">Date of issue</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-border rounded-badge px-3 py-2 text-body text-primary bg-surface focus:outline-none focus:border-success"
              />
            </div>

            {/* Issue type */}
            <div>
              <label className="text-label text-secondary block mb-1.5">Issue type</label>
              <select
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full border border-border rounded-badge px-3 py-2 text-body text-primary bg-surface focus:outline-none focus:border-success"
              >
                <option value="">Select an issue</option>
                <option value="missing-out">Missing clock-out</option>
                <option value="missing-in">Missing clock-in</option>
                <option value="wrong-time">Wrong time recorded</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-label text-secondary block mb-1.5">Additional notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Explain what happened..."
                className="w-full border border-border rounded-badge px-3 py-2 text-body text-primary bg-surface focus:outline-none focus:border-success resize-none"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-fit px-5 py-2 bg-success text-white text-label font-medium rounded-badge hover:opacity-90 transition-opacity"
            >
              Submit request
            </button>
          </div>
        </div>

        {/* Past requests */}
        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-4">Past requests</h2>

          <div className="grid grid-cols-[140px_1fr_1fr_120px_90px] gap-3 px-2 pb-2 border-b border-border">
            <span className="text-label text-secondary">Date</span>
            <span className="text-label text-secondary">Shift</span>
            <span className="text-label text-secondary">Issue</span>
            <span className="text-label text-secondary">Submitted</span>
            <span className="text-label text-secondary">Status</span>
          </div>

          {pastRequests.map((req, index) => (
            <div
              key={index}
              className="grid grid-cols-[140px_1fr_1fr_120px_90px] gap-3 px-2 py-3 border-b border-border last:border-0 items-center"
            >
              <span className="text-label text-secondary">{req.date}</span>
              <span className="text-body text-primary">{req.shift}</span>
              <span className="text-label text-secondary">{req.issue}</span>
              <span className="text-label text-secondary">{req.submitted}</span>
              <span className={`text-label font-medium px-2 py-0.5 rounded-pill w-fit ${req.statusStyle}`}>
                {req.status}
              </span>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}