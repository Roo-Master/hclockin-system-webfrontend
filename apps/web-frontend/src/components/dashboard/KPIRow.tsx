export default function KPIRow() {
    const kpis = [
      { label: 'Clocked in', value: '07:02', sub: '2 min early', color: 'text-info' },
      { label: 'Hours today', value: '6h 14m', sub: 'Shift ends 15:00', color: 'text-success' },
      { label: 'Attendance this month', value: '94%', sub: '16 / 17 days', color: 'text-primary' },
      { label: 'Leave balance', value: '9 days', sub: 'Annual · 3 pending', color: 'text-warning' },
    ];
  
    return (
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface border border-border rounded-card px-5 py-4">
            <p className="text-label text-secondary mb-2">{kpi.label}</p>
            <p className={`text-stat font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-label text-secondary mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>
    );
  }