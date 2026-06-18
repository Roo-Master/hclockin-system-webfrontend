import { BaseEntity } from './common';

/**
 * Flag categories
 */
export type FlagCategory = 'attendance' | 'notifications' | 'auth' | 'reporting' | 'experimental';

/**
 * Rollout strategies
 */
export type RolloutStrategy = 'global' | 'per_tenant' | 'percentage';

/**
 * Tenant override
 */
export interface TenantOverride {
  tenantId: string;
  enabled: boolean;
}

/**
 * Feature flag interface
 */
export interface FeatureFlag extends BaseEntity {
  key: string;
  name: string;
  description: string;
  category: FlagCategory;
  strategy: RolloutStrategy;
  globalEnabled: boolean;
  percentage?: number;
  tenantOverrides: TenantOverride[];
  lastModified: string;
  modifiedBy: string;
  stable: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Create feature flag data
 */
export interface CreateFeatureFlagData {
  key: string;
  name: string;
  description?: string;
  category: FlagCategory;
  strategy: RolloutStrategy;
  globalEnabled?: boolean;
  percentage?: number;
  stable?: boolean;
  tags?: string[];
}

/**
 * Update feature flag data
 */
export interface UpdateFeatureFlagData {
  name?: string;
  description?: string;
  category?: FlagCategory;
  strategy?: RolloutStrategy;
  globalEnabled?: boolean;
  percentage?: number;
  stable?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Feature flag filters
 */
export interface FeatureFlagFilters {
  search?: string;
  category?: FlagCategory | 'all';
  strategy?: RolloutStrategy | 'all';
  status?: 'all' | 'enabled' | 'disabled';
  stable?: boolean;
  tags?: string[];
}

/**
 * Feature flag evaluation context
 */
export interface FlagEvaluationContext {
  tenantId?: string;
  userId?: string;
  userRole?: string;
  department?: string;
  location?: string;
  device?: string;
  custom?: Record<string, any>;
}

/**
 * Feature flag evaluation result
 */
export interface FlagEvaluationResult {
  key: string;
  enabled: boolean;
  reason: string;
  timestamp: string;
  context: FlagEvaluationContext;
}

/**
 * Feature flag audit log
 */
export interface FlagAuditLog {
  id: string;
  flagId: string;
  flagKey: string;
  action: 'created' | 'updated' | 'deleted' | 'toggled' | 'overridden';
  changes: Record<string, any>;
  userId: string;
  userName: string;
  timestamp: string;
}

/**
 * Feature flag metrics
 */
export interface FlagMetrics {
  flagId: string;
  flagKey: string;
  totalEvaluations: number;
  enabledCount: number;
  disabledCount: number;
  enabledPercentage: number;
  byTenant: Record<string, { enabled: number; disabled: number }>;
  byUser: Record<string, number>;
  timestamp: string;
}
