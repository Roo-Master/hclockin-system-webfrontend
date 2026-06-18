import client from "./client";
import { ENDPOINTS } from "./Config";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  AuthUser,
  LoginPayload,
  AuthTokens,
  Employee,
  EmployeeFormData,
  Department,
  Contract,
  AttendanceRecord,
  AttendanceCorrection,
  OvertimeRecord,
  LeaveRequest,
  LeaveType,
  ShiftSchedule,
  ShiftAssignment,
  ShiftRequest,
  PayrollRun,
  Payslip,
  Allowance,
  Deduction,
  Tax,
  DashboardStats,
  DashboardActivity,
  AttendanceTrendPoint,
  DepartmentHeadcount,
  ReportFilter,
  AttendanceReportRow,
  LeaveReportRow,
  PayrollReportRow,
  WorkforceMetric,
  AppSettings,
} from "../../types/hr-types";

import axiosInstance from "./axiosinstance";


// ─── Dashboard ────────────────────────────────────────────────
export const getDashboardStats = () =>
  axiosInstance.get<DashboardStats>("/dashboard/stats").then((r) => r.data);


// ─── AUTH ───────────────────────────────────────────────────────
export const authService = {
  login: (payload: LoginPayload) =>
    client.post<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>>(
      ENDPOINTS.LOGIN,
      payload,
    ),
  logout: () => client.post<ApiResponse<null>>(ENDPOINTS.LOGOUT),
  me: () => client.get<ApiResponse<AuthUser>>(ENDPOINTS.ME),
  refresh: (refresh_token: string) =>
    client.post<ApiResponse<AuthTokens>>(ENDPOINTS.REFRESH_TOKEN, {
      refresh_token,
    }),
};

// ─── EMPLOYEES ──────────────────────────────────────────────────
export const employeeService = {
  getAll: (params?: PaginationParams) =>
    client.get<PaginatedResponse<Employee>>(ENDPOINTS.EMPLOYEES, { params }),

  getById: (id: string) =>
    client.get<ApiResponse<Employee>>(ENDPOINTS.EMPLOYEE(id)),

  create: (data: EmployeeFormData) =>
    client.post<ApiResponse<Employee>>(ENDPOINTS.EMPLOYEES, data),

  update: (id: string, data: Partial<EmployeeFormData>) =>
    client.put<ApiResponse<Employee>>(ENDPOINTS.EMPLOYEE(id), data),

  delete: (id: string) =>
    client.delete<ApiResponse<null>>(ENDPOINTS.EMPLOYEE(id)),
};

// ─── DEPARTMENTS ────────────────────────────────────────────────
export const departmentService = {
  getAll: () =>
    client.get<ApiResponse<Department[]>>(ENDPOINTS.DEPARTMENTS),

  create: (data: Omit<Department, "id" | "manager" | "employee_count">) =>
    client.post<ApiResponse<Department>>(ENDPOINTS.DEPARTMENTS, data),

  update: (id: string, data: Partial<Department>) =>
    client.put<ApiResponse<Department>>(ENDPOINTS.DEPARTMENT(id), data),

  delete: (id: string) =>
    client.delete<ApiResponse<null>>(ENDPOINTS.DEPARTMENT(id)),
};

// ─── CONTRACTS ──────────────────────────────────────────────────
export const contractService = {
  getAll: (params?: PaginationParams) =>
    client.get<PaginatedResponse<Contract>>(ENDPOINTS.CONTRACTS, { params }),

  create: (data: Omit<Contract, "id" | "employee">) =>
    client.post<ApiResponse<Contract>>(ENDPOINTS.CONTRACTS, data),

  update: (id: string, data: Partial<Contract>) =>
    client.put<ApiResponse<Contract>>(ENDPOINTS.CONTRACT(id), data),
};

