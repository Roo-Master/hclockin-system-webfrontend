'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────

type MrrPoint = { month: string; mrr: number; arr: number };
type StatusPoint = { name: string; value: number; color: string };

// ── Fallback data ──────────────────────────────────────────────────────────

const FALLBACK_MRR: MrrPoint[] = [
  { month: 'Jan', mrr: 0, arr: 0 },
  { month: 'Feb', mrr: 0, arr: 0 },
  { month: 'Mar', mrr: 0, arr: 0 },
  { month: 'Apr', mrr: 0, arr: 0 },
];

// Status breakdown colors drawn from the semantic palette — §3.1
// Active = success (#16A34A), Trial = warning (#EA580C), Suspended = danger (#DC2626)
const FALLBACK_STATUS: StatusPoint[] = [
  { name: 'Active',    value: 0, color: '#16A34A' },
  { name: 'Trial',     value: 0, color: '#EA580C' },
  { name: 'Suspended', value: 0, color: '#DC2626' },
];

// ── Chart tooltip — light surface style matching card design — §7.1 ────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    // bg-surface, border-border, radius-badge — §3.2 §5
    <div className="bg-surface border border-border rounded-badge px-3 py-2 shadow text-label">
      <p className="text-secondary mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.dataKey.toUpperCase()}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ── MRR Area Chart — §7.5 ─────────────────────────────────────────────────

export function MrrChart({ data = FALLBACK_MRR }: { data?: MrrPoint[] }) {
  const chartData = data.length ? data : FALLBACK_MRR;

  return (
    // Card base — §7.1
    <div className="bg-surface border border-border rounded-card p-6 h-full">

      {/* Card header — §7.1 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {/* text-heading = 17px/600 — §4.1 */}
          <h2 className="text-heading text-primary">Revenue Growth</h2>
          <p className="text-label text-secondary mt-0.5">MRR & ARR trend</p>
        </div>

        {/* Legend — horizontal colored dot + label pairs — §7.5 */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-label text-secondary">
            {/* info color = #2563EB — §3.1 */}
            <span className="w-3 h-0.5 bg-info rounded-full inline-block" aria-hidden="true" />
            MRR
          </span>
          <span className="flex items-center gap-1.5 text-label text-secondary">
            {/* warning color used for ARR as a distinct line */}
            <span className="w-3 h-0.5 bg-warning rounded-full inline-block" aria-hidden="true" />
            ARR
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          {/* Y-axis gridlines: light gray — §7.5 */}
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          {/* X-axis date labels — text-label / text-tertiary — §7.5 */}
          <XAxis
            dataKey="month"
            tick={{ fill: '#9CA3AF', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9CA3AF', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<ChartTooltip />} />
          {/* ARR line — warning (orange) so it's visually distinct from MRR */}
          <Area
            type="monotone"
            dataKey="arr"
            stroke="#EA580C"
            strokeWidth={1.5}
            fill="#EA580C"
            fillOpacity={0.06}
            dot={false}
          />
          {/* MRR line — info blue — §3.1 */}
          <Area
            type="monotone"
            dataKey="mrr"
            stroke="#2563EB"
            strokeWidth={2}
            fill="#2563EB"
            fillOpacity={0.08}
            dot={false}
            activeDot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Donut label ────────────────────────────────────────────────────────────

const RADIAN = Math.PI / 180;
function DonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      fill="#FFFFFF"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

// ── Tenant Status Donut — §7.6 ─────────────────────────────────────────────

export function TenantStatusBreakdown({ data = FALLBACK_STATUS }: { data?: StatusPoint[] }) {
  const chartData = data.length ? data : FALLBACK_STATUS;
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    // Card base — §7.1
    <div className="bg-surface border border-border rounded-card p-6 h-full flex flex-col">

      {/* Card header */}
      <div className="mb-4">
        <h2 className="text-heading text-primary">Tenant Breakdown</h2>
        {/* sub text — text-label / text-secondary */}
        <p className="text-label text-secondary mt-0.5">{total} total accounts</p>
      </div>

      {/* Donut — total in center — §7.6 */}
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={DonutLabel}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend — vertical list: colored dot + name + value(%) — §7.6 */}
      <div className="mt-3 space-y-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-label">
            <span className="flex items-center gap-2 text-secondary">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} aria-hidden="true" />
              {item.name}
            </span>
            <span className="font-medium text-primary tabular-nums">
              {item.value}
              <span className="text-tertiary font-normal ml-1">
                ({total ? `${Math.round((item.value / total) * 100)}%` : '0%'})
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}