// Location: apps/backend-api/src/database/tenant.storage.ts

import { tenantStorage, TenantStorageContext } from './tenant-context';

// Alias the instance for the test runner and legacy consumers
export const TenantStorage = tenantStorage;

// Export both the instance and the type definition
export { tenantStorage, TenantStorageContext };
export { getTenantId, getTenantIdOrThrow } from './tenant-context';
export type { TenantContextStore } from './tenant-context';