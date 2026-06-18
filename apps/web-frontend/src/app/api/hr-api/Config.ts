// ─── API CONFIGURATION ─────────────────────────────────────────
// Set these in your .env file:
//   VITE_API_BASE_URL=https://your-backend.com/api/v1
//   VITE_API_KEY=your_api_key_here

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  API_KEY:  import.meta.env.VITE_API_KEY  as string,
  TIMEOUT:  15000,
} as const;

export const ENDPOINTS = {
  // Auth
  LOGIN:         "/auth/login",
  LOGOUT:        "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh",
  ME:            "/auth/me",

  // Employees
  EMPLOYEES:         "/employees",
  EMPLOYEE:          (id: string) => `/employees/${id}`,
  DEPARTMENTS:       "/departments",
  DEPARTMENT:        (id: string) => `/departments/${id}`,
  CONTRACTS:         "/contracts",
  CONTRACT:          (id: string) => `/contracts/${id}`,

  // Attendance
  ATTENDANCE_DAILY:       "/attendance/daily",
  ATTENDANCE_RECORDS:     "/attendance/records",
  ATTENDANCE_CORRECTIONS: "/attendance/corrections",
  ATTENDANCE_CORRECTION:  (id: string) => `/attendance/corrections/${id}`,
  OVERTIME:               "/attendance/overtime",
  OVERTIME_ITEM:          (id: string) => `/attendance/overtime/${id}`,

  // Leave
  LEAVE_REQUESTS: "/leave/requests",
  LEAVE_REQUEST:  (id: string) => `/leave/requests/${id}`,
  LEAVE_TYPES:    "/leave/types",
  LEAVE_TYPE:     (id: string) => `/leave/types/${id}`,

  // Shifts
  SHIFT_SCHEDULES:   "/shifts/schedules",
  SHIFT_SCHEDULE:    (id: string) => `/shifts/schedules/${id}`,
  SHIFT_ASSIGNMENTS: "/shifts/assignments",
  SHIFT_ASSIGNMENT:  (id: string) => `/shifts/assignments/${id}`,
  SHIFT_REQUESTS:    "/shifts/requests",
  SHIFT_REQUEST:     (id: string) => `/shifts/requests/${id}`,

  // Payroll
  PAYROLL_PROCESS: "/payroll/process",
  PAYROLL_RUNS:    "/payroll/runs",
  PAYROLL_RUN:     (id: string) => `/payroll/runs/${id}`,
  PAYSLIPS:        "/payroll/payslips",
  PAYSLIP:         (id: string) => `/payroll/payslips/${id}`,
  ALLOWANCES:      "/payroll/allowances",
  ALLOWANCE:       (id: string) => `/payroll/allowances/${id}`,
  DEDUCTIONS:      "/payroll/deductions",
  DEDUCTION:       (id: string) => `/payroll/deductions/${id}`,
  TAXES:           "/payroll/taxes",
  TAX:             (id: string) => `/payroll/taxes/${id}`,

  // Dashboard
  DASHBOARD_STATS:    "/dashboard/stats",
  DASHBOARD_ACTIVITY: "/dashboard/activity",
  DASHBOARD_ATTENDANCE_TREND:   "/dashboard/attendance-trend",
  DASHBOARD_DEPT_HEADCOUNT:     "/dashboard/department-headcount",

  // Reports
  REPORT_ATTENDANCE:  "/reports/attendance",
  REPORT_LEAVE:       "/reports/leave",
  REPORT_PAYROLL:     "/reports/payroll",
  REPORT_WORKFORCE:   "/reports/workforce",

  // Settings
  SETTINGS: "/settings",
} as const;