'use client';
import DashboardLayout from '@/components/user-components/layout/DashboardLayout';
import { useMyLeaveHistory } from '@/hooks/user-hooks/useGeneralUser';

export default function LeaveHistoryPage() {
  const { data, loading, error } = useMyLeaveHistory();
  const leaves = data?.data ?? data ?? [];

  const statusStyle = (status: string) => {
    if (status === 'APPROVED') return 'bg-success-bg text-success';
    if (status === 'REJECTED') return 'bg-danger-bg text-danger';
    return 'bg-warning-bg text-warning';
  };

  return (
    <DashboardLayout title="Leave History">
      <div className="flex flex-col gap-5">
        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-4">All leave requests</h2>
          {loading && <p className="text-label text-secondary">Loading...</p>}
          {error && <p className="text-label text-danger">Error: {error}</p>}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-[80px_130px_1fr_70px_110px_110px] gap-3 px-2 pb-2 border-b border-border">
                <span className="text-label text-secondary">ID</span>
                <span className="text-label text-secondary">Type</span>
                <span className="text-label text-secondary">Dates</span>
                <span className="text-label text-secondary">Days</span>
                <span className="text-label text-secondary">Submitted</span>
                <span className="text-label text-secondary">Status</span>
              </div>
              {leaves.map((leave: {
                id: string;
                leaveType?: string;
                type?: string;
                startDate: string;
                endDate: string;
                totalDays?: number;
                createdAt?: string;
                submittedAt?: string;
                status: string;
              }) => (
                <div
                  key={leave.id}
                  className="grid grid-cols-[80px_130px_1fr_70px_110px_110px] gap-3 px-2 py-3 border-b border-border last:border-0 items-center"
                >
                  <span className="text-label text-secondary">{leave.id?.slice(0, 6).toUpperCase()}</span>
                  <span className="text-body font-medium text-primary">{leave.leaveType ?? leave.type}</span>
                  <span className="text-label text-secondary">
                    {new Date(leave.startDate).toDateString()} – {new Date(leave.endDate).toDateString()}
                  </span>
                  <span className="text-label text-primary">{leave.totalDays ?? '—'}</span>
                  <span className="text-label text-secondary">
                    {(leave.createdAt ?? leave.submittedAt)
                      ? new Date(leave.createdAt ?? leave.submittedAt!).toDateString()
                      : '—'}
                  </span>
                  <span className={`text-label font-medium px-2 py-0.5 rounded-pill w-fit ${statusStyle(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
