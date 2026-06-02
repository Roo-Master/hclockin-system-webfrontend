import { Injectable } from '@nestjs/common';
import { Attendance } from '../entities/attendance.entity';
import { WORK_HOURS } from '../constants/attendance.constants';

@Injectable()
export class OvertimeCalculator {
  constructor() {}

  calculateOvertimeHours(checkIn: Date, checkOut: Date): number {
    if (!checkIn || !checkOut) return 0;
    
    const workHours = this.calculateWorkHours(checkIn, checkOut);
    return Math.max(0, workHours - WORK_HOURS.OVERTIME_THRESHOLD);
  }

  private calculateWorkHours(checkIn: Date, checkOut: Date): number {
    const diffMs = checkOut.getTime() - checkIn.getTime();
    let workHours = diffMs / (1000 * 60 * 60);
    
    // Subtract 1 hour for lunch if worked more than 6 hours
    if (workHours > 6) {
      workHours -= 1;
    }
    
    return workHours;
  }

  calculateWeeklyOvertime(attendances: Attendance[]): number {
    return attendances.reduce((total, attendance) => 
      total + attendance.overtimeHours, 0
    );
  }

  calculateMonthlyOvertime(attendances: Attendance[]): number {
    return this.calculateWeeklyOvertime(attendances);
  }

  calculateOvertimePay(overtimeHours: number, hourlyRate: number, multiplier: number = 1.5): number {
    return overtimeHours * hourlyRate * multiplier;
  }

  categorizeOvertime(overtimeHours: number): 'normal' | 'excessive' | 'critical' {
    if (overtimeHours <= 10) return 'normal';
    if (overtimeHours <= 20) return 'excessive';
    return 'critical';
  }

  generateOvertimeReport(attendances: Attendance[]): any {
    const report = {
      totalOvertime: 0,
      averageDailyOvertime: 0,
      peakOvertimeDay: null as Date | null,
      peakOvertimeHours: 0,
      overtimeTrend: 'stable',
      weeklyBreakdown: [] as any[],
    };

    for (const attendance of attendances) {
      report.totalOvertime += attendance.overtimeHours;
      
      if (attendance.overtimeHours > report.peakOvertimeHours) {
        report.peakOvertimeHours = attendance.overtimeHours;
        report.peakOvertimeDay = attendance.date;
      }
    }

    report.averageDailyOvertime = report.totalOvertime / attendances.length;
    
    if (report.totalOvertime > 50) report.overtimeTrend = 'increasing';
    if (report.totalOvertime < 10) report.overtimeTrend = 'decreasing';
    
    return report;
  }
}