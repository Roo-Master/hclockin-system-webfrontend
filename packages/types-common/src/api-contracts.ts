/**
 * HOSPITAL CHRONOS SYSTEM - GLOBAL API CONTRACT LAYER
 * Location: packages/types-common/src/api-contracts.ts
 * * Strict Source of Truth for NestJS Backend and Next.js Frontend.
 * FIXED: Aligned enums perfectly with PostgreSQL DB states and secured auth inputs.
 */

// ==========================================
// 1. CORE SYSTEM ENUMS & TYPES
// ==========================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
  DEPT_HEAD = 'DEPT_HEAD', // FIXED: Aligned with DB schema token
  EMPLOYEE = 'EMPLOYEE'   // FIXED: Aligned with DB schema token
}

export enum ClockAction {
  IN = 'IN',
  OUT = 'OUT',
  UNKNOWN = 'UNKNOWN'
}

export enum ShiftStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  LEAVE = 'LEAVE',
  GHOST_SESSION = 'GHOST_SESSION' // Automatically flagged >14 hour unclosed shifts
}

export interface ApiResponsePaginated<T> {
  success: boolean;
  data: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

// ==========================================
// 2. AUTH & IDENTITY DOMAIN
// ==========================================

export interface JwtPayload {
  sub: string;         // User ID
  email: string;
  role: UserRole;
  tenantId: string;    // Crucial for multi-tenant isolation rows
  deptId: string | null;
}

export interface AuthLoginRequestDTO {
  email: string;
  password: string; // FIXED: Changed from passwordHash to raw text over HTTPS
}

export interface AuthResponseDTO {
  success: boolean;
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string;
  };
}

// ==========================================
// 3. TENANT & DEPARTMENT DOMAIN
// ==========================================

export interface TenantCreateDTO {
  name: string;
  subdomain: string;
  licenseKey: string;
}

export interface TenantResponseDTO {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  createdAt: string;
}

export interface DepartmentCreateDTO {
  name: string;
  tenantId: string;
  code: string; // e.g., "ICU", "OPD"
}

export interface DepartmentResponseDTO {
  id: string;
  name: string;
  code: string;
  tenantId: string;
  memberCount: number;
}

// ==========================================
// 4. ROSTER & SCHEDULING DOMAIN
// ==========================================

export interface ShiftScheduleCreateDTO {
  userId: string;
  tenantId: string;
  deptId: string;
  startTime: string; // ISO8601 representation (e.g. 2026-05-21T06:00:00Z)
  endTime: string;   // ISO8601 representation
  gracePeriodMinutes: number; // Late calculation padding
}

export interface ShiftScheduleResponseDTO {
  id: string;
  userId: string;
  tenantId: string;
  deptId: string;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
  isOvernight: boolean;
}

// ==========================================
// 5. BIOMETRIC & ATTENDANCE TELEMETRY DOMAIN
// ==========================================

/**
 * Payload sent directly from Go edge-gateway-service 
 * or processed via NestJS proxy ingestion.
 */
export interface BiometricLogIngestionDTO {
  tenantId: string;        // FIXED: Absolute requirement for early tenant context routing
  deviceId: string;
  biometricUserId: string; // Pin mapping identifier from hardware device memory
  timestamp: string;       // Exact ISO8601 punch instant clock recorded
}

export interface IngestionResultDTO {
  success: boolean;
  logId: string;
  userId: string;
  tenantId: string;
  actionDetected: ClockAction;
  isDeduplicated: boolean; // True if within the 2-minute double-punch suppression window
  processedAt: string;
}

export interface AttendanceCorrectionDTO {
  logId: string;
  correctedAction: ClockAction;
  reasonForChange: string; // Enforces a strict audit log trail
  adminUserId: string;
}

// ==========================================
// 6. PAYROLL & METRICS ACCUMULATOR DOMAIN
// ==========================================

export interface PayrollQueryDTO {
  tenantId: string;
  userId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface EmployeePayrollSummaryDTO {
  userId: string;
  employeeName: string;
  totalRegularHoursWorked: number;
  totalOvertimeHoursWorked: number;
  totalMinutesLate: number;
  daysPresentCount: number;
  ghostSessionsCount: number;
  computedPeriodRange: {
    start: string;
    end: string;
  };
}