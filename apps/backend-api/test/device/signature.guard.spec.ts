import { createHmac } from 'node:crypto';
import { SignatureGuard } from '../../src/common/guards/signature.guard';

describe('SignatureGuard', () => {
  it('accepts a valid HMAC-SHA256 signature for a known device', async () => {
    const payload = Buffer.from(JSON.stringify({ ok: true }));
    const publicKey = 'shared-secret';
    const signature = createHmac('sha256', publicKey).update(payload).digest('hex');

    const cache = {
      getPublicKey: jest.fn().mockResolvedValue({ publicKey, tenantId: 'tenant-1' }),
    };

    const guard = new SignatureGuard(cache as any);
    const request = {
      headers: {
        'x-device-serial': 'SERIAL-1',
        'x-device-signature': signature,
      },
      body: { ok: true },
      rawBody: payload,
    };

    await expect(
      guard.canActivate({
        switchToHttp: () => ({ getRequest: () => request }),
      } as any),
    ).resolves.toBe(true);
  });

  it('rejects an invalid signature for a known device', async () => {
    const cache = {
      getPublicKey: jest.fn().mockResolvedValue({ publicKey: 'shared-secret', tenantId: 'tenant-1' }),
    };

    const guard = new SignatureGuard(cache as any);
    const request = {
      headers: {
        'x-device-serial': 'SERIAL-1',
        'x-device-signature': '0'.repeat(64),
      },
      body: { ok: true },
      rawBody: Buffer.from(JSON.stringify({ ok: true })),
    };

    await expect(
      guard.canActivate({
        switchToHttp: () => ({ getRequest: () => request }),
      } as any),
    ).rejects.toMatchObject({ response: { statusCode: 401 } });
  });
});
