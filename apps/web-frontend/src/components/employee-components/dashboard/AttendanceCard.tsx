const statusStyles: Record<string, string> = {
    'On duty': 'bg-info-bg text-info',
    'Complete': 'bg-success-bg text-success',
    'Missing out': 'bg-warning-bg text-warning',
    'Off': 'bg-page text-secondary',
  };
  
  const records = [
    { date: 'Sun, 14 Jun', shift: 'Morning · ICU', inOut: '07:02 → –', status: 'On duty' },
    { date: 'Sat, 13 Jun', shift: 'Night · ICU', inOut: '21:58 → 06:03', status: 'Complete' },
    { date: 'Fri, 12 Jun', shift: 'Day off', inOut: '–', status: 'Off' },
    { date: 'Thu, 11 Jun', shift: 'Morning · ICU', inOut: '07:05 → –', status: 'Missing out' },
    { date: 'Wed, 10 Jun', shift: 'Morning · ICU', inOut: '07:12 → 15:08', status: 'Complete' },
  ];
  
  export default function AttendanceCard() {
    return (
      <div className="bg-surface border border-border rounded-card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading text-primary">Attendance this month</h2>
          <a href="/dashboard/attendance" className="text-label text-success hover:underline">
            View full history →
          </a>
        </div>
  
        {/* Today session summary */}
        <div className="grid grid-cols-3 bg-page rounded-badge px-4 py-3 mb-4">
          <div className="text-center">
            <p className="text-stat text-info">07:02</p>
            <p className="text-label text-secondary mt-1">Clock in</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-stat text-secondary">15:00</p>
            <p className="text-label text-secondary mt-1">Expected out</p>
          </div>
          <div className="text-center">
            <p className="text-stat text-success">6h 14m</p>
            <p className="text-label text-secondary mt-1">Worked</p>
          </div>
        </div>
  
        {/* Table header */}
        <div className="grid grid-cols-[120px_1fr_120px_100px] gap-2 px-2 pb-2 border-b border-border">
          <span className="text-label text-secondary">Date</span>
          <span className="text-label text-secondary">Shift</span>
          <span className="text-label text-secondary">In / Out</span>
          <span className="text-label text-secondary">Status</span>
        </div>
  
        {/* Table rows */}
        {records.map((row) => (
          <div
            key={row.date}
            className="grid grid-cols-[120px_1fr_120px_100px] gap-2 px-2 py-2.5 border-b border-border last:border-0 items-center"
          >
            <span className="text-label text-secondary">{row.date}</span>
            <span className="text-body text-primary">{row.shift}</span>
            <span className="text-label text-secondary">{row.inOut}</span>
            <span
              className={`text-label font-medium px-2 py-0.5 rounded-pill w-fit ${statusStyles[row.status]}`}
            >
              {row.status}
            </span>
          </div>
        ))}
      </div>
    );
  }