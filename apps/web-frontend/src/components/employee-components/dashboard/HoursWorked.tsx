const weeks = [
    { label: 'W1', hours: 32, max: 40 },
    { label: 'W2', hours: 38, max: 40 },
    { label: 'W3', hours: 24, max: 40 },
    { label: 'W4', hours: 8, max: 40 },
  ];
  
  export default function HoursWorked() {
    return (
      <div className="bg-surface border border-border rounded-card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading text-primary">Hours worked · June</h2>
          <a href="/user-dashboard/attendance" className="text-label text-success hover:underline">
            Details →
          </a>
        </div>
  
        {/* Bars */}
        <div className="flex items-end gap-3 h-14">
          {weeks.map((week) => {
            const heightPercent = Math.round((week.hours / week.max) * 100);
            return (
              <div key={week.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-page rounded-sm overflow-hidden h-12 flex items-end">
                  <div
                    className="w-full bg-success rounded-sm transition-all"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-tertiary">{week.label}</span>
              </div>
            );
          })}
        </div>
  
        {/* Totals */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-label text-secondary">
            Total: <strong className="text-primary">71h 20m</strong>
          </span>
          <span className="text-label text-secondary">
            Expected: <strong className="text-primary">88h</strong>
          </span>
        </div>
      </div>
    );
  }