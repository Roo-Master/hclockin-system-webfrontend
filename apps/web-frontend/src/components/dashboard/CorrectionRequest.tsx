import Link from 'next/link';

export default function CorrectionRequest() {
  return (
    <div className="bg-surface border border-border rounded-card p-5">
      <h2 className="text-heading text-primary mb-4">Correction request</h2>
      <div className="flex items-center gap-4 bg-warning-bg rounded-badge px-4 py-3">
        <span className="text-warning text-xl flex-shrink-0">!</span>
        <p className="text-body text-secondary flex-1">
          Missing clock-out on <strong className="text-primary">Thu 11 Jun</strong> detected. Submit a correction so HR can update your record.
        </p>
        <Link
          href="/dashboard/correction-request"
          className="flex-shrink-0 text-label font-medium px-3 py-1.5 border border-border rounded-badge bg-surface text-primary hover:bg-page transition-colors"
        >
          Submit
        </Link>
      </div>
    </div>
  );
}