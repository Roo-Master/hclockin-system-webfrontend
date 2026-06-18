import api from './api';

export const leaveService = {
  // Dashboard stats
  getLeaveStats: async () => {
    try {
      const response = await api.get('/leave/stats');
      return response.data || { totalRequests: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0, onLeave: 0, totalDays: 0 };
    } catch (error) {
      console.error('Failed to fetch leave stats:', error);
      return { totalRequests: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0, onLeave: 0, totalDays: 0 };
    }
  },

  // Leave requests
  getLeaveRequests: async (params?: any) => {
    try {
      const response = await api.get('/leave/requests', { params });
      return response.data || { data: [], total: 0 };
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      return { data: [], total: 0 };
    }
  },

  getLeaveRequest: async (id: string) => {
    try {
      const response = await api.get(`/leave/requests/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to fetch leave request:', error);
      return null;
    }
  },

  createLeaveRequest: async (data: any) => {
    try {
      const response = await api.post('/leave/requests', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create leave request:', error);
      throw error;
    }
  },

  approveLeave: async (id: string, comments?: string) => {
    try {
      const response = await api.put(`/leave/requests/${id}/approve`, { comments });
      return response.data;
    } catch (error) {
      console.error('Failed to approve leave:', error);
      throw error;
    }
  },

  rejectLeave: async (id: string, comments?: string) => {
    try {
      const response = await api.put(`/leave/requests/${id}/reject`, { comments });
      return response.data;
    } catch (error) {
      console.error('Failed to reject leave:', error);
      throw error;
    }
  },

  deleteLeaveRequest: async (id: string) => {
    try {
      await api.delete(`/leave/requests/${id}`);
    } catch (error) {
      console.error('Failed to delete leave request:', error);
      throw error;
    }
  },

  addComment: async (id: string, comment: string) => {
    try {
      const response = await api.post(`/leave/requests/${id}/comments`, { comment });
      return response.data;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  },

  // Leave balances
  getLeaveBalances: async () => {
    try {
      const response = await api.get('/leave/balances');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch leave balances:', error);
      return [];
    }
  },

  getLeaveBalance: async (employeeId: string) => {
    try {
      const response = await api.get(`/leave/balances/${employeeId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to fetch leave balance:', error);
      return null;
    }
  },

  adjustLeaveBalance: async (employeeId: string, leaveTypeId: string, days: number) => {
    try {
      const response = await api.put(`/leave/balances/${employeeId}`, { leaveTypeId, days });
      return response.data;
    } catch (error) {
      console.error('Failed to adjust leave balance:', error);
      throw error;
    }
  },

  // Leave calendar
  getLeaveCalendar: async (params?: any) => {
    try {
      const response = await api.get('/leave/calendar', { params });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch leave calendar:', error);
      return [];
    }
  },

  // Leave Types
  getLeaveTypes: async () => {
    try {
      const response = await api.get('/leave/types');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch leave types:', error);
      return [];
    }
  },

  getLeaveType: async (id: string) => {
    try {
      const response = await api.get(`/leave/types/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to fetch leave type:', error);
      return null;
    }
  },

  createLeaveType: async (data: any) => {
    try {
      const response = await api.post('/leave/types', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create leave type:', error);
      throw error;
    }
  },

  updateLeaveType: async (id: string, data: any) => {
    try {
      const response = await api.put(`/leave/types/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update leave type:', error);
      throw error;
    }
  },

  deleteLeaveType: async (id: string) => {
    try {
      await api.delete(`/leave/types/${id}`);
    } catch (error) {
      console.error('Failed to delete leave type:', error);
      throw error;
    }
  },

  // Leave Policies
  getLeavePolicies: async () => {
    try {
      const response = await api.get('/leave/policies');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch leave policies:', error);
      return [];
    }
  },

  getLeavePolicy: async (id: string) => {
    try {
      const response = await api.get(`/leave/policies/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to fetch leave policy:', error);
      return null;
    }
  },

  createLeavePolicy: async (data: any) => {
    try {
      const response = await api.post('/leave/policies', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create leave policy:', error);
      throw error;
    }
  },

  updateLeavePolicy: async (id: string, data: any) => {
    try {
      const response = await api.put(`/leave/policies/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update leave policy:', error);
      throw error;
    }
  },

  deleteLeavePolicy: async (id: string) => {
    try {
      await api.delete(`/leave/policies/${id}`);
    } catch (error) {
      console.error('Failed to delete leave policy:', error);
      throw error;
    }
  }
};
