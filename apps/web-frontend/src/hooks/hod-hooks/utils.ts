export const todayStr = () => new Date().toISOString().split('T')[0];

export const monthStartStr = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
};

export const fmtDateShort = (d: string) =>
  new Date(d).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });

export const fmtDateShortWithWeekday = (d: string) =>
  new Date(d).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });

export const fmtDateLong = (d: string) =>
  new Date(d).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export const fmtTimeShort = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const fmtTimeLong = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
};

export const daysBetween = (start: string, end: string) => {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
};

export function weekDates(offset = 0): Date[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export const fmtRosterDate = (d: Date) => d.toISOString().split('T')[0];
export const dayLabel = (d: Date) => d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric' });
