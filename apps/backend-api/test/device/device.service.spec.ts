// Location: apps/backend-api/test/device/device.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DeviceService } from '../../src/device/device.service';
import { HardwareCachePool } from '../../src/device/hardware-cache.pool';
import { ActivationTokenEngine } from '../../src/device/activation-token.engine';
import { PublicKeyStore } from '../../src/device/public-key.store';

// ─── Shared Test Data ─────────────────────────────────────────────────────────

const TENANT_ID = 'tenant-uuid-001';
const SERIAL = 'ZK-ADMS-ICU-MAIN-01';
const PUBLIC_KEY = 'test-hmac-secret-key';

const mockDevice = {
  id: 'device-uuid-001',
  serialCode: SERIAL,
  tenantId: TENANT_ID,
  name: 'ICU Gate A',
  publicKey: PUBLIC_KEY,
  ipAddress: '192.168.1.100',
  lastHeartbeat: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Mock Providers ───────────────────────────────────────────────────────────

const mockCache = {
  getPublicKey: jest.fn(),
  hydrate: jest.fn(),
  invalidate: jest.fn(),
  invalidateAll: jest.fn(),
  size: 0,
};

const mockTokenEngine = {
  generateToken: jest.fn(),
  consumeToken: jest.fn(),
};

const mockKeyStore = {
  findBySerial: jest.fn(),
  register: jest.fn(),
  deactivate: jest.fn(),
  updateHeartbeat: jest.fn(),
  findAllByTenant: jest.fn(),
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('DeviceService', () => {
  let service: DeviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceService,
        { provide: HardwareCachePool, useValue: mockCache },
        { provide: ActivationTokenEngine, useValue: mockTokenEngine },
        { provide: PublicKeyStore, useValue: mockKeyStore },
      ],
    }).compile();

    service = module.get<DeviceService>(DeviceService);
    jest.clearAllMocks();
  });

  // ─── resolvePublicKey ──────────────────────────────────────────────────────

  describe('resolvePublicKey', () => {
    it('should return key from cache on a hit', async () => {
      mockCache.getPublicKey.mockResolvedValue({ publicKey: PUBLIC_KEY, tenantId: TENANT_ID });

      const result = await service.resolvePublicKey(SERIAL);

      expect(result).toEqual({ publicKey: PUBLIC_KEY, tenantId: TENANT_ID });
      expect(mockCache.getPublicKey).toHaveBeenCalledWith(SERIAL);
    });

    it('should return null for an unrecognized serial code', async () => {
      mockCache.getPublicKey.mockResolvedValue(null);

      const result = await service.resolvePublicKey('UNKNOWN-SERIAL');

      expect(result).toBeNull();
    });
  });

  // ─── generateActivationToken ───────────────────────────────────────────────

  describe('generateActivationToken', () => {
    it('should generate a 6-digit token for a tenant', async () => {
      mockTokenEngine.generateToken.mockResolvedValue({ code: '821943', expiresInMinutes: 10 });

      const result = await service.generateActivationToken(TENANT_ID);

      expect(result.code).toBe('821943');
      expect(result.expiresInMinutes).toBe(10);
      expect(mockTokenEngine.generateToken).toHaveBeenCalledWith(TENANT_ID);
    });
  });

  // ─── activateDevice ────────────────────────────────────────────────────────

  describe('activateDevice', () => {
    const activateParams = {
      code: '821943',
      serialCode: SERIAL,
      publicKey: PUBLIC_KEY,
      name: 'ICU Gate A',
    };

    it('should activate a device with a valid token', async () => {
      mockTokenEngine.consumeToken.mockResolvedValue({
        deviceId: 'device-uuid-001',
        serialCode: SERIAL,
        tenantId: TENANT_ID,
      });

      const result = await service.activateDevice(activateParams);

      expect(result.deviceId).toBe('device-uuid-001');
      expect(result.tenantId).toBe(TENANT_ID);
      expect(mockTokenEngine.consumeToken).toHaveBeenCalledWith(activateParams);
    });

    it('should throw BadRequestException for an invalid code', async () => {
      mockTokenEngine.consumeToken.mockRejectedValue(
        new BadRequestException('Activation code is invalid.'),
      );

      await expect(service.activateDevice({ ...activateParams, code: '000000' }))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException for an expired token', async () => {
      mockTokenEngine.consumeToken.mockRejectedValue(
        new BadRequestException('Activation code has expired. Please generate a new one.'),
      );

      await expect(service.activateDevice(activateParams))
        .rejects
        .toThrow('Activation code has expired');
    });

    it('should throw BadRequestException for a replayed (already used) token', async () => {
      mockTokenEngine.consumeToken.mockRejectedValue(
        new BadRequestException('Activation code has already been used.'),
      );

      await expect(service.activateDevice(activateParams))
        .rejects
        .toThrow('Activation code has already been used');
    });
  });

  // ─── decommissionDevice ────────────────────────────────────────────────────

  describe('decommissionDevice', () => {
    it('should deactivate device in DB and invalidate cache immediately', async () => {
      mockKeyStore.deactivate.mockResolvedValue(undefined);
      mockCache.invalidate.mockReturnValue(undefined);

      const result = await service.decommissionDevice(SERIAL);

      expect(mockKeyStore.deactivate).toHaveBeenCalledWith(SERIAL);
      // Cache must be invalidated — don't wait for TTL expiry
      expect(mockCache.invalidate).toHaveBeenCalledWith(SERIAL);
      expect(result.message).toContain(SERIAL);
    });

    it('should invalidate cache even if deactivation succeeds', async () => {
      mockKeyStore.deactivate.mockResolvedValue(undefined);

      await service.decommissionDevice(SERIAL);

      // Order matters: DB first, then cache
      const dbCallOrder = mockKeyStore.deactivate.mock.invocationCallOrder[0];
      const cacheCallOrder = mockCache.invalidate.mock.invocationCallOrder[0];
      expect(dbCallOrder).toBeLessThan(cacheCallOrder);
    });
  });

  // ─── listDevices ───────────────────────────────────────────────────────────

  describe('listDevices', () => {
    it('should return all active devices for a tenant', async () => {
      mockKeyStore.findAllByTenant.mockResolvedValue([mockDevice]);

      const result = await service.listDevices(TENANT_ID);

      expect(result).toHaveLength(1);
      expect(result[0].serialCode).toBe(SERIAL);
      expect(mockKeyStore.findAllByTenant).toHaveBeenCalledWith(TENANT_ID);
    });

    it('should return an empty array if no devices are registered', async () => {
      mockKeyStore.findAllByTenant.mockResolvedValue([]);

      const result = await service.listDevices(TENANT_ID);

      expect(result).toEqual([]);
    });
  });

  // ─── recordHeartbeat ───────────────────────────────────────────────────────

  describe('recordHeartbeat', () => {
    it('should update heartbeat timestamp for a known device', async () => {
      mockKeyStore.updateHeartbeat.mockResolvedValue(undefined);

      await service.recordHeartbeat(SERIAL);

      expect(mockKeyStore.updateHeartbeat).toHaveBeenCalledWith(SERIAL);
    });
  });
});
