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

function StatusDot({
  status,
}: {
  status: 'healthy' | 'warn' | 'critical' | 'online' | 'degraded' | 'offline';
}) {
  const color =
    status === 'healthy' || status === 'online'
      ? 'bg-emerald-400'
      : status === 'warn' || status === 'degraded'
      ? 'bg-amber-400'
      : 'bg-red-500';

  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  );
}

function SeverityBadge({ sev }: { sev: 'error' | 'warn' | 'info' }) {
  const styles = {
    error: 'bg-red-500/15 text-red-400 border border-red-500/30',
    warn: 'bg-amber-400/15 text-amber-400 border border-amber-400/30',
    info: 'bg-sky-400/15 text-sky-400 border border-sky-400/30',
  };

  return (
    <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${styles[sev]}`}>
      {sev}
    </span>
  );
}

function UptimeBarChart({ bars }: { bars: UptimeBar[] }) {
  return (
    <div className="flex items-end gap-1 h-10">
      {bars.map((b) => (
        <div key={b.day} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-sm bg-emerald-500/80 transition-all duration-500"
            style={{ height: `${(b.pct / 100) * 32}px` }}
            title={`${b.day}: ${b.pct}%`}
          />
          <span className="text-[9px] text-slate-500 font-mono">{b.day.slice(0, 2)}</span>
        </div>
      ))}
    </div>
  );
}

function DeltaChip({ delta, dir }: { delta: string; dir: 'up' | 'down' | 'neutral' }) {
  const cls =
    dir === 'neutral'
      ? 'text-slate-400'
      : dir === 'up'
      ? 'text-rose-400'
      : 'text-emerald-400';

  const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→';

  return <span className={`text-[11px] font-mono font-medium ${cls}`}>{arrow} {delta}</span>;
}

function MetricCardComponent({ card }: { card: MetricCard }) {
  const borderColor =
    card.status === 'healthy'
      ? 'border-emerald-500/20'
      : card.status === 'warn'
      ? 'border-amber-400/30'
      : 'border-red-500/30';

  const accentColor =
    card.status === 'healthy'
      ? 'text-emerald-400'
      : card.status === 'warn'
      ? 'text-amber-400'
      : 'text-red-400';

  return (
    <div className={`relative rounded-xl border ${borderColor} bg-slate-900/60 backdrop-blur-sm p-4 flex flex-col gap-2 overflow-hidden`}>
      <div
        className={`absolute top-0 left-4 right-4 h-px ${
          card.status === 'healthy'
            ? 'bg-emerald-500/40'
            : card.status === 'warn'
            ? 'bg-amber-400/40'
            : 'bg-red-500/40'
        }`}
      />
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">{card.label}</span>
        <StatusDot status={card.status} />
      </div>
      <div className={`text-2xl font-bold font-mono tracking-tight ${accentColor}`}>{card.value}</div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-500">{card.sub}</span>
        {card.delta && card.deltaDir && <DeltaChip delta={card.delta} dir={card.deltaDir} />}
      </div>
    </div>
  );
}

function ServicesTable({ services }: { services: ServiceRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-normal">Service</th>
            <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-normal">Status</th>
            <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-normal hidden sm:table-cell">Uptime</th>
            <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-normal hidden md:table-cell">Latency</th>
            <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-normal hidden lg:table-cell">Region</th>
            <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-normal hidden lg:table-cell">Checked</th>
          </tr>
        </thead>
        <tbody>
          {services.map((svc, i) => (
            <tr
              key={`${svc.name}-${i}`}
              className={`border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors ${
                i === services.length - 1 ? 'border-b-0' : ''
              }`}
            >
              <td className="px-4 py-3 font-medium text-slate-200 whitespace-nowrap">{svc.name}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <StatusDot status={svc.status} />
                  <span
                    className={`text-xs font-mono capitalize ${
                      svc.status === 'online'
                        ? 'text-emerald-400'
                        : svc.status === 'degraded'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {svc.status}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-400 hidden sm:table-cell">{svc.uptime}</td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span className={`font-mono text-xs ${parseInt(svc.latency) > 100 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {svc.latency}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-[11px] text-slate-500 hidden lg:table-cell">{svc.region}</td>
              <td className="px-4 py-3 font-mono text-[11px] text-slate-500 hidden lg:table-cell">{svc.lastChecked}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorLog({ events }: { events: ErrorEvent[] }) {
  return (
    <div className="flex flex-col divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      {events.map((ev) => (
        <div key={ev.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors">
          <span className="font-mono text-[11px] text-slate-500 pt-0.5 shrink-0 w-[52px]">{ev.timestamp}</span>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityBadge sev={ev.severity} />
              <span className="font-mono text-xs text-slate-300 font-semibold">{ev.code}</span>
              {ev.count > 1 && (
                <span className="text-[10px] bg-slate-700 text-slate-400 rounded px-1.5 py-0.5 font-mono">×{ev.count}</span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">{ev.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function WsPanel({ snap }: { snap: WsSnapshot }) {
  const authPct = snap.total ? Math.round((snap.authenticated / snap.total) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">WebSocket Connections</span>
        <div className="flex items-center gap-1.5">
          <StatusDot status="online" />
          <span className="text-[11px] font-mono text-emerald-400">Live</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold font-mono text-emerald-400 tracking-tight">{snap.total}</span>
        <span className="text-xs text-slate-500">active sessions</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-[11px] font-mono text-slate-500">
          <span>Authenticated</span>
          <span>{authPct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${authPct}%` }} />
        </div>
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-emerald-400">{snap.authenticated} auth</span>
          <span className="text-slate-500">{snap.anonymous} anon</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800/60 rounded-lg p-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Peak Today</span>
          <span className="text-lg font-bold font-mono text-slate-200">{snap.peakToday}</span>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Msgs / sec</span>
          <span className="text-lg font-bold font-mono text-slate-200">{snap.messagesPerSec}</span>
        </div>
      </div>
    </div>
  );
}

function UptimeSummary({ bars }: { bars: UptimeBar[] }) {
  const avg = bars.length ? (bars.reduce((a, b) => a + b.pct, 0) / bars.length).toFixed(2) : '0.00';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">7-Day Uptime</span>
        <span className="text-[11px] font-mono text-emerald-400 font-semibold">{avg}% avg</span>
      </div>
      <UptimeBarChart bars={bars} />
      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
        <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500/80" />
        <span>All bars ≥ 97% — system healthy</span>
      </div>
    </div>
  );
}

function Header({ time, incidents }: { time: string; incidents: number }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Chronos</span>
          <span className="text-[10px] font-mono text-slate-700">·</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">System Monitor</span>
        </div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">Infrastructure Overview</h1>
      </div>
      <div className="flex items-center gap-4">
        {incidents > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-mono text-amber-400 font-semibold">
              {incidents} active incident{incidents !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-pulse" />
          <span className="text-[11px] font-mono text-slate-500">Live · {time}</span>
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
    <div className="min-h-screen bg-[#0b0f1a] text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        <Header time={time} incidents={incidents} />

        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {showMetrics.map((m) => (
              <MetricCardComponent key={m.label} card={m} />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-lg p-1 w-fit">
              {(['services', 'errors'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-wider transition-all ${
                    activeTab === tab ? 'bg-slate-700 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab}
                  {tab === 'errors' && (
                    <span className="ml-1.5 bg-red-500/20 text-red-400 rounded px-1 py-px text-[9px]">
                      {errors.filter((e) => e.severity === 'error').length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'services' ? <ServicesTable services={services} /> : <ErrorLog events={errors} />}
          </div>

          <div className="flex flex-col gap-4">
            <WsPanel snap={wsSnap} />
            <UptimeSummary bars={uptimeBars} />
          </div>
        </div>

        <footer className="flex items-center justify-between pt-2 border-t border-slate-800/60">
          <span className="text-[10px] font-mono text-slate-600">Chronos · Hospital Clock-in &amp; HR Platform</span>
          <span className="text-[10px] font-mono text-slate-600">af-south-1 · auto-refresh every 3 s</span>
        </footer>
      </div>
    </div>
  );
}