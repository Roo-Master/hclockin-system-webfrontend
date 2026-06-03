import { Injectable } from '@nestjs/common';
import { Attendance } from '../entities/attendance.entity';
import { WORK_HOURS, ATTENDANCE_STATUS } from '../constants/attendance.constants';
import { TimeUtils } from './time-utils';

@Injectable()
export class AttendanceCalculator {
  constructor(private timeUtils: TimeUtils) {}

  calculateWorkHours(checkIn: Date, checkOut: Date): number {
    if (!checkIn || !checkOut) return 0;
    
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Subtract lunch break (1 hour) if work hours > 6
    const workHours = diffHours > 6 ? diffHours - 1 : diffHours;
    
    return Math.max(0, Math.min(workHours, WORK_HOURS.MAX_WORK_HOURS));
  }

  calculateOvertime(totalWorkHours: number): number {
    return Math.max(0, totalWorkHours - WORK_HOURS.OVERTIME_THRESHOLD);
  }

  calculateLateMinutes(checkIn: Date, expectedStartTime: string): number {
    const expectedStart = this.timeUtils.parseTimeString(expectedStartTime);
    const actualStart = checkIn;
    
    if (actualStart <= expectedStart) return 0;
    
    const diffMs = actualStart.getTime() - expectedStart.getTime();
    const lateMinutes = Math.floor(diffMs / (1000 * 60));
    
    return Math.max(0, lateMinutes);
  }

  calculateEarlyDeparture(checkOut: Date, expectedEndTime: string): number {
    const expectedEnd = this.timeUtils.parseTimeString(expectedEndTime);
    const actualEnd = checkOut;
    
    if (actualEnd >= expectedEnd) return 0;
    
    const diffMs = expectedEnd.getTime() - actualEnd.getTime();
    const earlyMinutes = Math.floor(diffMs / (1000 * 60));
    
    return Math.max(0, earlyMinutes);
  }

  determineStatus(
    checkIn: Date,
    checkOut: Date,
    lateMinutes: number,
    totalWorkHours: number,
    isHoliday: boolean = false,
    isWeekend: boolean = false
  ): string {
    if (isHoliday) return ATTENDANCE_STATUS.HOLIDAY;
    if (isWeekend) return ATTENDANCE_STATUS.WEEKEND;
    if (!checkIn) return ATTENDANCE_STATUS.ABSENT;
    
    if (totalWorkHours < WORK_HOURS.HALF_DAY_THRESHOLD_HOURS) {
      return ATTENDANCE_STATUS.HALF_DAY;
    }
    
    if (lateMinutes > WORK_HOURS.LATE_THRESHOLD_MINUTES) {
      return ATTENDANCE_STATUS.LATE;
    }
    
    return ATTENDANCE_STATUS.PRESENT;
  }

  calculateMonthlySummary(attendances: Attendance[]): any {
    const summary = {
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalHalfDay: 0,
      totalLeave: 0,
      totalWorkHours: 0,
      totalOvertime: 0,
      averageWorkHours: 0,
      mostCommonStatus: '',
    };

    const statusCount: Record<string, number> = {};

    for (const attendance of attendances) {
      summary.totalWorkHours += attendance.totalHours;
      summary.totalOvertime += attendance.overtimeHours;
      
      statusCount[attendance.status] = (statusCount[attendance.status] || 0) + 1;
      
      switch (attendance.status) {
        case ATTENDANCE_STATUS.PRESENT:
          summary.totalPresent++;
          break;
        case ATTENDANCE_STATUS.ABSENT:
          summary.totalAbsent++;
          break;
        case ATTENDANCE_STATUS.LATE:
          summary.totalLate++;
          break;
        case ATTENDANCE_STATUS.HALF_DAY:
          summary.totalHalfDay++;
          break;
        case ATTENDANCE_STATUS.ON_LEAVE:
          summary.totalLeave++;
          break;
      }
    }

    summary.averageWorkHours = summary.totalWorkHours / attendances.length;
    summary.mostCommonStatus = Object.keys(statusCount).reduce((a, b) => 
      statusCount[a] > statusCount[b] ? a : b, ''
    );

    return summary;
  }
}