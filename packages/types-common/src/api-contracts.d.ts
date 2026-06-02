export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    HOSPITAL_ADMIN = "HOSPITAL_ADMIN",
    DEPT_HEAD = "DEPT_HEAD",
    EMPLOYEE = "EMPLOYEE"
}
export declare enum ClockAction {
    IN = "IN",
    OUT = "OUT",
    UNKNOWN = "UNKNOWN"
}
export declare enum ShiftStatus {
    PRESENT = "PRESENT",
    ABSENT = "ABSENT",
    LATE = "LATE",
    LEAVE = "LEAVE",
    GHOST_SESSION = "GHOST_SESSION"
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
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    tenantId: string;
    deptId: string | null;
}
export interface AuthLoginRequestDTO {
    email: string;
    password: string;
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
    code: string;
}
export interface DepartmentResponseDTO {
    id: string;
    name: string;
    code: string;
    tenantId: string;
    memberCount: number;
}
export interface ShiftScheduleCreateDTO {
    userId: string;
    tenantId: string;
    deptId: string;
    startTime: string;
    endTime: string;
    gracePeriodMinutes: number;
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
export interface BiometricLogIngestionDTO {
    tenantId: string;
    deviceId: string;
    biometricUserId: string;
    timestamp: string;
}
export interface IngestionResultDTO {
    success: boolean;
    logId: string;
    userId: string;
    tenantId: string;
    actionDetected: ClockAction;
    isDeduplicated: boolean;
    processedAt: string;
}
export interface AttendanceCorrectionDTO {
    logId: string;
    correctedAction: ClockAction;
    reasonForChange: string;
    adminUserId: string;
}
export interface PayrollQueryDTO {
    tenantId: string;
    userId: string;
    startDate: string;
    endDate: string;
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
