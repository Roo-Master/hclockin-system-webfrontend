// apps/backend-api/test/utils/tenant-context.mock.ts
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStoreContext {
  tenantId: string;
}

// Centralized execution context memory map to match your backend middleware engine
export const testTenantStorage = new AsyncLocalStorage<TenantStoreContext>();