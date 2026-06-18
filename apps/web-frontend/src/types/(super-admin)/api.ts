import { ApiResponse, PaginatedResponse, PaginationParams } from './common';
import { User } from './user';
import { Admin } from './admin';
import { Tenant } from './tenant';
import { FeatureFlag } from './feature-flags';
import { BillingSummary } from './billing';
import { SystemMonitorData } from './system-monitor';

/**
 * API endpoints
 */
export interface ApiEndpoints {
  // Auth
  auth: {
    login: {
      request: { email: string; password: string };
      response: ApiResponse<{ user: User; token: string; refreshToken: string }>;
    };
    logout: {
      request: void;
      response: ApiResponse<{ success: boolean }>;
    };
    verify: {
      request: void;
      response: ApiResponse<{ user: User }>;
    };
    refresh: {
      request: { refreshToken: string };
      response: ApiResponse<{ token: string; refreshToken: string }>;
    };
    register: {
      request: { name: string; email: string; password: string; role?: string; tenantId?: string };
      response: ApiResponse<{ user: User; token: string; refreshToken: string }>;
    };
  };

  // Tenants
  tenants: {
    list: {
      request: PaginationParams & { search?: string; status?: string; plan?: string };
      response: ApiResponse<PaginatedResponse<Tenant>>;
    };
    create: {
      request: any;
      response: ApiResponse<Tenant>;
    };
    get: {
      request: { id: string };
      response: ApiResponse<Tenant>;
    };
    update: {
      request: { id: string; data: any };
      response: ApiResponse<Tenant>;
    };
    delete: {
      request: { id: string };
      response: ApiResponse<{ success: boolean }>;
    };
    suspend: {
      request: { id: string };
      response: ApiResponse<{ success: boolean }>;
    };
    activate: {
      request: { id: string };
      response: ApiResponse<{ success: boolean }>;
    };
  };

  // Admins
  admins: {
    list: {
      request: { search?: string; role?: string; status?: string; tenantId?: string };
      response: ApiResponse<{ admins: Admin[]; total: number }>;
    };
    create: {
      request: { email: string; role: string; tenantId: string };
      response: ApiResponse<Admin>;
    };
    updateStatus: {
      request: { id: string; status: string };
      response: ApiResponse<{ success: boolean }>;
    };
    updateRole: {
      request: { id: string; role: string };
      response: ApiResponse<{ success: boolean }>;
    };
  };

  // Feature Flags
  featureFlags: {
    list: {
      request: { search?: string; category?: string; strategy?: string; status?: string };
      response: ApiResponse<{ flags: FeatureFlag[]; total: number }>;
    };
    create: {
      request: any;
      response: ApiResponse<FeatureFlag>;
    };
    toggleGlobal: {
      request: { id: string; enabled: boolean };
      response: ApiResponse<{ success: boolean }>;
    };
    toggleTenant: {
      request: { id: string; tenantId: string; enabled: boolean };
      response: ApiResponse<{ success: boolean }>;
    };
  };

  // Billing
  billing: {
    summary: {
      request: void;
      response: ApiResponse<BillingSummary>;
    };
    updatePlan: {
      request: { id: string; data: { monthlyPrice?: number; annualPrice?: number } };
      response: ApiResponse<{ success: boolean }>;
    };
    markPaid: {
      request: { id: string };
      response: ApiResponse<{ success: boolean }>;
    };
    sendReminder: {
      request: { id: string };
      response: ApiResponse<{ success: boolean }>;
    };
    exportTransactions: {
      request: void;
      response: Response;
    };
    subscriptionAction: {
      request: { tenantId: string; action: 'pause' | 'resume' | 'cancel' };
      response: ApiResponse<{ success: boolean }>;
    };
  };

  // System Monitor
  systemMonitor: {
    status: {
      request: void;
      response: ApiResponse<SystemMonitorData>;
    };
  };
}

/**
 * API error
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  headers?: HeadersInit;
  params?: Record<string, any>;
  timeout?: number;
  cache?: RequestCache;
}

/**
 * API response with typed data
 */
export type TypedApiResponse<T> = ApiResponse<T> & {
  error?: ApiError;
};

/**
 * API hook return type
 */
export interface ApiHookResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<TypedApiResponse<T>>;
  reset: () => void;
}
