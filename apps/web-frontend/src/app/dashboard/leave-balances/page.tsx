import DashboardLayout from '@/components/employee-components/layout/DashboardLayout';

const leaveBalances = [
  { type: 'Annual leave', total: 21, used: 12, pending: 5, color: 'bg-success' },
  { type: 'Sick leave', total: 10, used: 2, pending: 0, color: 'bg-info' },
  { type: 'Compassionate', total: 3, used: 0, pending: 0, color: 'bg-warning' },
  { type: 'Maternity', total: 90, used: 0, pending: 0, color: 'bg-danger' },
  { type: 'Paternity', total: 14, used: 0, pending: 0, color: 'bg-primary' },
  { type: 'Study leave', total: 30, used: 0, pending: 0, color: 'bg-secondary' },
];

export default function LeaveBalancesPage() {
  return (
    <DashboardLayout title="Leave Balances">
      <div className="flex flex-col gap-5">
        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-4">Leave balance summary</h2>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-success-bg rounded-card px-4 py-3 text-center">
              <p className="text-label text-secondary">Total leave taken</p>
              <p className="text-stat font-bold text-success">14 days</p>
            </div>
            <div className="bg-info-bg rounded-card px-4 py-3 text-center">
              <p className="text-label text-secondary">Remaining</p>
              <p className="text-stat font-bold text-info">110 days</p>
            </div>
            <div className="bg-warning-bg rounded-card px-4 py-3 text-center">
              <p className="text-label text-secondary">Pending requests</p>
              <p className="text-stat font-bold text-warning">5 days</p>
            </div>
            <div className="bg-page rounded-card px-4 py-3 text-center border border-border">
              <p className="text-label text-secondary">Next accrual</p>
              <p className="text-stat font-bold text-primary">Jan 2027</p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {leaveBalances.map((balance) => {
              const remaining = balance.total - balance.used - balance.pending;
              const usedPercent = Math.round((balance.used / balance.total) * 100);
              const pendingPercent = Math.round((balance.pending / balance.total) * 100);
              const remainingPercent = 100 - usedPercent - pendingPercent;

              return (
                <div key={balance.type}>
                  <div className="flex justify-between mb-2">
                    <span className="text-body font-medium text-primary">{balance.type}</span>
                    <span className="text-label text-secondary">
                      {remaining} days remaining
                    </span>
                  </div>
                  <div className="h-2 bg-page rounded-pill overflow-hidden flex">
                    <div className={`h-full ${balance.color}`} style={{ width: `${usedPercent}%` }} />
                    <div className="h-full bg-warning" style={{ width: `${pendingPercent}%` }} />
                    <div className="h-full bg-border" style={{ width: `${remainingPercent}%` }} />
                  </div>
                  <div className="flex justify-between mt-1 text-[11px] text-tertiary">
                    <span>Used: {balance.used} days</span>
                    <span>Pending: {balance.pending} days</span>
                    <span>Remaining: {remaining} days</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}