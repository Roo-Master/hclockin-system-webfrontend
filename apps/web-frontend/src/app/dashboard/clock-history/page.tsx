import DashboardLayout from '@/components/layout/DashboardLayout';

const logs = [
  { date: 'Sun, 14 Jun 2026', time: '07:02', type: 'Clock In', shift: 'Morning · ICU', device: 'Terminal 1 · ICU', status: 'Success', statusStyle: 'bg-success-bg text-success' },
  { date: 'Sat, 13 Jun 2026', time: '06:03', type: 'Clock Out', shift: 'Night · ICU', device: 'Terminal 1 · ICU', status: 'Success', statusStyle: 'bg-success-bg text-success' },
  { date: 'Sat, 13 Jun 2026', time: '21:58', type: 'Clock In', shift: 'Night · ICU', device: 'Terminal 1 · ICU', status: 'Success', statusStyle: 'bg-success-bg text-success' },
  { date: 'Thu, 11 Jun 2026', time: '07:05', type: 'Clock In', shift: 'Morning · ICU', device: 'Terminal 1 · ICU', status: 'Success', statusStyle: 'bg-success-bg text-success' },
  { date: 'Wed, 10 Jun 2026', time: '15:08', type: 'Clock Out', shift: 'Morning · ICU', device: 'Terminal 1 · ICU', status: 'Success', statusStyle: 'bg-success-bg text-success' },
  { date: 'Wed, 10 Jun 2026', time: '07:12', type: 'Clock In', shift: 'Morning · ICU', device: 'Terminal 1 · ICU', status: 'Success', statusStyle: 'bg-success-bg text-success' },
  { date: 'Tue, 9 Jun 2026', time: '15:02', type: 'Clock Out', shift: 'Morning · ICU', device: 'Terminal 2 · ICU', status: 'Success', statusStyle: 'bg-success-bg text-success' },
  { date: 'Tue, 9 Jun 2026', time: '06:58', type: 'Clock In', shift: 'Morning · ICU', device: 'Terminal 2 · ICU', status: 'Success', statusStyle: 'bg-success-bg text-success' },
  { date: 'Mon, 8 Jun 2026', time: '15:00', type: 'Clock Out', shift: 'Morning · ICU', device: 'Terminal 1 · ICU', status: 'Success', statusStyle: 'bg-success-bg text-success' },
  { date: 'Mon, 8 Jun 2026', time: '07:00', type: 'Clock In', shift: 'Morning · ICU', device: 'Terminal 1 · ICU', status: 'Success', statusStyle: 'bg-success-bg text-success' },
];

export default function ClockHistoryPage() {
  return (
    <DashboardLayout title="Clock History">
      <div className="flex flex-col gap-5">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Total clock-ins</p>
            <p className="text-stat font-bold text-success">16</p>
            <p className="text-label text-secondary mt-1">This month</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Total clock-outs</p>
            <p className="text-stat font-bold text-info">15</p>
            <p className="text-label text-secondary mt-1">This month</p>
          </div>
          <div className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">Missing clock-outs</p>
            <p className="text-stat font-bold text-warning">1</p>
            <p className="text-label text-secondary mt-1">Needs correction</p>
          </div>
        </div>

        {/* Log table */}
        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-heading text-primary mb-4">Clock log</h2>

          {/* Header */}
          <div className="grid grid-cols-[140px_80px_100px_1fr_1fr_90px] gap-3 px-2 pb-2 border-b border-border">
            <span className="text-label text-secondary">Date</span>
            <span className="text-label text-secondary">Time</span>
            <span className="text-label text-secondary">Type</span>
            <span className="text-label text-secondary">Shift</span>
            <span className="text-label text-secondary">Device</span>
            <span className="text-label text-secondary">Status</span>
          </div>

          {/* Rows */}
          {logs.map((log, index) => (
            <div
              key={index}
              className="grid grid-cols-[140px_80px_100px_1fr_1fr_90px] gap-3 px-2 py-3 border-b border-border last:border-0 items-center"
            >
              <span className="text-label text-secondary">{log.date}</span>
              <span className="text-body font-medium text-primary">{log.time}</span>
              <span className={`text-label font-medium ${log.type === 'Clock In' ? 'text-success' : 'text-info'}`}>
                {log.type}
              </span>
              <span className="text-label text-secondary">{log.shift}</span>
              <span className="text-label text-secondary">{log.device}</span>
              <span className={`text-label font-medium px-2 py-0.5 rounded-pill w-fit ${log.statusStyle}`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}