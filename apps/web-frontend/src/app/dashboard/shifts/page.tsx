import DashboardLayout from '@/components/employee-components/layout/DashboardLayout';

const shifts = [
  {
    date: 'Mon, 15 Jun 2026',
    name: 'Morning shift',
    department: 'ICU',
    start: '07:00',
    end: '15:00',
    hours: '8h',
    status: 'Confirmed',
    statusStyle: 'bg-success-bg text-success',
  },
  {
    date: 'Tue, 16 Jun 2026',
    name: 'Morning shift',
    department: 'ICU',
    start: '07:00',
    end: '15:00',
    hours: '8h',
    status: 'Confirmed',
    statusStyle: 'bg-success-bg text-success',
  },
  {
    date: 'Wed, 17 Jun 2026',
    name: 'Morning shift',
    department: 'ICU',
    start: '07:00',
    end: '15:00',
    hours: '8h',
    status: 'Confirmed',
    statusStyle: 'bg-success-bg text-success',
  },
  {
    date: 'Thu, 18 Jun 2026',
    name: 'Night shift',
    department: 'ICU',
    start: '21:00',
    end: '07:00',
    hours: '10h',
    status: 'Pending roster',
    statusStyle: 'bg-info-bg text-info',
  },
  {
    date: 'Fri, 19 Jun 2026',
    name: 'Night shift',
    department: 'ICU',
    start: '21:00',
    end: '07:00',
    hours: '10h',
    status: 'Pending roster',
    statusStyle: 'bg-info-bg text-info',
  },
  {
    date: 'Sat, 20 Jun 2026',
    name: 'Day off',
    department: '–',
    start: '–',
    end: '–',
    hours: '–',
    status: 'Off',
    statusStyle: 'bg-page text-secondary',
  },
  {
    date: 'Sun, 21 Jun 2026',
    name: 'Day off',
    department: '–',
    start: '–',
    end: '–',
    hours: '–',
    status: 'Off',
    statusStyle: 'bg-page text-secondary',
  },
];

export default function ShiftsPage() {
  return (
    <DashboardLayout title="My Shifts">
      <div className="flex flex-col gap-5">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Upcoming shifts</p>
            <p className="text-stat font-bold text-success">5</p>
            <p className="text-label text-secondary mt-1">Next 7 days</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Confirmed</p>
            <p className="text-stat font-bold text-info">3</p>
            <p className="text-label text-secondary mt-1">Next 7 days</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Pending roster</p>
            <p className="text-stat font-bold text-warning">2</p>
            <p className="text-label text-secondary mt-1">Awaiting confirmation</p>
          </div>
        </div>

        {/* Shifts table */}
        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-4">Upcoming schedule</h2>

          {/* Header */}
          <div className="grid grid-cols-[150px_1fr_100px_80px_80px_80px_110px] gap-3 px-2 pb-2 border-b border-border">
            <span className="text-label text-secondary">Date</span>
            <span className="text-label text-secondary">Shift</span>
            <span className="text-label text-secondary">Department</span>
            <span className="text-label text-secondary">Start</span>
            <span className="text-label text-secondary">End</span>
            <span className="text-label text-secondary">Hours</span>
            <span className="text-label text-secondary">Status</span>
          </div>

          {/* Rows */}
          {shifts.map((shift, index) => (
            <div
              key={index}
              className="grid grid-cols-[150px_1fr_100px_80px_80px_80px_110px] gap-3 px-2 py-3 border-b border-border last:border-0 items-center"
            >
              <span className="text-label text-secondary">{shift.date}</span>
              <span className="text-body font-medium text-primary">{shift.name}</span>
              <span className="text-label text-secondary">{shift.department}</span>
              <span className="text-label text-primary">{shift.start}</span>
              <span className="text-label text-primary">{shift.end}</span>
              <span className="text-label text-primary">{shift.hours}</span>
              <span className={`text-label font-medium px-2 py-0.5 rounded-pill w-fit ${shift.statusStyle}`}>
                {shift.status}
              </span>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}