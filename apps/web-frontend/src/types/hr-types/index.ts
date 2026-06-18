// ─── Shared ───────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  status?: string;
  [key: string]: unknown;
}

export type Status = "active" | "inactive" | "pending" | "approved" | "rejected" | "cancelled";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  statusCode?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
}

// ─── Auth ─────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "hr_admin" | "manager" | "employee";
  avatar?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// ─── Employees ────────────────────────────────────────────────
export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  departmentName?: string;
  jobTitle: string;
  status: "active" | "inactive" | "on_leave";
  hireDate: string;
  avatar?: string;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  jobTitle: string;
  hireDate: string;
  salary?: number;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string;
  managerName?: string;
  employeeCount: number;
}

export interface Contract {
  id: string;
  employeeId: string;
  employeeName?: string;
  type: "permanent" | "contract" | "part_time" | "intern";
  startDate: string;
  endDate?: string;
  salary: number;
  currency: string;
  status: Status;
}

// ─── Attendance ───────────────────────────────────────────────
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "present" | "absent" | "late" | "half_day" | "on_leave";
  hoursWorked?: number;
}

export interface AttendanceCorrection {
  id: string;
  attendanceId: string;
  employeeId: string;
  reason: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  status: Status;
  submittedAt: string;
}

export interface OvertimeRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  hours: number;
  reason: string;
  status: Status;
  approvedBy?: string;
}

// ─── Leave ────────────────────────────────────────────────────
export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  maxDaysPerYear: number;
  isPaid: boolean;
  description?: string;
}

// ─── Shifts ───────────────────────────────────────────────────
export interface ShiftSchedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  daysOfWeek: number[];
  departmentId?: string;
}

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  employeeName?: string;
  shiftScheduleId: string;
  shiftName?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: Status;
}

export interface ShiftRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  currentShiftId: string;
  requestedShiftId: string;
  reason: string;
  status: Status;
  requestedAt: string;
}

// ─── Payroll ──────────────────────────────────────────────────
export interface PayrollRun {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  status: "draft" | "processing" | "completed" | "approved" | "paid";
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  generatedAt?: string;
  processedAt?: string;
  approvedAt?: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName?: string;
  period: string;
  basicSalary: number;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  generatedAt: string;
  status: "draft" | "approved" | "paid";
}

export interface Allowance {
  id: string;
  name: string;
  type: "fixed" | "percentage";
  value: number;
  taxable: boolean;
}

export interface Deduction {
  id: string;
  name: string;
  type: "fixed" | "percentage";
  value: number;
  mandatory: boolean;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  bracketMin?: number;
  bracketMax?: number;
  description?: string;
}

// ─── Dashboard ────────────────────────────────────────────────
export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  pendingLeaveRequests: number;
  pendingShiftRequests: number;
  overtimeHoursThisMonth: number;
  payrollProcessedThisMonth: boolean;
  departmentBreakdown: { name: string; count: number }[];
  attendanceTrend: { date: string; present: number; absent: number }[];
  recentLeaveRequests: LeaveRequest[];
}

export interface DashboardActivity {
  id: string;
  type: "leave_request" | "shift_change" | "attendance_correction" | "overtime_request" | "new_employee" | "payroll_processed";
  description: string;
  timestamp: string;
  user?: string;
  metadata?: Record<string, unknown>;
}

export interface AttendanceTrendPoint {
  date: string;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

export interface DepartmentHeadcount {
  departmentId: string;
  departmentName: string;
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  percentageOfTotal: number;
}

// ─── Reports ──────────────────────────────────────────────────
export interface ReportFilter {
  startDate: string;
  endDate: string;
  departmentId?: string;
  employeeId?: string;
  status?: string;
  type?: string;
}

export interface AttendanceReportRow {
  employeeId: string;
  employeeName: string;
  department: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  onLeaveDays: number;
  attendanceRate: number;
}

export interface LeaveReportRow {
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: string;
  totalDaysTaken: number;
  remainingDays: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
}

export interface PayrollReportRow {
  employeeId: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  tax: number;
  netPay: number;
  paymentDate: string;
}

export interface WorkforceMetric {
  metric: string;
  value: number;
  change?: number;
  changePercentage?: number;
  period: string;
}

// ─── Settings ─────────────────────────────────────────────────
export interface AppSettings {
  id: string;
  companyName: string;
  companyLogo?: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  workWeekStart: number;
  workHoursPerDay: number;
  workDaysPerWeek: number;
  overtimeRate: number;
  holidayRate: number;
  payrollDay: number;
  notificationEmail?: string;
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  leaveSettings: {
    carryOverDays: number;
    maxAccumulation: number;
    approvalRequired: boolean;
  };
  attendanceSettings: {
    gracePeriodMinutes: number;
    autoClockOut: boolean;
    requireReasonForLate: boolean;
  };
  updatedAt: string;
  updatedBy: string;
}