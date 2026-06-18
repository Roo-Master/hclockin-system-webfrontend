// Location: apps/backend-api/src/device/device.module.ts

import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { PublicKeyStore } from './public-key.store';
import { HardwareCachePool } from './hardware-cache.pool';
import { ActivationTokenEngine } from './activation-token.engine';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DeviceController],
  providers: [
    DeviceService,
    PublicKeyStore,
    HardwareCachePool,
    ActivationTokenEngine,
  ],
  // HardwareCachePool exported so common/SignatureGuard can inject it
  // DeviceService exported so other modules can call resolvePublicKey if needed
  exports: [HardwareCachePool, DeviceService],
})
export class DeviceModule {}
