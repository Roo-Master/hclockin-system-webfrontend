const balances = [
    {
      type: 'Annual',
      used: 12,
      total: 21,
      color: 'bg-success',
    },
    {
      type: 'Sick',
      used: 2,
      total: 10,
      color: 'bg-info',
    },
    {
      type: 'Compassionate',
      used: 0,
      total: 3,
      color: 'bg-warning',
    },
    {
      type: 'Maternity',
      used: 0,
      total: 90,
      color: 'bg-danger',
    },
  ];
  
  export default function LeaveBalances() {
    return (
      <div className="bg-surface border border-border rounded-card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading text-primary">Leave balances</h2>
        </div>
  
        {/* Balances */}
        <div className="flex flex-col gap-4">
          {balances.map((balance) => {
            const remaining = balance.total - balance.used;
            const percentage = Math.round((remaining / balance.total) * 100);
  
            return (
              <div key={balance.type}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-label text-secondary">{balance.type}</span>
                  <span className="text-label text-secondary">
                    {remaining} / {balance.total} days left
                  </span>
                </div>
                <div className="h-1.5 bg-page rounded-pill overflow-hidden">
                  <div
                    className={`h-full rounded-pill ${balance.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }