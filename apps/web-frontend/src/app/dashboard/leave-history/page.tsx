import DashboardLayout from '@/components/layout/DashboardLayout';

const leaveHistory = [
  {
    id: 'LV-001',
    type: 'Annual leave',
    dates: 'Jul 3 – Jul 7, 2026',
    days: 5,
    submitted: 'Jun 1, 2026',
    status: 'Pending HR',
    statusStyle: 'bg-warning-bg text-warning',
  },
  {
    id: 'LV-002',
    type: 'Sick leave',
    dates: 'May 22 – May 23, 2026',
    days: 2,
    submitted: 'May 20, 2026',
    status: 'Approved',
    statusStyle: 'bg-success-bg text-success',
  },
  {
    id: 'LV-003',
    type: 'Annual leave',
    dates: 'Apr 14 – Apr 18, 2026',
    days: 5,
    submitted: 'Mar 28, 2026',
    status: 'Rejected',
    statusStyle: 'bg-danger-bg text-danger',
  },
  {
    id: 'LV-004',
    type: 'Compassionate',
    dates: 'Feb 10 – Feb 12, 2026',
    days: 3,
    submitted: 'Feb 5, 2026',
    status: 'Approved',
    statusStyle: 'bg-success-bg text-success',
  },
];

export default function LeaveHistoryPage() {
  return (
    <DashboardLayout title="Leave History">
      <div className="flex flex-col gap-5">
        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-4">All leave requests</h2>

          <div className="grid grid-cols-[80px_120px_1fr_70px_110px_100px] gap-3 px-2 pb-2 border-b border-border">
            <span className="text-label text-secondary">ID</span>
            <span className="text-label text-secondary">Type</span>
            <span className="text-label text-secondary">Dates</span>
            <span className="text-label text-secondary">Days</span>
            <span className="text-label text-secondary">Submitted</span>
            <span className="text-label text-secondary">Status</span>
          </div>

          {leaveHistory.map((leave) => (
            <div key={leave.id} className="grid grid-cols-[80px_120px_1fr_70px_110px_100px] gap-3 px-2 py-3 border-b border-border last:border-0 items-center">
              <span className="text-label text-secondary">{leave.id}</span>
              <span className="text-body font-medium text-primary">{leave.type}</span>
              <span className="text-label text-secondary">{leave.dates}</span>
              <span className="text-label text-primary">{leave.days}</span>
              <span className="text-label text-secondary">{leave.submitted}</span>
              <span className={`text-label font-medium px-2 py-0.5 rounded-pill w-fit ${leave.statusStyle}`}>
                {leave.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}