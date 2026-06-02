import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContextStore {
  tenantId?: string;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContextStore>();

  run<T>(store: TenantContextStore, callback: () => T): T {
    return this.storage.run(store, callback);
  }

  set(store: TenantContextStore): void {
    this.storage.enterWith(store);
  }

  get tenantId(): string | undefined {
    return this.storage.getStore()?.tenantId;
  }
}
