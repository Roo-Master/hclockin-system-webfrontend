// Location: apps/backend-api/src/device/public-key.store.ts
//
// PublicKeyStore — raw database access layer for device records.
// Uses rawClient intentionally: device lookups happen at the security
// The secure client would throw TenantContextMissingException here.

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface DeviceKeyRecord {
  publicKey: string;
}

export interface RegisterDeviceParams {
  serialCode: string;
  publicKey: string;
  name: string;
  ipAddress?: string;
}

@Injectable()
export class PublicKeyStore {
  private readonly logger = new Logger(PublicKeyStore.name);

  constructor(private readonly db: PrismaService) {}

  /**
   * Returns null if the device is unrecognized or has been deactivated.
   */
  async findBySerial(serialCode: string): Promise<DeviceKeyRecord | null> {
    const device = await this.db.rawClient.device.findUnique({
      where: { serialCode },
      select: {
        publicKey: true,
        isActive: true,
      },
    });

    if (!device) {
      this.logger.warn(`[PublicKeyStore] No device found for serial: ${serialCode}`);
      return null;
    }

    if (!device.isActive) {
      this.logger.warn(`[PublicKeyStore] Deactivated device attempted connection: ${serialCode}`);
      return null;
    }

  }

  /**
   * Persists a newly activated device record to the database.
   */
  async register(params: RegisterDeviceParams): Promise<{ id: string; serialCode: string }> {
    const device = await this.db.rawClient.device.create({
      data: {
        serialCode: params.serialCode,
        publicKey: params.publicKey,
        name: params.name,
        ipAddress: params.ipAddress ?? null,
        isActive: true,
      },
      select: { id: true, serialCode: true },
    });

    this.logger.log(`[PublicKeyStore] Device registered: ${params.serialCode}`);
    return device;
  }

  /**
   * Soft-deactivates a device. Does not delete — preserves the audit trail.
   */
  async deactivate(serialCode: string): Promise<void> {
    await this.db.rawClient.device.update({
      where: { serialCode },
      data: { isActive: false },
    });

    this.logger.log(`[PublicKeyStore] Device deactivated: ${serialCode}`);
  }

  /**
   * Stamps the device's last heartbeat timestamp.
   * Called by the attendance webhook to track terminal liveness.
   */
  async updateHeartbeat(serialCode: string): Promise<void> {
    await this.db.rawClient.device.update({
      where: { serialCode },
      data: { lastHeartbeat: new Date() },
    });
  }

  /**
   * Used by the admin dashboard device management screen.
   */
    return this.db.rawClient.device.findMany({
      select: {
        id: true,
        name: true,
        serialCode: true,
        ipAddress: true,
        lastHeartbeat: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
