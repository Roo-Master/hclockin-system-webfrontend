import { BaseEntity } from './common';

/**
 * User roles
 */
export type UserRole = 'super_admin' | 'hospital_admin' | 'hr_manager' | 'auditor' | 'staff';

/**
 * User status
 */
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

/**
 * User interface
 */
export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  tenantId: string | null;
  avatarInitials: string;
  lastLogin: string | null;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  permissions?: string[];
  preferences?: UserPreferences;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: NotificationPreferences;
  language: string;
  timezone: string;
  dateFormat: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  digest: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly';
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Register data
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  tenantId?: string;
  phone?: string;
}

/**
 * Update user data
 */
export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  preferences?: Partial<UserPreferences>;
}

/**
 * Change password data
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Reset password data
 */
export interface ResetPasswordData {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Auth response
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Session data
 */
export interface Session {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}
