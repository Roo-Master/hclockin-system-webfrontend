const shifts = [
    {
      name: 'Morning shift · ICU',
      time: 'Tomorrow, Mon 15 Jun · 07:00 – 15:00',
      status: 'Confirmed',
      color: 'bg-success',
    },
    {
      name: 'Morning shift · ICU',
      time: 'Tue 16 Jun · 07:00 – 15:00',
      status: 'Confirmed',
      color: 'bg-success',
    },
    {
      name: 'Night shift · ICU',
      time: 'Thu 18 Jun · 21:00 – 07:00',
      status: 'Pending roster',
      color: 'bg-info',
    },
  ];
  
  const statusStyles: Record<string, string> = {
    Confirmed: 'bg-success-bg text-success',
    'Pending roster': 'bg-info-bg text-info',
  };
  
  export default function UpcomingShifts() {
    return (
      <div className="bg-surface border border-border rounded-card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading text-primary">Upcoming shifts</h2>
          <a href="/user-dashboard/shifts" className="text-label text-success hover:underline">
            Full schedule →
          </a>
        </div>
  
        {/* Shifts */}
        <div className="flex flex-col">
          {shifts.map((shift, index) => (
            <div
              key={index}
              className="flex items-center gap-3 py-3 border-b border-border last:border-0"
            >
              {/* Dot */}
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${shift.color}`} />
  
              {/* Info */}
              <div className="flex-1">
                <p className="text-body font-medium text-primary">{shift.name}</p>
                <p className="text-label text-secondary mt-0.5">{shift.time}</p>
              </div>
  
              {/* Status */}
              <span
                className={`text-label font-medium px-2.5 py-0.5 rounded-pill ${statusStyles[shift.status]}`}
              >
                {shift.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }