import DashboardLayout from '@/components/employee-components/layout/DashboardLayout';

const records = [
  { date: 'Sun, 14 Jun', shift: 'Morning · ICU', in: '07:02', out: '–', hours: '–', status: 'On duty', statusStyle: 'bg-info-bg text-info' },
  { date: 'Sat, 13 Jun', shift: 'Night · ICU', in: '21:58', out: '06:03', hours: '8h 05m', status: 'Complete', statusStyle: 'bg-success-bg text-success' },
  { date: 'Fri, 12 Jun', shift: 'Day off', in: '–', out: '–', hours: '–', status: 'Off', statusStyle: 'bg-page text-secondary' },
  { date: 'Thu, 11 Jun', shift: 'Morning · ICU', in: '07:05', out: '–', hours: '–', status: 'Missing out', statusStyle: 'bg-warning-bg text-warning' },
  { date: 'Wed, 10 Jun', shift: 'Morning · ICU', in: '07:12', out: '15:08', hours: '7h 56m', status: 'Complete', statusStyle: 'bg-success-bg text-success' },
  { date: 'Tue, 9 Jun', shift: 'Morning · ICU', in: '06:58', out: '15:02', hours: '8h 04m', status: 'Complete', statusStyle: 'bg-success-bg text-success' },
  { date: 'Mon, 8 Jun', shift: 'Morning · ICU', in: '07:00', out: '15:00', hours: '8h 00m', status: 'Complete', statusStyle: 'bg-success-bg text-success' },
  { date: 'Sun, 7 Jun', shift: 'Day off', in: '–', out: '–', hours: '–', status: 'Off', statusStyle: 'bg-page text-secondary' },
  { date: 'Sat, 6 Jun', shift: 'Day off', in: '–', out: '–', hours: '–', status: 'Off', statusStyle: 'bg-page text-secondary' },
  { date: 'Fri, 5 Jun', shift: 'Morning · ICU', in: '07:03', out: '15:05', hours: '8h 02m', status: 'Complete', statusStyle: 'bg-success-bg text-success' },
];

export default function AttendancePage() {
  return (
    <DashboardLayout title="My Attendance">
      <div className="flex flex-col gap-5">

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Present days</p>
            <p className="text-stat font-bold text-success">16</p>
            <p className="text-label text-secondary mt-1">This month</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Absent days</p>
            <p className="text-stat font-bold text-danger">1</p>
            <p className="text-label text-secondary mt-1">This month</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Attendance rate</p>
            <p className="text-stat font-bold text-primary">94%</p>
            <p className="text-label text-secondary mt-1">16 / 17 days</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Hours worked</p>
            <p className="text-stat font-bold text-info">71h 20m</p>
            <p className="text-label text-secondary mt-1">Expected 88h</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-4">Attendance history</h2>

          {/* Table header */}
          <div className="grid grid-cols-[140px_1fr_80px_80px_90px_100px] gap-3 px-2 pb-2 border-b border-border">
            <span className="text-label text-secondary">Date</span>
            <span className="text-label text-secondary">Shift</span>
            <span className="text-label text-secondary">Clock in</span>
            <span className="text-label text-secondary">Clock out</span>
            <span className="text-label text-secondary">Hours</span>
            <span className="text-label text-secondary">Status</span>
          </div>

          {/* Table rows */}
          {records.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-[140px_1fr_80px_80px_90px_100px] gap-3 px-2 py-3 border-b border-border last:border-0 items-center"
            >
              <span className="text-label text-secondary">{row.date}</span>
              <span className="text-body text-primary">{row.shift}</span>
              <span className="text-label text-secondary">{row.in}</span>
              <span className="text-label text-secondary">{row.out}</span>
              <span className="text-label text-primary font-medium">{row.hours}</span>
              <span className={`text-label font-medium px-2 py-0.5 rounded-pill w-fit ${row.statusStyle}`}>
                {row.status}
              </span>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}