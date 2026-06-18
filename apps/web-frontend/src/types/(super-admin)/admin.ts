import { BaseEntity } from './common';

/**
 * Admin roles
 */
export type AdminRole = 'super_admin' | 'hospital_admin' | 'hr_manager' | 'auditor';

/**
 * Admin status
 */
export type AdminStatus = 'active' | 'inactive' | 'pending';

/**
 * Admin interface
 */
export interface Admin extends BaseEntity {
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  tenantId: string | null;
  lastLogin: string | null;
  joinedAt: string;
  avatarInitials: string;
  phone?: string;
  permissions?: string[];
}

/**
 * Create admin data
 */
export interface CreateAdminData {
  email: string;
  role: AdminRole;
  tenantId: string;
  name?: string;
}

/**
 * Update admin data
 */
export interface UpdateAdminData {
  role?: AdminRole;
  status?: AdminStatus;
  name?: string;
  phone?: string;
  permissions?: string[];
}

/**
 * Admin filters
 */
export interface AdminFilters {
  search?: string;
  role?: AdminRole | 'all';
  status?: AdminStatus | 'all';
  tenantId?: string;
}

/**
 * Admin statistics
 */
export interface AdminStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  byRole: Record<AdminRole, number>;
  byTenant: Record<string, number>;
}

/**
 * Admin activity log
 */
export interface AdminActivity {
  id: string;
  adminId: string;
  action: string;
  details: Record<string, any>;
  ip: string;
  userAgent: string;
  timestamp: string;
}

/**
 * Admin invite
 */
export interface AdminInvite {
  id: string;
  email: string;
  role: AdminRole;
  tenantId: string;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}
