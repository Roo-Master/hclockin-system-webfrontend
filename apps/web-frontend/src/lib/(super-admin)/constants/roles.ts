import { AdminRole } from '@/types/(super-admin)/admin';

export const ROLES = {
  super_admin: 'super_admin',
  hospital_admin: 'hospital_admin',
  hr_manager: 'hr_manager',
  auditor: 'auditor',
} as const;

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  hospital_admin: 'Hospital Admin',
  hr_manager: 'HR Manager',
  auditor: 'Auditor',
};

export const ROLE_COLORS: Record<AdminRole, { bg: string; text: string; border: string }> = {
  super_admin: {
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#2563EB]',
    border: 'border-[#2563EB]',
  },
  hospital_admin: {
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#2563EB]',
    border: 'border-[#2563EB]',
  },
  hr_manager: {
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#16A34A]',
    border: 'border-[#16A34A]',
  },
  auditor: {
    bg: 'bg-[#FFEDD5]',
    text: 'text-[#EA580C]',
    border: 'border-[#EA580C]',
  },
};

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: ['*'],
  hospital_admin: [
    'manage_tenants',
    'manage_admins',
    'manage_staff',
    'view_billing',
    'manage_billing',
    'manage_settings',
  ],
  hr_manager: [
    'manage_staff',
    'manage_attendance',
    'manage_leave',
    'view_reports',
  ],
  auditor: [
    'view_reports',
    'view_billing',
    'view_staff',
  ],
};
