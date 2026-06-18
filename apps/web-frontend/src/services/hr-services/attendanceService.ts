import api from './api';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  departmentName?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  hoursWorked?: number;
}

export interface AttendanceCorrection {
  id: string;
  attendanceId: string;
  employeeId: string;
  employeeName?: string;
  reason: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface OvertimeRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  hours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
}

export interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  attendanceRate: number;
}

export const attendanceService = {
  // Get today's attendance
  getTodayAttendance: async () => {
    try {
      const response = await api.get('/attendance/today');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch today\'s attendance:', error);
      return [];
    }
  },

  // Get attendance by date range
  getAttendanceByDate: async (startDate: string, endDate: string) => {
    try {
      const response = await api.get('/attendance', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      return [];
    }
  },

  // Check in
  checkIn: async () => {
    try {
      const response = await api.post('/attendance/check-in');
      return response.data;
    } catch (error) {
      console.error('Failed to check in:', error);
      throw error;
    }
  },

  // Check out
  checkOut: async () => {
    try {
      const response = await api.post('/attendance/check-out');
      return response.data;
    } catch (error) {
      console.error('Failed to check out:', error);
      throw error;
    }
  },

  // Get attendance stats
  getAttendanceStats: async () => {
    try {
      const response = await api.get('/attendance/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch attendance stats:', error);
      return null;
    }
  },

  // Get attendance trend
  getAttendanceTrend: async (days: number = 7) => {
    try {
      const response = await api.get('/attendance/trend', { params: { days } });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch attendance trend:', error);
      return [];
    }
  },

  // Delete attendance record
  deleteAttendanceRecord: async (id: string) => {
    try {
      await api.delete(`/attendance/${id}`);
    } catch (error) {
      console.error('Failed to delete attendance record:', error);
      throw error;
    }
  },

  // Get attendance corrections
  getAttendanceCorrections: async () => {
    try {
      const response = await api.get('/attendance/corrections');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch corrections:', error);
      return [];
    }
  },

  // Review attendance correction
  reviewAttendanceCorrection: async (id: string, status: 'approved' | 'rejected', comments?: string) => {
    try {
      const response = await api.put(`/attendance/corrections/${id}`, { status, comments });
      return response.data;
    } catch (error) {
      console.error('Failed to review correction:', error);
      throw error;
    }
  },

  // Get overtime records
  getOvertimeRecords: async () => {
    try {
      const response = await api.get('/attendance/overtime');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch overtime records:', error);
      return [];
    }
  },

  // Approve overtime
  approveOvertime: async (id: string) => {
    try {
      const response = await api.put(`/attendance/overtime/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Failed to approve overtime:', error);
      throw error;
    }
  },

  // Reject overtime
  rejectOvertime: async (id: string) => {
    try {
      const response = await api.put(`/attendance/overtime/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error('Failed to reject overtime:', error);
      throw error;
    }
  },

  // Create overtime request
  createOvertime: async (data: Partial<OvertimeRecord>) => {
    try {
      const response = await api.post('/attendance/overtime', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create overtime request:', error);
      throw error;
    }
  }
};
