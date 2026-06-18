import api from './api';

export interface ShiftSchedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  daysOfWeek: number[];
  departmentId?: string;
  departmentName?: string;
  status: 'active' | 'inactive';
}

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  employeeName?: string;
  shiftScheduleId: string;
  shiftName?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface ShiftRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  currentShiftId: string;
  currentShiftName?: string;
  requestedShiftId: string;
  requestedShiftName?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export const shiftService = {
  // Shift Assignments
  getShiftAssignments: async (params?: { employeeId?: string; shiftScheduleId?: string; status?: string }) => {
    try {
      const response = await api.get('/shifts/assignments', { params });
      // Return in the format expected by useQuery: { data: { data: T } }
      return { data: { data: response.data || [] } };
    } catch (error) {
      console.error('Failed to fetch shift assignments:', error);
      return { data: { data: [] } };
    }
  },

  getShiftAssignment: async (id: string) => {
    try {
      const response = await api.get(`/shifts/assignments/${id}`);
      return { data: { data: response.data } };
    } catch (error) {
      console.error('Failed to fetch shift assignment:', error);
      return { data: { data: null } };
    }
  },

  createShiftAssignment: async (data: Partial<ShiftAssignment>) => {
    try {
      const response = await api.post('/shifts/assignments', data);
      return { data: { data: response.data } };
    } catch (error) {
      console.error('Failed to create shift assignment:', error);
      throw error;
    }
  },

  updateShiftAssignment: async (id: string, data: Partial<ShiftAssignment>) => {
    try {
      const response = await api.put(`/shifts/assignments/${id}`, data);
      return { data: { data: response.data } };
    } catch (error) {
      console.error('Failed to update shift assignment:', error);
      throw error;
    }
  },

  deleteShiftAssignment: async (id: string) => {
    try {
      await api.delete(`/shifts/assignments/${id}`);
      return { data: { data: null } };
    } catch (error) {
      console.error('Failed to delete shift assignment:', error);
      throw error;
    }
  },

  // Shift Schedules
  getShiftSchedules: async (params?: { departmentId?: string; status?: string }) => {
    try {
      const response = await api.get('/shifts/schedules', { params });
      return { data: { data: response.data || [] } };
    } catch (error) {
      console.error('Failed to fetch shift schedules:', error);
      return { data: { data: [] } };
    }
  },

  getShiftSchedule: async (id: string) => {
    try {
      const response = await api.get(`/shifts/schedules/${id}`);
      return { data: { data: response.data } };
    } catch (error) {
      console.error('Failed to fetch shift schedule:', error);
      return { data: { data: null } };
    }
  },

  createShiftSchedule: async (data: Partial<ShiftSchedule>) => {
    try {
      const response = await api.post('/shifts/schedules', data);
      return { data: { data: response.data } };
    } catch (error) {
      console.error('Failed to create shift schedule:', error);
      throw error;
    }
  },

  updateShiftSchedule: async (id: string, data: Partial<ShiftSchedule>) => {
    try {
      const response = await api.put(`/shifts/schedules/${id}`, data);
      return { data: { data: response.data } };
    } catch (error) {
      console.error('Failed to update shift schedule:', error);
      throw error;
    }
  },

  deleteShiftSchedule: async (id: string) => {
    try {
      await api.delete(`/shifts/schedules/${id}`);
      return { data: { data: null } };
    } catch (error) {
      console.error('Failed to delete shift schedule:', error);
      throw error;
    }
  },

  // Shift Requests
  getShiftRequests: async (params?: { status?: string; employeeId?: string }) => {
    try {
      const response = await api.get('/shifts/requests', { params });
      return { data: { data: response.data || [] } };
    } catch (error) {
      console.error('Failed to fetch shift requests:', error);
      return { data: { data: [] } };
    }
  },

  getShiftRequest: async (id: string) => {
    try {
      const response = await api.get(`/shifts/requests/${id}`);
      return { data: { data: response.data } };
    } catch (error) {
      console.error('Failed to fetch shift request:', error);
      return { data: { data: null } };
    }
  },

  createShiftRequest: async (data: Partial<ShiftRequest>) => {
    try {
      const response = await api.post('/shifts/requests', data);
      return { data: { data: response.data } };
    } catch (error) {
      console.error('Failed to create shift request:', error);
      throw error;
    }
  },

  updateShiftRequest: async (id: string, data: Partial<ShiftRequest>) => {
    try {
      const response = await api.put(`/shifts/requests/${id}`, data);
      return { data: { data: response.data } };
    } catch (error) {
      console.error('Failed to update shift request:', error);
      throw error;
    }
  },

  deleteShiftRequest: async (id: string) => {
    try {
      await api.delete(`/shifts/requests/${id}`);
      return { data: { data: null } };
    } catch (error) {
      console.error('Failed to delete shift request:', error);
      throw error;
    }
  },

  approveShiftRequest: async (id: string, comments?: string) => {
    try {
      const response = await api.put(`/shifts/requests/${id}/approve`, { comments });
      return { data: { data: response.data } };
    } catch (error) {
      console.error('Failed to approve shift request:', error);
      throw error;
    }
  },

  rejectShiftRequest: async (id: string, comments?: string) => {
    try {
      const response = await api.put(`/shifts/requests/${id}/reject`, { comments });
      return { data: { data: response.data } };
    } catch (error) {
      console.error('Failed to reject shift request:', error);
      throw error;
    }
  }
};