// ─── ATTENDANCE ─────────────────────────────────────────────────
export const attendanceService = {
  getDaily: (date: string) =>
    client.get<ApiResponse<AttendanceRecord[]>>(ENDPOINTS.ATTENDANCE_DAILY, {
      params: { date },
    }),

  getRecords: (params?: PaginationParams) =>
    client.get<PaginatedResponse<AttendanceRecord>>(
      ENDPOINTS.ATTENDANCE_RECORDS,
      { params },
    ),

  markAttendance: (data: Omit<AttendanceRecord, "id" | "employee">) =>
    client.post<ApiResponse<AttendanceRecord>>(
      ENDPOINTS.ATTENDANCE_DAILY,
      data,
    ),

  getCorrections: (params?: PaginationParams) =>
    client.get<PaginatedResponse<AttendanceCorrection>>(
      ENDPOINTS.ATTENDANCE_CORRECTIONS,
      { params },
    ),

  submitCorrection: (
    data: Omit<AttendanceCorrection, "id" | "employee" | "status" | "reviewed_by" | "review_notes" | "created_at">,
  ) =>
    client.post<ApiResponse<AttendanceCorrection>>(
      ENDPOINTS.ATTENDANCE_CORRECTIONS,
      data,
    ),

  approveCorrection: (id: string) =>
    client.patch<ApiResponse<AttendanceCorrection>>(
      `${ENDPOINTS.ATTENDANCE_CORRECTION(id)}/approve`,
    ),

  rejectCorrection: (id: string, review_notes: string) =>
    client.patch<ApiResponse<AttendanceCorrection>>(
      `${ENDPOINTS.ATTENDANCE_CORRECTION(id)}/reject`,
      { review_notes },
    ),

  getOvertime: (params?: PaginationParams) =>
    client.get<PaginatedResponse<OvertimeRecord>>(ENDPOINTS.OVERTIME, {
      params,
    }),

  submitOvertime: (
    data: Omit<OvertimeRecord, "id" | "employee" | "status" | "approved_by" | "created_at">,
  ) => client.post<ApiResponse<OvertimeRecord>>(ENDPOINTS.OVERTIME, data),

  approveOvertime: (id: string) =>
    client.patch<ApiResponse<OvertimeRecord>>(
      `${ENDPOINTS.OVERTIME_ITEM(id)}/approve`,
    ),

  rejectOvertime: (id: string) =>
    client.patch<ApiResponse<OvertimeRecord>>(
      `${ENDPOINTS.OVERTIME_ITEM(id)}/reject`,
    ),
};

// ─── LEAVE ──────────────────────────────────────────────────────
export const leaveService = {
  getRequests: (params?: PaginationParams) =>
    client.get<PaginatedResponse<LeaveRequest>>(ENDPOINTS.LEAVE_REQUESTS, {
      params,
    }),

  createRequest: (
    data: Omit<LeaveRequest, "id" | "employee" | "leave_type" | "status" | "reviewed_by" | "review_notes" | "created_at">,
  ) => client.post<ApiResponse<LeaveRequest>>(ENDPOINTS.LEAVE_REQUESTS, data),

  approveRequest: (id: string) =>
    client.patch<ApiResponse<LeaveRequest>>(
      `${ENDPOINTS.LEAVE_REQUEST(id)}/approve`,
    ),

  rejectRequest: (id: string, review_notes: string) =>
    client.patch<ApiResponse<LeaveRequest>>(
      `${ENDPOINTS.LEAVE_REQUEST(id)}/reject`,
      { review_notes },
    ),

  cancelRequest: (id: string) =>
    client.patch<ApiResponse<LeaveRequest>>(
      `${ENDPOINTS.LEAVE_REQUEST(id)}/cancel`,
    ),

  getTypes: () =>
    client.get<ApiResponse<LeaveType[]>>(ENDPOINTS.LEAVE_TYPES),

  createType: (data: Omit<LeaveType, "id">) =>
    client.post<ApiResponse<LeaveType>>(ENDPOINTS.LEAVE_TYPES, data),

  updateType: (id: string, data: Partial<LeaveType>) =>
    client.put<ApiResponse<LeaveType>>(ENDPOINTS.LEAVE_TYPE(id), data),

  deleteType: (id: string) =>
    client.delete<ApiResponse<null>>(ENDPOINTS.LEAVE_TYPE(id)),
};

// ─── SHIFTS ─────────────────────────────────────────────────────
export const shiftService = {
  getSchedules: () =>
    client.get<ApiResponse<ShiftSchedule[]>>(ENDPOINTS.SHIFT_SCHEDULES),

  createSchedule: (data: Omit<ShiftSchedule, "id">) =>
    client.post<ApiResponse<ShiftSchedule>>(ENDPOINTS.SHIFT_SCHEDULES, data),

  updateSchedule: (id: string, data: Partial<ShiftSchedule>) =>
    client.put<ApiResponse<ShiftSchedule>>(ENDPOINTS.SHIFT_SCHEDULE(id), data),

  deleteSchedule: (id: string) =>
    client.delete<ApiResponse<null>>(ENDPOINTS.SHIFT_SCHEDULE(id)),

  getAssignments: (params?: PaginationParams) =>
    client.get<PaginatedResponse<ShiftAssignment>>(
      ENDPOINTS.SHIFT_ASSIGNMENTS,
      { params },
    ),

  assignShift: (
    data: Omit<ShiftAssignment, "id" | "employee" | "shift">,
  ) =>
    client.post<ApiResponse<ShiftAssignment>>(
      ENDPOINTS.SHIFT_ASSIGNMENTS,
      data,
    ),

  updateAssignment: (id: string, data: Partial<ShiftAssignment>) =>
    client.put<ApiResponse<ShiftAssignment>>(
      ENDPOINTS.SHIFT_ASSIGNMENT(id),
      data,
    ),

  getRequests: (params?: PaginationParams) =>
    client.get<PaginatedResponse<ShiftRequest>>(ENDPOINTS.SHIFT_REQUESTS, {
      params,
    }),

  createRequest: (
    data: Omit<ShiftRequest, "id" | "employee" | "current_shift" | "requested_shift" | "status" | "created_at">,
  ) =>
    client.post<ApiResponse<ShiftRequest>>(ENDPOINTS.SHIFT_REQUESTS, data),

  approveRequest: (id: string) =>
    client.patch<ApiResponse<ShiftRequest>>(
      `${ENDPOINTS.SHIFT_REQUEST(id)}/approve`,
    ),

  rejectRequest: (id: string) =>
    client.patch<ApiResponse<ShiftRequest>>(
      `${ENDPOINTS.SHIFT_REQUEST(id)}/reject`,
    ),
};

