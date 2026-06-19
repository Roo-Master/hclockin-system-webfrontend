const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type DayStatus = 'present' | 'absent' | 'leave' | 'today' | 'weekend' | 'empty' | 'future';

interface CalendarDay {
  day: number | null;
  status: DayStatus;
}

const calendarDays: CalendarDay[] = [
  // Week 1 - starts on Monday
  { day: null, status: 'empty' },
  { day: null, status: 'empty' },
  { day: null, status: 'empty' },
  { day: null, status: 'empty' },
  { day: null, status: 'empty' },
  { day: 7, status: 'weekend' },
  { day: 8, status: 'present' },
  // Week 2
  { day: 9, status: 'present' },
  { day: 10, status: 'present' },
  { day: 11, status: 'absent' },
  { day: 12, status: 'weekend' },
  { day: 13, status: 'weekend' },
  { day: 14, status: 'present' },
  { day: 15, status: 'today' },
  // Week 3
  { day: 16, status: 'future' },
  { day: 17, status: 'future' },
  { day: 18, status: 'future' },
  { day: 19, status: 'future' },
  { day: 20, status: 'future' },
  { day: 21, status: 'future' },
  { day: 22, status: 'future' },
  // Week 4
  { day: 23, status: 'leave' },
  { day: 24, status: 'leave' },
  { day: 25, status: 'leave' },
  { day: 26, status: 'leave' },
  { day: 27, status: 'leave' },
  { day: 28, status: 'future' },
  { day: 29, status: 'future' },
  // Week 5
  { day: 30, status: 'future' },
];

const statusStyles: Record<DayStatus, string> = {
  present: 'bg-success-bg text-success font-medium',
  absent: 'bg-danger-bg text-danger font-medium',
  leave: 'bg-info-bg text-info font-medium',
  today: 'ring-2 ring-success text-primary font-medium',
  weekend: 'text-tertiary',
  empty: 'invisible',
  future: 'text-secondary',
};

const legend = [
  { label: 'Present', style: 'bg-success-bg border border-success/30' },
  { label: 'Absent', style: 'bg-danger-bg border border-danger/30' },
  { label: 'Leave', style: 'bg-info-bg border border-info/30' },
];

export default function AttendanceCalendar() {
  return (
    <div className="bg-surface border border-border rounded-card p-5">
      {/* Header */}
      <h2 className="text-heading text-primary mb-4">June 2026</h2>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {days.map((d, i) => (
          <div key={i} className="text-center text-label text-secondary py-1 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((cell, i) => (
          <div
            key={i}
            className={`text-center text-label py-1 rounded-badge text-[11px] ${statusStyles[cell.status]}`}
          >
            {cell.day}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 flex-wrap">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${item.style}`} />
            <span className="text-label text-secondary">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}