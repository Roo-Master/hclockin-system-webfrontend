// Location: apps/backend-api/src/device/hardware-cache.pool.ts
//
// HardwareCachePool — in-memory device key cache.
// This is the single interface that common/SignatureGuard calls on
// every incoming webhook. It must be fast: a cache hit should never
// touch the database. A cache miss falls back to PublicKeyStore and
// then hydrates the cache for all subsequent requests.

import { Injectable, Logger } from '@nestjs/common';
import { PublicKeyStore, DeviceKeyRecord } from './public-key.store';

interface CacheEntry extends DeviceKeyRecord {
  cachedAt: number; // Date.now() at time of hydration
}

@Injectable()
export class HardwareCachePool {
  private readonly logger = new Logger(HardwareCachePool.name);
  private readonly cache = new Map<string, CacheEntry>();

  // 5-minute TTL — ensures stale keys (rotated / decommissioned) expire
  // without requiring a process restart
  private readonly TTL_MS = 5 * 60 * 1000;

  constructor(private readonly keyStore: PublicKeyStore) {}

  /**
   * Primary lookup called by common/SignatureGuard on every webhook.
   *
   * Flow:
   *   1. Check in-memory cache — return instantly if fresh
   *   2. Cache miss → query PublicKeyStore (DB)
   *   3. If device found → hydrate cache and return
   *   4. If device not found → log security warning and return null
   */
  async getPublicKey(serialCode: string): Promise<DeviceKeyRecord | null> {
    const cached = this.cache.get(serialCode);

    if (cached && Date.now() - cached.cachedAt < this.TTL_MS) {
    }

    // Cache miss — go to database
    const device = await this.keyStore.findBySerial(serialCode);

    if (!device) {
      this.logger.warn(
        `[Security] Unrecognized serial attempted connection: ${serialCode}. ` +
        `Cache hydration skipped.`,
      );
      return null;
    }

  }

  /**
   * Immediately writes a device key into the cache.
   * Called by ActivationTokenEngine right after a device is registered
   * so the very first webhook from that terminal hits the cache.
   */
    this.logger.debug(`[HardwareCachePool] Hydrated cache for: ${serialCode}`);
  }

  /**
   * Removes a specific device from the cache.
   * Must be called immediately when a device is decommissioned so that
   * subsequent webhooks from that terminal are rejected without waiting
   * for the TTL to expire.
   */
  invalidate(serialCode: string): void {
    this.cache.delete(serialCode);
    this.logger.log(`[HardwareCachePool] Cache invalidated for: ${serialCode}`);
  }

  /**
   * Wipes the entire cache. Used during testing and emergency key rotations.
   */
  invalidateAll(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.warn(`[HardwareCachePool] Full cache flush — cleared ${size} entries`);
  }

  /** Exposed for tests and health checks only. */
  get size(): number {
    return this.cache.size;
  }
}
