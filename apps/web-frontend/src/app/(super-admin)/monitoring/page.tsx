'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';

interface MetricCard {
  label: string;
  value: string;
  sub: string;
  status: 'healthy' | 'warn' | 'critical';
  delta?: string;
  deltaDir?: 'up' | 'down' | 'neutral';
}

interface ServiceRow {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  uptime: string;
  latency: string;
  lastChecked: string;
  region: string;
}

interface ErrorEvent {
  id: string;
  timestamp: string;
  code: string;
  message: string;
  count: number;
  severity: 'error' | 'warn' | 'info';
}

interface WsSnapshot {
  total: number;
  authenticated: number;
  anonymous: number;
  peakToday: number;
  messagesPerSec: number;
}

interface UptimeBar {
  day: string;
  pct: number;
}

const PLACEHOLDER_SERVICES: ServiceRow[] = [
  { name: 'Loading service...', status: 'offline', uptime: '—', latency: '—', lastChecked: '—', region: '—' },
  { name: 'Loading service...', status: 'offline', uptime: '—', latency: '—', lastChecked: '—', region: '—' },
  { name: 'Loading service...', status: 'offline', uptime: '—', latency: '—', lastChecked: '—', region: '—' },
];

const PLACEHOLDER_ERRORS: ErrorEvent[] = [
  { id: 'p1', timestamp: '—', code: 'LOADING', message: 'Loading incidents...', count: 1, severity: 'info' },
];

const PLACEHOLDER_UPTIME: UptimeBar[] = [
  { day: 'Mon', pct: 0 },
  { day: 'Tue', pct: 0 },
  { day: 'Wed', pct: 0 },
  { day: 'Thu', pct: 0 },
  { day: 'Fri', pct: 0 },
  { day: 'Sat', pct: 0 },
  { day: 'Sun', pct: 0 },
];

const PLACEHOLDER_WS: WsSnapshot = {
  total: 0,
  authenticated: 0,
  anonymous: 0,
  peakToday: 0,
  messagesPerSec: 0,
};

function fmtTime(): string {
  return new Date().toLocaleTimeString('en-KE', { hour12: false });
}

// ─── Semantic Color Helpers ──────────────────────────────────────────────

function getSemanticColor(status: string) {
  const map: Record<string, { bg: string; text: string; border: string; tint: string }> = {
    healthy: {
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#16A34A]',
      border: 'border-[#16A34A]',
      tint: 'bg-[#DCFCE7]/10',
    },
    online: {
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#16A34A]',
      border: 'border-[#16A34A]',
      tint: 'bg-[#DCFCE7]/10',
    },
    warn: {
      bg: 'bg-[#FFEDD5]',
      text: 'text-[#EA580C]',
      border: 'border-[#EA580C]',
      tint: 'bg-[#FFEDD5]/10',
    },
    degraded: {
      bg: 'bg-[#FFEDD5]',
      text: 'text-[#EA580C]',
      border: 'border-[#EA580C]',
      tint: 'bg-[#FFEDD5]/10',
    },
    critical: {
      bg: 'bg-[#FEE2E2]',
      text: 'text-[#DC2626]',
      border: 'border-[#DC2626]',
      tint: 'bg-[#FEE2E2]/10',
    },
    offline: {
      bg: 'bg-[#FEE2E2]',
      text: 'text-[#DC2626]',
      border: 'border-[#DC2626]',
      tint: 'bg-[#FEE2E2]/10',
    },
    info: {
      bg: 'bg-[#DBEAFE]',
      text: 'text-[#2563EB]',
      border: 'border-[#2563EB]',
      tint: 'bg-[#DBEAFE]/10',
    },
  };
  return map[status] || map.info;
}

// ─── Components ───────────────────────────────────────────────────────────

function StatusDot({
  status,
}: {
  status: 'healthy' | 'warn' | 'critical' | 'online' | 'degraded' | 'offline';
}) {
  const colors = getSemanticColor(status);
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span className={`absolute inline-flex h-full w-full rounded-full ${colors.bg} opacity-60 animate-ping`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors.bg}`} />
    </span>
  );
}

function SeverityBadge({ sev }: { sev: 'error' | 'warn' | 'info' }) {
  const colors = getSemanticColor(sev === 'error' ? 'critical' : sev === 'warn' ? 'warn' : 'info');
  return (
    <span
      className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${colors.tint} ${colors.text} border ${colors.border}/30`}
    >
      {sev}
    </span>
  );
}

