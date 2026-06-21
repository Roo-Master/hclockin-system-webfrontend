'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/employee-components/layout/DashboardLayout';
import { submitCorrectionRequest } from '@/app/api/hr-api/generalUserService';
import { useMyCorrections } from '@/hooks/hr-hooks/useGeneralUser';

export default function CorrectionRequestPage() {
  const [date, setDate] = useState('');
  const [issue, setIssue] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: corData, refetch } = useMyCorrections();
  const pastRequests: Array<Record<string, unknown>> = corData?.data ?? corData ?? [];

  async function handleSubmit() {
    if (!date || !issue) return;
    setSubmitting(true);
    try {
      await submitCorrectionRequest({ date, issueType: issue, notes });
      setSubmitted(true);
      setDate('');
      setIssue('');
      setNotes('');
      refetch();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      alert('Failed to submit: ' + message);
    } finally {
      setSubmitting(false);
    }
  }

  const statusStyle = (status: string) => {
    if (status === 'APPROVED') return 'bg-success-bg text-success';
    if (status === 'REJECTED') return 'bg-danger-bg text-danger';
    return 'bg-warning-bg text-warning';
  };

  return (
    <DashboardLayout title="Correction Request">
      <div className="flex flex-col gap-5">
        {submitted && (
          <div className="flex items-center gap-3 bg-success-bg border border-success/30 rounded-card px-4 py-3">
            <span className="text-success">✓</span>
            <p className="text-body text-primary">
              Correction request submitted successfully. HR will review it shortly.
            </p>
          </div>
        )}

        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-5">Submit a correction</h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-label text-secondary block mb-1.5">Date of issue</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-border rounded-badge px-3 py-2 text-body text-primary bg-surface focus:outline-none focus:border-success"
              />
            </div>

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

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-fit px-5 py-2 bg-success text-white text-label font-medium rounded-badge hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit request'}
            </button>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-4">Past requests</h2>

          <div className="grid grid-cols-[140px_1fr_120px_90px] gap-3 px-2 pb-2 border-b border-border">
            <span className="text-label text-secondary">Date</span>
            <span className="text-label text-secondary">Issue</span>
            <span className="text-label text-secondary">Submitted</span>
            <span className="text-label text-secondary">Status</span>
          </div>

          {pastRequests.map((req, index) => {
            const reqDate = req.date as string | undefined;
            const createdAt = (req.createdAt ?? req.submittedAt) as string | undefined;
            const status = String(req.status ?? 'PENDING');

            return (
              <div
                key={String(req.id ?? index)}
                className="grid grid-cols-[140px_1fr_120px_90px] gap-3 px-2 py-3 border-b border-border last:border-0 items-center"
              >
                <span className="text-label text-secondary">
                  {reqDate ? new Date(reqDate).toDateString() : '—'}
                </span>
                <span className="text-label text-secondary">
                  {String(req.issueType ?? req.issue ?? '—')}
                </span>
                <span className="text-label text-secondary">
                  {createdAt ? new Date(createdAt).toDateString() : '—'}
                </span>
                <span className={`text-label font-medium px-2 py-0.5 rounded-pill w-fit ${statusStyle(status)}`}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