// ─── PAYROLL ────────────────────────────────────────────────────
export const payrollService = {
  processPayroll: (data: { period: string; department_id?: string }) =>
    client.post<ApiResponse<PayrollRun>>(ENDPOINTS.PAYROLL_PROCESS, data),

  getRuns: (params?: PaginationParams) =>
    client.get<PaginatedResponse<PayrollRun>>(ENDPOINTS.PAYROLL_RUNS, {
      params,
    }),

  getRunById: (id: string) =>
    client.get<ApiResponse<PayrollRun>>(ENDPOINTS.PAYROLL_RUN(id)),

  getPayslips: (params?: PaginationParams) =>
    client.get<PaginatedResponse<Payslip>>(ENDPOINTS.PAYSLIPS, { params }),

  getPayslipById: (id: string) =>
    client.get<ApiResponse<Payslip>>(ENDPOINTS.PAYSLIP(id)),

  getAllowances: () =>
    client.get<ApiResponse<Allowance[]>>(ENDPOINTS.ALLOWANCES),

  createAllowance: (data: Omit<Allowance, "id">) =>
    client.post<ApiResponse<Allowance>>(ENDPOINTS.ALLOWANCES, data),

  updateAllowance: (id: string, data: Partial<Allowance>) =>
    client.put<ApiResponse<Allowance>>(ENDPOINTS.ALLOWANCE(id), data),

  deleteAllowance: (id: string) =>
    client.delete<ApiResponse<null>>(ENDPOINTS.ALLOWANCE(id)),

  getDeductions: () =>
    client.get<ApiResponse<Deduction[]>>(ENDPOINTS.DEDUCTIONS),

  createDeduction: (data: Omit<Deduction, "id">) =>
    client.post<ApiResponse<Deduction>>(ENDPOINTS.DEDUCTIONS, data),

  updateDeduction: (id: string, data: Partial<Deduction>) =>
    client.put<ApiResponse<Deduction>>(ENDPOINTS.DEDUCTION(id), data),

  deleteDeduction: (id: string) =>
    client.delete<ApiResponse<null>>(ENDPOINTS.DEDUCTION(id)),

  getTaxes: () =>
    client.get<ApiResponse<Tax[]>>(ENDPOINTS.TAXES),

  updateTax: (id: string, data: Partial<Tax>) =>
    client.put<ApiResponse<Tax>>(ENDPOINTS.TAX(id), data),
};

// ─── DASHBOARD ──────────────────────────────────────────────────
export const dashboardService = {
  getStats: () =>
    client.get<ApiResponse<DashboardStats>>(ENDPOINTS.DASHBOARD_STATS),

  getRecentActivity: (limit = 10) =>
    client.get<ApiResponse<DashboardActivity[]>>(
      ENDPOINTS.DASHBOARD_ACTIVITY,
      { params: { limit } },
    ),

  getAttendanceTrend: (months = 6) =>
    client.get<ApiResponse<AttendanceTrendPoint[]>>(
      ENDPOINTS.DASHBOARD_ATTENDANCE_TREND,
      { params: { months } },
    ),

  getDeptHeadcount: () =>
    client.get<ApiResponse<DepartmentHeadcount[]>>(
      ENDPOINTS.DASHBOARD_DEPT_HEADCOUNT,
    ),
};

// ─── REPORTS ────────────────────────────────────────────────────
export const reportService = {
  getAttendanceReport: (filter: ReportFilter) =>
    client.get<ApiResponse<AttendanceReportRow[]>>(
      ENDPOINTS.REPORT_ATTENDANCE,
      { params: filter },
    ),

  getLeaveReport: (filter: ReportFilter) =>
    client.get<ApiResponse<LeaveReportRow[]>>(ENDPOINTS.REPORT_LEAVE, {
      params: filter,
    }),

  getPayrollReport: (filter: ReportFilter) =>
    client.get<ApiResponse<PayrollReportRow[]>>(ENDPOINTS.REPORT_PAYROLL, {
      params: filter,
    }),

  getWorkforceAnalytics: (params?: { department_id?: string }) =>
    client.get<ApiResponse<WorkforceMetric[]>>(ENDPOINTS.REPORT_WORKFORCE, {
      params,
    }),
};

// ─── SETTINGS ───────────────────────────────────────────────────
export const settingsService = {
  get: () =>
    client.get<ApiResponse<AppSettings>>(ENDPOINTS.SETTINGS),

  update: (data: Partial<AppSettings>) =>
    client.put<ApiResponse<AppSettings>>(ENDPOINTS.SETTINGS, data),
};