export interface IAttendance {
    id: string;
    userId: string;
    date: Date;
    checkIn?: Date;
    checkOut?: Date;
    status: string;
    totalWorkHours: number;
    overtimeHours: number;
    lateMinutes: number;
    earlyDepartureMinutes: number;
    leaveType?: string;
    checkInLocation?: string;
    checkOutLocation?: string;
    deviceInfo?: object;
    notes?: string;
    approvedBy?: string;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface IAttendanceSummary {
    userId: string;
    period: string;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalHalfDay: number;
    totalLeave: number;
    totalWorkHours: number;
    totalOvertime: number;
    attendanceRate: number;
  }
  
  export interface IAttendanceRule {
    ruleName: string;
    workStartTime: string;
    workEndTime: string;
    lateThresholdMinutes: number;
    halfDayThresholdHours: number;
    minWorkHours: number;
    maxWorkHours: number;
    allowedLateCountPerMonth: number;
    allowedHalfDaysPerMonth: number;
    weekendDays: string[];
    holidays: string[];
  }
  
  export interface ICheckInData {
    userId: string;
    timestamp: Date;
    location?: string;
    deviceInfo?: string;
    ipAddress?: string;
    latitude?: number;
    longitude?: number;
  }
  
  export interface ICheckOutData {
    userId: string;
    timestamp: Date;
    location?: string;
    deviceInfo?: string;
    ipAddress?: string;
    latitude?: number;
    longitude?: number;
  }
  
  export interface IAttendanceReport {
    period: string;
    totalEmployees: number;
    averageAttendance: number;
    totalWorkHours: number;
    totalOvertime: number;
    lateFrequency: number;
    leaveUtilization: number;
    topPerformers: IAttendanceSummary[];
    departmentWise: Map<string, IAttendanceSummary>;
  }