const requests = [
    {
      type: 'Annual leave',
      dates: 'Jul 3 – Jul 7 · 5 days',
      status: 'Pending HR',
      statusStyle: 'bg-warning-bg text-warning',
    },
    {
      type: 'Sick leave',
      dates: 'May 22 – May 23 · 2 days',
      status: 'Approved',
      statusStyle: 'bg-success-bg text-success',
    },
    {
      type: 'Annual leave',
      dates: 'Apr 14 – Apr 18 · 5 days',
      status: 'Rejected',
      statusStyle: 'bg-danger-bg text-danger',
    },
  ];
  
  export default function LeaveRequests() {
    return (
      <div className="bg-surface border border-border rounded-card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading text-primary">Leave requests</h2>
          <a href="/user-dashboard/apply-leave" className="text-label text-success hover:underline">
            New request →
          </a>
        </div>
  
        {/* List */}
        <div className="flex flex-col">
          {requests.map((req, index) => (
            <div
              key={index}
              className="py-3 border-b border-border last:border-0"
            >
              <div className="flex items-center justify-between">
                <p className="text-body font-medium text-primary">{req.type}</p>
                <span
                  className={`text-label font-medium px-2.5 py-0.5 rounded-pill ${req.statusStyle}`}
                >
                  {req.status}
                </span>
              </div>
              <p className="text-label text-secondary mt-1">{req.dates}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }