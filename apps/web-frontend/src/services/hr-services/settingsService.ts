import api from './api';

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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  phone?: string;
  timezone: string;
  language: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  leaveRequestAlerts: boolean;
  attendanceReports: boolean;
  payrollAlerts: boolean;
  shiftChangeAlerts: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface LocalizationSettings {
  language: string;
  region: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export const settingsService = {
  // Get all settings
  getSettings: async (): Promise<AppSettings> => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      return {
        id: '1',
        companyName: 'CityCare Hospital',
        companyLogo: '',
        timezone: 'Africa/Nairobi',
        dateFormat: 'DD/MM/YYYY',
        currency: 'KES',
        workWeekStart: 1,
        workHoursPerDay: 8,
        workDaysPerWeek: 5,
        overtimeRate: 1.5,
        holidayRate: 2.0,
        payrollDay: 25,
        notificationEmail: 'admin@citycare.com',
        emailSettings: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: 'admin@citycare.com',
          smtpPassword: '',
          fromEmail: 'noreply@citycare.com',
          fromName: 'CityCare Hospital'
        },
        leaveSettings: {
          carryOverDays: 5,
          maxAccumulation: 30,
          approvalRequired: true
        },
        attendanceSettings: {
          gracePeriodMinutes: 15,
          autoClockOut: false,
          requireReasonForLate: true
        },
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
      };
    }
  },

  // Update general settings
  updateGeneralSettings: async (data: Partial<AppSettings>): Promise<AppSettings> => {
    try {
      const response = await api.put('/settings/general', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update general settings:', error);
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get('/settings/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return {
        id: '1',
        name: 'Admin User',
        email: 'admin@citycare.com',
        role: 'HR Admin',
        department: 'Human Resources',
        phone: '+254 700 000 000',
        timezone: 'Africa/Nairobi',
        language: 'en'
      };
    }
  },

  // Update user profile
  updateUserProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await api.put('/settings/profile', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean }> => {
    try {
      const response = await api.post('/settings/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  },

  // Get notification preferences
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    try {
      const response = await api.get('/settings/notifications');
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
  updateNotificationPreferences: async (data: NotificationPreferences): Promise<NotificationPreferences> => {
    try {
      const response = await api.put('/settings/notifications', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  },

  // Get appearance settings
  getAppearanceSettings: async (): Promise<AppearanceSettings> => {
    try {
      const response = await api.get('/settings/appearance');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch appearance settings:', error);
      return {
        theme: 'light',
        sidebarCollapsed: false,
        fontSize: 'medium'
      };
    }
  },

  // Update appearance settings
  updateAppearanceSettings: async (data: AppearanceSettings): Promise<AppearanceSettings> => {
    try {
      const response = await api.put('/settings/appearance', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update appearance settings:', error);
      throw error;
    }
  },

  // Get localization settings
  getLocalizationSettings: async (): Promise<LocalizationSettings> => {
    try {
      const response = await api.get('/settings/localization');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch localization settings:', error);
      return {
        language: 'en',
        region: 'KE',
        timezone: 'Africa/Nairobi',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
      };
    }
  },

  // Update localization settings
  updateLocalizationSettings: async (data: LocalizationSettings): Promise<LocalizationSettings> => {
    try {
      const response = await api.put('/settings/localization', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update localization settings:', error);
      throw error;
    }
  },

  // Get email settings
  getEmailSettings: async (): Promise<any> => {
    try {
      const response = await api.get('/settings/email');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch email settings:', error);
      return {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'admin@citycare.com',
        smtpPassword: '',
        fromEmail: 'noreply@citycare.com',
        fromName: 'CityCare Hospital',
        encryption: 'TLS'
      };
    }
  },

  // Update email settings
  updateEmailSettings: async (data: any): Promise<any> => {
    try {
      const response = await api.put('/settings/email', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update email settings:', error);
      throw error;
    }
  }
};