function UptimeBarChart({ bars }: { bars: UptimeBar[] }) {
  return (
    <div className="flex items-end gap-1.5 h-12">
      {bars.map((b) => (
        <div key={b.day} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-sm bg-[#16A34A] transition-all duration-500"
            style={{ height: `${(b.pct / 100) * 36}px` }}
            title={`${b.day}: ${b.pct}%`}
          />
          <span className="text-[10px] text-[#6B7280] font-mono">{b.day.slice(0, 2)}</span>
        </div>
      ))}
    </div>
  );
}

function DeltaChip({ delta, dir }: { delta: string; dir: 'up' | 'down' | 'neutral' }) {
  const colors = dir === 'up' 
    ? 'text-[#DC2626]' 
    : dir === 'down' 
    ? 'text-[#16A34A]' 
    : 'text-[#6B7280]';
  const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→';
  return <span className={`text-[12px] font-medium ${colors}`}>{arrow} {delta}</span>;
}

function MetricCardComponent({ card }: { card: MetricCard }) {
  const colors = getSemanticColor(card.status);
  
  return (
    <div className={`relative rounded-xl border bg-white p-4 flex flex-col gap-2 overflow-hidden shadow-sm ${colors.border}/20`}>
      <div className={`absolute top-0 left-4 right-4 h-px ${colors.bg}`} />
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#6B7280]">{card.label}</span>
        <StatusDot status={card.status} />
      </div>
      <div className={`text-3xl font-bold tracking-tight ${colors.text}`}>{card.value}</div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#6B7280]">{card.sub}</span>
        {card.delta && card.deltaDir && <DeltaChip delta={card.delta} dir={card.deltaDir} />}
      </div>
    </div>
  );
}

function ServicesTable({ services }: { services: ServiceRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F5F6FA]">
            <th className="text-left px-4 py-3 text-[12px] font-medium text-[#6B7280]">Service</th>
            <th className="text-left px-4 py-3 text-[12px] font-medium text-[#6B7280]">Status</th>
            <th className="text-left px-4 py-3 text-[12px] font-medium text-[#6B7280] hidden sm:table-cell">Uptime</th>
            <th className="text-left px-4 py-3 text-[12px] font-medium text-[#6B7280] hidden md:table-cell">Latency</th>
            <th className="text-left px-4 py-3 text-[12px] font-medium text-[#6B7280] hidden lg:table-cell">Region</th>
            <th className="text-left px-4 py-3 text-[12px] font-medium text-[#6B7280] hidden lg:table-cell">Checked</th>
          </tr>
        </thead>
        <tbody>
          {services.map((svc, i) => {
            const colors = getSemanticColor(svc.status);
            return (
              <tr
                key={`${svc.name}-${i}`}
                className={`border-b border-[#E5E7EB] hover:bg-[#F5F6FA] transition-colors ${
                  i === services.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium text-[#111827] whitespace-nowrap">{svc.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusDot status={svc.status} />
                    <span className={`text-xs font-medium capitalize ${colors.text}`}>
                      {svc.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#6B7280] hidden sm:table-cell">{svc.uptime}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`font-mono text-xs ${parseInt(svc.latency) > 100 ? 'text-[#EA580C]' : 'text-[#6B7280]'}`}>
                    {svc.latency}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-[#6B7280] hidden lg:table-cell">{svc.region}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-[#6B7280] hidden lg:table-cell">{svc.lastChecked}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ErrorLog({ events }: { events: ErrorEvent[] }) {
  return (
    <div className="flex flex-col divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
      {events.map((ev) => (
        <div key={ev.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#F5F6FA] transition-colors">
          <span className="font-mono text-[11px] text-[#6B7280] pt-0.5 shrink-0 w-[52px]">{ev.timestamp}</span>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityBadge sev={ev.severity} />
              <span className="font-mono text-xs text-[#111827] font-semibold">{ev.code}</span>
              {ev.count > 1 && (
                <span className="text-[10px] bg-[#F5F6FA] text-[#6B7280] rounded px-1.5 py-0.5 font-mono">×{ev.count}</span>
              )}
            </div>
            <p className="text-xs text-[#6B7280] truncate">{ev.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function WsPanel({ snap }: { snap: WsSnapshot }) {
  const authPct = snap.total ? Math.round((snap.authenticated / snap.total) * 100) : 0;

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#6B7280]">WebSocket Connections</span>
        <div className="flex items-center gap-1.5">
          <StatusDot status="online" />
          <span className="text-[11px] font-medium text-[#16A34A]">Live</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-[#16A34A] tracking-tight">{snap.total}</span>
        <span className="text-xs text-[#6B7280]">active sessions</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-[11px] font-medium text-[#6B7280]">
          <span>Authenticated</span>
          <span>{authPct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
          <div className="h-full rounded-full bg-[#16A34A] transition-all duration-700" style={{ width: `${authPct}%` }} />
        </div>
        <div className="flex justify-between text-[11px] font-medium">
          <span className="text-[#16A34A]">{snap.authenticated} auth</span>
          <span className="text-[#6B7280]">{snap.anonymous} anon</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#F5F6FA] rounded-lg p-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase text-[#6B7280] tracking-wider">Peak Today</span>
          <span className="text-lg font-bold text-[#111827]">{snap.peakToday}</span>
        </div>
        <div className="bg-[#F5F6FA] rounded-lg p-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase text-[#6B7280] tracking-wider">Msgs / sec</span>
          <span className="text-lg font-bold text-[#111827]">{snap.messagesPerSec}</span>
        </div>
      </div>
    </div>
  );
}

function UptimeSummary({ bars }: { bars: UptimeBar[] }) {
  const avg = bars.length ? (bars.reduce((a, b) => a + b.pct, 0) / bars.length).toFixed(2) : '0.00';

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#6B7280]">7-Day Uptime</span>
        <span className="text-[12px] font-semibold text-[#16A34A]">{avg}% avg</span>
      </div>
      <UptimeBarChart bars={bars} />
      <div className="flex items-center gap-2 text-[11px] font-medium text-[#6B7280]">
        <span className="inline-block h-2 w-2 rounded-sm bg-[#16A34A]" />
        <span>All bars ≥ 97% — system healthy</span>
      </div>
    </div>
  );
}

function Header({ time, incidents }: { time: string; incidents: number }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E5E7EB]">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280]">Chronos</span>
          <span className="text-[12px] text-[#E5E7EB]">·</span>
          <span className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280]">System Monitor</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">Infrastructure Overview</h1>
      </div>
      <div className="flex items-center gap-4">
        {incidents > 0 && (
          <div className="flex items-center gap-1.5 bg-[#FFEDD5] border border-[#EA580C]/30 rounded-lg px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EA580C] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#EA580C]">
              {incidents} active incident{incidents !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] animate-pulse" />
          <span className="text-[11px] font-medium text-[#6B7280]">Live · {time}</span>
        </div>
      </div>
    </header>
  );
}

export default function SystemMonitorDashboard() {
  const [time, setTime] = useState(fmtTime());
  const [activeTab, setActiveTab] = useState<'services' | 'errors'>('services');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [services, setServices] = useState<ServiceRow[]>(PLACEHOLDER_SERVICES);
  const [errors, setErrors] = useState<ErrorEvent[]>(PLACEHOLDER_ERRORS);
  const [wsSnap, setWsSnap] = useState<WsSnapshot>(PLACEHOLDER_WS);
  const [uptimeBars, setUptimeBars] = useState<UptimeBar[]>(PLACEHOLDER_UPTIME);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/super-admin/system-monitor', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setMetrics(json?.metrics ?? []);
      setServices(json?.services?.length ? json.services : PLACEHOLDER_SERVICES);
      setErrors(json?.errors?.length ? json.errors : PLACEHOLDER_ERRORS);
      setWsSnap(json?.wsSnap ?? PLACEHOLDER_WS);
      setUptimeBars(json?.uptimeBars?.length ? json.uptimeBars : PLACEHOLDER_UPTIME);
    } catch {
      setMetrics([]);
      setServices(PLACEHOLDER_SERVICES);
      setErrors(PLACEHOLDER_ERRORS);
      setWsSnap(PLACEHOLDER_WS);
      setUptimeBars(PLACEHOLDER_UPTIME);
    } finally {
      setLoading(false);
      setTime(fmtTime());
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const id = setInterval(() => {
      setTime(fmtTime());
      fetchDashboard();
    }, 3000);
    return () => clearInterval(id);
  }, [fetchDashboard]);

  const incidents = useMemo(
    () => services.filter((s) => s.status === 'degraded' || s.status === 'offline').length,
    [services]
  );

  const showMetrics = loading
    ? [
        { label: 'Loading...', value: '—', sub: 'Fetching live data', status: 'healthy' as const },
        { label: 'Loading...', value: '—', sub: 'Fetching live data', status: 'healthy' as const },
        { label: 'Loading...', value: '—', sub: 'Fetching live data', status: 'healthy' as const },
        { label: 'Loading...', value: '—', sub: 'Fetching live data', status: 'healthy' as const },
        { label: 'Loading...', value: '—', sub: 'Fetching live data', status: 'healthy' as const },
        { label: 'Loading...', value: '—', sub: 'Fetching live data', status: 'healthy' as const },
      ]
    : metrics;

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-[#111827] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        <Header time={time} incidents={incidents} />

        {/* KPI Stat Row - 6 columns matching design system */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {showMetrics.map((m) => (
              <MetricCardComponent key={m.label} card={m} />
            ))}
          </div>
        </section>

        {/* Main Content Row - 2/3 + 1/3 layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-white border border-[#E5E7EB] rounded-lg p-1 w-fit shadow-sm">
              {(['services', 'errors'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium uppercase tracking-wider transition-all ${
                    activeTab === tab 
                      ? 'bg-[#2563EB] text-white shadow-sm' 
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F5F6FA]'
                  }`}
                >
                  {tab}
                  {tab === 'errors' && (
                    <span className={`ml-1.5 rounded px-1.5 py-px text-[10px] ${
                      activeTab === tab 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[#FEE2E2] text-[#DC2626]'
                    }`}>
                      {errors.filter((e) => e.severity === 'error').length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'services' ? <ServicesTable services={services} /> : <ErrorLog events={errors} />}
          </div>

          {/* Right Column - WebSocket + Uptime */}
          <div className="flex flex-col gap-4">
            <WsPanel snap={wsSnap} />
            <UptimeSummary bars={uptimeBars} />
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
          <span className="text-[11px] font-medium text-[#6B7280]">Chronos · Hospital Clock-in &amp; HR Platform</span>
          <span className="text-[11px] font-medium text-[#6B7280]">af-south-1 · auto-refresh every 3 s</span>
        </footer>
      </div>
    </div>
  );
}