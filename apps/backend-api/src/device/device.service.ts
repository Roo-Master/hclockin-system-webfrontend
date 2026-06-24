// Location: apps/backend-api/src/device/device.service.ts
//
// DeviceService — orchestrates PublicKeyStore, HardwareCachePool,
// and ActivationTokenEngine. This is what DeviceController calls.

import { Injectable } from '@nestjs/common';
import { HardwareCachePool } from './hardware-cache.pool';
import { ActivationTokenEngine, ConsumeTokenParams } from './activation-token.engine';
import { PublicKeyStore } from './public-key.store';

@Injectable()
export class DeviceService {
  constructor(
    private readonly cache: HardwareCachePool,
    private readonly tokenEngine: ActivationTokenEngine,
    private readonly keyStore: PublicKeyStore,
  ) {}

  // ─── Called by common/SignatureGuard on every webhook ──────────────────────

  async resolvePublicKey(serialCode: string) {
    return this.cache.getPublicKey(serialCode);
  }

  // ─── Admin dashboard: device registration flow ─────────────────────────────

  }

  async activateDevice(params: ConsumeTokenParams) {
    return this.tokenEngine.consumeToken(params);
  }

  // ─── Admin dashboard: device management ────────────────────────────────────

  }

  async decommissionDevice(serialCode: string): Promise<{ message: string }> {
    await this.keyStore.deactivate(serialCode);
    this.cache.invalidate(serialCode); // evict immediately — don't wait for TTL
    return { message: `Device ${serialCode} decommissioned successfully.` };
  }

  async recordHeartbeat(serialCode: string): Promise<void> {
    await this.keyStore.updateHeartbeat(serialCode);
  }
}
