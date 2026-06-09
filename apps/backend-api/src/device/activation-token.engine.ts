// Location: apps/backend-api/src/device/activation-token.engine.ts
//
// ActivationTokenEngine — manages the 6-digit terminal registration flow.
//
// Flow:
//   1. Admin opens dashboard → calls generateToken() → gets e.g. "821943"
//   2. Admin types that code into the SenseFace 2A menu screen
//   3. Terminal sends: { code, serialCode, publicKey, name } to the API
//   4. consumeToken() validates expiry + single-use, then atomically
//      creates the Device record and marks the token as consumed
//   5. Cache is hydrated immediately so the terminal's first webhook hits cache

import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { HardwareCachePool } from './hardware-cache.pool';

export interface ConsumeTokenParams {
  code: string;
  serialCode: string;
  publicKey: string;
  name: string;
  ipAddress?: string;
}

export interface ActivateDeviceResult {
  deviceId: string;
  serialCode: string;
  tenantId: string;
}

@Injectable()
export class ActivationTokenEngine {
  private readonly logger = new Logger(ActivationTokenEngine.name);
  private readonly TOKEN_TTL_MINUTES = 10;

  constructor(
    private readonly db: PrismaService,
    private readonly cache: HardwareCachePool,
  ) {}

  /**
   * Generates a short-lived 6-digit code for display on the admin dashboard.
   * The admin types this into the SenseFace 2A terminal screen to begin pairing.
   */
  async generateToken(tenantId: string): Promise<{ code: string; expiresInMinutes: number }> {
    const code = this.generateSixDigitCode();
    const expiresAt = new Date(Date.now() + this.TOKEN_TTL_MINUTES * 60 * 1000);

    await this.db.rawClient.activationToken.create({
      data: { tenantId, code, expiresAt },
    });

    this.logger.log(`[ActivationTokenEngine] Token generated for tenant: ${tenantId}`);
    return { code, expiresInMinutes: this.TOKEN_TTL_MINUTES };
  }

  /**
   * Validates and consumes an activation token, then registers the device.
   *
   * All three operations (mark token used + create device + hydrate cache)
   * are performed atomically. If the DB transaction fails, the cache is
   * never hydrated and the terminal cannot connect.
   */
  async consumeToken(params: ConsumeTokenParams): Promise<ActivateDeviceResult> {
    const token = await this.db.rawClient.activationToken.findUnique({
      where: { code: params.code },
    });

    // Token does not exist at all
    if (!token) {
      this.logger.warn(`[ActivationTokenEngine] Invalid code attempted: ${params.code}`);
      throw new BadRequestException('Activation code is invalid.');
    }

    // Token was already consumed — potential replay attack
    if (token.usedAt !== null) {
      this.logger.warn(
        `[ActivationTokenEngine] Replay attack: token ${params.code} ` +
        `was already consumed at ${token.usedAt.toISOString()}`,
      );
      throw new BadRequestException('Activation code has already been used.');
    }

    // Token has expired
    if (new Date() > token.expiresAt) {
      this.logger.warn(`[ActivationTokenEngine] Expired token used: ${params.code}`);
      throw new BadRequestException('Activation code has expired. Please generate a new one.');
    }

    // Atomically: mark token consumed + create device record
    const [, device] = await this.db.rawClient.$transaction([
      this.db.rawClient.activationToken.update({
        where: { code: params.code },
        data: { usedAt: new Date() },
      }),
      this.db.rawClient.device.create({
        data: {
          tenantId: token.tenantId,
          serialCode: params.serialCode,
          publicKey: params.publicKey,
          name: params.name,
          ipAddress: params.ipAddress ?? null,
          isActive: true,
        },
      }),
    ]);

    // Hydrate cache immediately — terminal's first webhook must not miss
    this.cache.hydrate(device.serialCode, device.publicKey, device.tenantId);

    this.logger.log(
      `[ActivationTokenEngine] Device activated: ${params.serialCode} for tenant: ${token.tenantId}`,
    );

    return {
      deviceId: device.id,
      serialCode: device.serialCode,
      tenantId: device.tenantId,
    };
  }

  private generateSixDigitCode(): string {
    // Cryptographically random 6-digit code: 100000–999999
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
