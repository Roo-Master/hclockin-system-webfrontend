import { Injectable } from '@nestjs/common';
import { Attendance } from '../entities/attendance.entity';
import { ATTENDANCE_RULES, ATTENDANCE_STATUS } from '../constants/attendance.constants';

@Injectable()
export class LateChecker {
  constructor() {}

  checkIfLate(checkInTime: Date, expectedStartTime: string): boolean {
    const expected = new Date();
    const [hours, minutes] = expectedStartTime.split(':');
    expected.setHours(parseInt(hours), parseInt(minutes), 0);
    
    return checkInTime > expected;
  }

  getLateMinutes(checkInTime: Date, expectedStartTime: string): number {
    if (!this.checkIfLate(checkInTime, expectedStartTime)) return 0;
    
    const expected = new Date();
    const [hours, minutes] = expectedStartTime.split(':');
    expected.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const diffMs = checkInTime.getTime() - expected.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  async checkLateLimit(userId: string, month: number, year: number): Promise<boolean> {
    // This would typically query the database for late records in the month
    const lateCount = await this.getLateCountForMonth(userId, month, year);
    return lateCount >= ATTENDANCE_RULES.ALLOWED_LATE_COUNT_PER_MONTH;
  }

  private async getLateCountForMonth(userId: string, month: number, year: number): Promise<number> {
    // Implementation would query attendance records for the month
    // For now returning mock value
    return 2;
  }

  getGracePeriodEndTime(expectedStartTime: string, graceMinutes: number = 15): Date {
    const [hours, minutes] = expectedStartTime.split(':');
    const graceEnd = new Date();
    graceEnd.setHours(parseInt(hours), parseInt(minutes) + graceMinutes, 0);
    return graceEnd;
  }

  isWithinGracePeriod(checkInTime: Date, expectedStartTime: string): boolean {
    const graceEnd = this.getGracePeriodEndTime(expectedStartTime);
    return checkInTime <= graceEnd;
  }

  generateLateWarning(lateMinutes: number): string {
    if (lateMinutes <= 15) {
      return 'You are slightly late. Please try to be on time.';
    } else if (lateMinutes <= 30) {
      return 'You are significantly late. This will be marked in your attendance record.';
    } else {
      return 'You are very late. Please provide a reason for being late.';
    }
  }
}