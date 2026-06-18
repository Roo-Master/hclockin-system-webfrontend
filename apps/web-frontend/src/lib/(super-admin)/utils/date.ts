import { format, formatDistanceToNow, parseISO, differenceInDays, isToday, isYesterday } from 'date-fns';

export const DATE_FORMATS = {
  short: 'MMM dd, yyyy',
  long: 'MMMM dd, yyyy',
  full: 'EEEE, MMMM dd, yyyy',
  time: 'HH:mm',
  fullTime: 'HH:mm:ss',
  dateTime: 'MMM dd, yyyy HH:mm',
} as const;

export type DateFormat = keyof typeof DATE_FORMATS;

export function formatDateString(
  date: string | Date | null | undefined,
  formatString: string = DATE_FORMATS.short
): string {
  if (!date) return '—';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValidDate(dateObj)) return 'Invalid date';
  return format(dateObj, formatString);
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValidDate(dateObj)) return 'Invalid date';
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function getDaysBetween(start: string | Date, end: string | Date): number {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  return differenceInDays(endDate, startDate);
}

export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function isTodayDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj);
}

export function isYesterdayDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isYesterday(dateObj);
}

export function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
}

export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}

export function formatMonthYear(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMMM yyyy');
}

export function getWeekNumber(date: string | Date): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const startOfYear = new Date(dateObj.getFullYear(), 0, 1);
  const diff = dateObj.getTime() - startOfYear.getTime();
  return Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7);
}
