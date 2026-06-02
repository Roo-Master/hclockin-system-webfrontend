// Location: apps/backend-api/src/database/tenant-context.ts

import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContextStore {
  readonly tenantId: string;
  readonly isRlsSet: boolean;
}

/**
 * 1. EXPORT THE CLASS DIRECTLY
 * Adding the 'export' keyword here solves the declaration emit issue completely.
 */
export class TenantStorageContext {
  private readonly storageInstance = new AsyncLocalStorage<TenantContextStore>();
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  public run(tenantId: string, callback: () => void, isRlsSet = false): void {
    if (!tenantId || !TenantStorageContext.UUID_REGEX.test(tenantId.trim())) {
      throw new Error('[Security Exception] Context initialization aborted: Tenant identifier is missing or structurally invalid.');
    }

    this.storageInstance.run(
      Object.freeze({
        tenantId: tenantId.trim().toLowerCase(),
        isRlsSet,
      }),
      callback
    );
  }

  public getTenantId(): string | undefined {
    return this.storageInstance.getStore()?.tenantId;
  }

  public getTenantIdOrThrow(): string {
    const tenantId = this.getTenantId();
    if (!tenantId) {
      throw new Error('[Security Exception] Operational lock: Access denied because active tenant storage context is unassigned.');
    }
    return tenantId;
  }

  public isRlsSet(): boolean {
    return this.storageInstance.getStore()?.isRlsSet ?? false;
  }
}

// 2. Export your singleton instance as usual
export const tenantStorage = new TenantStorageContext();

export function getTenantId(): string | undefined {
  return tenantStorage.getTenantId();
}

export function getTenantIdOrThrow(): string {
  return tenantStorage.getTenantIdOrThrow();
}