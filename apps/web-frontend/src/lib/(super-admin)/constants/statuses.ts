export const STATUSES = {
  active: 'active',
  inactive: 'inactive',
  pending: 'pending',
} as const;

export const TENANT_STATUSES = {
  ACTIVE: 'ACTIVE',
  TRIAL: 'TRIAL',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED',
} as const;

export const PLAN_TIERS = {
  STARTER: 'STARTER',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export const FLAG_CATEGORIES = {
  attendance: 'attendance',
  notifications: 'notifications',
  auth: 'auth',
  reporting: 'reporting',
  experimental: 'experimental',
} as const;

export const ROLLOUT_STRATEGIES = {
  global: 'global',
  per_tenant: 'per_tenant',
  percentage: 'percentage',
} as const;

export const TRANSACTION_STATUSES = {
  paid: 'paid',
  overdue: 'overdue',
  pending: 'pending',
  failed: 'failed',
} as const;

export const STATUS_COLORS = {
  // Tenant statuses
  ACTIVE: { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', border: 'border-[#16A34A]' },
  TRIAL: { bg: 'bg-[#FFEDD5]', text: 'text-[#EA580C]', border: 'border-[#EA580C]' },
  SUSPENDED: { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', border: 'border-[#DC2626]' },
  CANCELLED: { bg: 'bg-[#F5F6FA]', text: 'text-[#6B7280]', border: 'border-[#6B7280]' },
  
  // Admin statuses
  active: { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', border: 'border-[#16A34A]' },
  inactive: { bg: 'bg-[#F5F6FA]', text: 'text-[#6B7280]', border: 'border-[#6B7280]' },
  pending: { bg: 'bg-[#FFEDD5]', text: 'text-[#EA580C]', border: 'border-[#EA580C]' },
} as const;
