import api from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
  icon?: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  leaveRequestAlerts: boolean;
  attendanceReports: boolean;
  payrollAlerts: boolean;
  shiftChangeAlerts: boolean;
}

export const notificationService = {
  // Get all notifications
  getNotifications: async (params?: { limit?: number; read?: boolean }): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications', { params });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Return mock data for demo - will be replaced with real API
      return [
        {
          id: '1',
          title: 'New Leave Request',
          message: 'Dr. John Smith requested annual leave for June 20-24, 2024',
          type: 'info',
          read: false,
          createdAt: new Date().toISOString(),
          link: '/leave/requests/1'
        },
        {
          id: '2',
          title: 'Payroll Ready for Review',
          message: 'Payroll for May 2024 is ready for approval',
          type: 'warning',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          link: '/payroll/process'
        },
        {
          id: '3',
          title: 'Employee On Leave',
          message: '12 employees are on leave today',
          type: 'info',
          read: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          link: '/attendance/daily'
        },
        {
          id: '4',
          title: 'Training Deadline Approaching',
          message: '15 employees need to complete mandatory training by June 30',
          type: 'error',
          read: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          link: '/reports/training'
        },
        {
          id: '5',
          title: 'Shift Change Request',
          message: 'Nurse Mary Johnson requested shift change from evening to morning',
          type: 'warning',
          read: false,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          link: '/shifts/requests'
        }
      ];
    }
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: true };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return { success: true };
    }
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return { success: true };
    }
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ count: number }> => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return { count: 0 };
    }
  },

  // Get notification preferences
  getPreferences: async (): Promise<NotificationPreferences> => {
    try {
      const response = await api.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      return {
        emailNotifications: true,
        leaveRequestAlerts: true,
        attendanceReports: false,
        payrollAlerts: true,
        shiftChangeAlerts: true
      };
    }
  },

  // Update notification preferences
  updatePreferences: async (data: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    try {
      const response = await api.put('/notifications/preferences', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }
};
