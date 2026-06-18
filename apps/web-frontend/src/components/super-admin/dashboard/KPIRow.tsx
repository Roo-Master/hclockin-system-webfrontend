'use client';

import { Card } from '@/components/common';

interface KPI {
  label: string;
  value: string | number;
  sub: string;
  color: string;
  icon: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export function KPIRow() {
  // This would come from an API
  const kpis: KPI[] = [
    {
      label: 'Total Employees',
      value: '1,248',
      sub: 'Across all departments',
      color: 'text-info',
      icon: '👥',
      trend: { value: 12, direction: 'up' },
    },
    {
      label: 'Present Today',
      value: '986',
      sub: '78.9% attendance',
      color: 'text-success',
      icon: '✅',
      trend: { value: 5, direction: 'up' },
    },
    {
      label: 'On Leave',
      value: '142',
      sub: '11.4% of workforce',
      color: 'text-warning',
      icon: '🏖️',
      trend: { value: 3, direction: 'down' },
    },
    {
      label: 'Absent',
      value: '120',
      sub: '9.7% no-show',
      color: 'text-danger',
      icon: '❌',
      trend: { value: 8, direction: 'up' },
    },
    {
      label: 'Overtime',
      value: '48',
      sub: 'This week',
      color: 'text-info',
      icon: '⏰',
      trend: { value: 2, direction: 'down' },
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-label text-text-secondary">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-text-tertiary mt-1">{kpi.sub}</p>
              {kpi.trend && (
                <p className={`text-xs font-medium mt-1 ${
                  kpi.trend.direction === 'up' ? 'text-success' : 'text-danger'
                }`}>
                  {kpi.trend.direction === 'up' ? '↑' : '↓'} {kpi.trend.value}%
                </p>
              )}
            </div>
            <span className="text-2xl">{kpi.icon}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
