import api from './api';

// Define response types
export interface DashboardStatsResponse {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveToday: number;
  absentToday: number;
  overtimeHours: number;
  payrollTotal: number;
  attendanceRate: number;
  workingDays: number;
  avgWorkHours: string;
  leaveApproved: number;
  leavePending: number;
  leaveRejected: number;
  leaveCancelled: number;
  complianceDocs: number;
  complianceTraining: number;
  compliancePolicy: number;
  complianceLicenses: number;
  complianceBackground: number;
}

export interface DepartmentBreakdown {
  name: string;
  count: number;
}

export interface AttendanceTrendPoint {
  date: string;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface Birthday {
  id: string;
  name: string;
  role: string;
  date: string;
}

export interface DashboardFullResponse {
  stats: DashboardStatsResponse;
  departmentBreakdown: DepartmentBreakdown[];
  attendanceTrend: AttendanceTrendPoint[];
  notifications: Notification[];
  upcomingBirthdays: Birthday[];
}

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardFullResponse> => {
    try {
      const response = await api.get<DashboardFullResponse>('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Return empty structure - no mock data
      return {
        stats: {} as DashboardStatsResponse,
        departmentBreakdown: [],
        attendanceTrend: [],
        notifications: [],
        upcomingBirthdays: [],
      };
    }
  },
};
