import { Injectable } from '@nestjs/common';

@Injectable()
export class TimeUtils {
  parseTimeString(timeString: string): Date {
    const [hours, minutes, seconds] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || '0'));
    return date;
  }

  formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0];
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getDateRange(month: number, year: number): { start: Date; end: Date } {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return { start, end };
  }

  isWeekend(date: Date, weekendDays: string[] = ['saturday', 'sunday']): boolean {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return weekendDays.includes(dayName);
  }

  isHoliday(date: Date, holidays: string[]): boolean {
    const dateString = this.formatDate(date);
    return holidays.includes(dateString);
  }

  getWorkingDays(startDate: Date, endDate: Date, weekendDays: string[]): number {
    let workingDays = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (!this.isWeekend(current, weekendDays)) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return workingDays;
  }

  getTimeDifference(start: Date, end: Date): { hours: number; minutes: number; seconds: number } {
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  }

  addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  isWithinTimeRange(time: Date, start: string, end: string): boolean {
    const timeValue = time.getHours() * 60 + time.getMinutes();
    const startValue = this.timeToMinutes(start);
    const endValue = this.timeToMinutes(end);
    
    return timeValue >= startValue && timeValue <= endValue;
  }

  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  }
}