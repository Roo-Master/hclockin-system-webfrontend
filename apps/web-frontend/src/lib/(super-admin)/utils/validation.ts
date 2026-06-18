import { z } from 'zod';

// ─── Common Validators ──────────────────────────────────────────────────────

export const emailSchema = z.string().email('Invalid email address').min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters');

export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100, 'Slug must be at most 100 characters')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers, and hyphens');

export const urlSchema = z.string().url('Invalid URL');

export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format');

// ─── Tenant Validators ──────────────────────────────────────────────────────

export const createTenantSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  subdomain: slugSchema.min(3).max(63),
  adminEmail: emailSchema,
  contactName: nameSchema,
  plan: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  country: z.string().min(1, 'Country is required'),
  licenseKey: z.string().min(8, 'License key is too short'),
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
});

export const updateTenantSchema = z.object({
  name: nameSchema.optional(),
  status: z.enum(['ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELLED']).optional(),
  plan: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']).optional(),
  country: z.string().optional(),
  notes: z.string().nullable().optional(),
});

// ─── Admin Validators ──────────────────────────────────────────────────────

export const createAdminSchema = z.object({
  email: emailSchema,
  role: z.enum(['super_admin', 'hospital_admin', 'hr_manager', 'auditor']),
  tenantId: z.string().min(1, 'Tenant is required'),
});

export const updateAdminSchema = z.object({
  role: z.enum(['super_admin', 'hospital_admin', 'hr_manager', 'auditor']).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
});

// ─── Feature Flag Validators ───────────────────────────────────────────────

export const createFeatureFlagSchema = z.object({
  key: z.string().min(1, 'Key is required').regex(/^[a-z.]+$/, 'Key must use lowercase letters and dots'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum(['attendance', 'notifications', 'auth', 'reporting', 'experimental']),
  strategy: z.enum(['global', 'per_tenant', 'percentage']),
  globalEnabled: z.boolean().optional(),
  percentage: z.number().min(0).max(100).optional(),
});

// ─── Billing Validators ─────────────────────────────────────────────────────

export const updatePlanSchema = z.object({
  monthlyPrice: z.number().min(0).optional(),
  annualPrice: z.number().min(0).optional(),
});

export const subscriptionActionSchema = z.object({
  tenantId: z.string().min(1, 'Tenant ID is required'),
  action: z.enum(['pause', 'resume', 'cancel']),
});

// ─── Validation Helper ──────────────────────────────────────────────────────

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: messages };
    }
    return { success: false, error: 'Validation failed' };
  }
}
