import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload, UserRole } from '@chronos/types-common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { TenantContextService } from '../tenant/tenant-context.service';
import { AuthenticatedUser } from './authenticated-user';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tenantContext: TenantContextService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const payload = this.verifyBearerToken(request.headers.authorization);

    request.user = {
      ...payload,
      userId: payload.sub,
      deptId: payload.deptId ?? null,
    } satisfies AuthenticatedUser;

    this.tenantContext.set({ tenantId: payload.tenantId });

    return true;
  }

  private verifyBearerToken(authorizationHeader: unknown): JwtPayload {
    if (typeof authorizationHeader !== 'string' || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token is required.');
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new UnauthorizedException('JWT verification is not configured.');
    }

    const token = authorizationHeader.slice('Bearer '.length).trim();
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new UnauthorizedException('Invalid bearer token.');
    }

    const header = this.parseBase64UrlJson(encodedHeader) as { alg?: string; typ?: string };

    if (header.alg !== 'HS256') {
      throw new UnauthorizedException('Unsupported token algorithm.');
    }

    const expectedSignature = this.base64UrlEncode(
      createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest(),
    );

    if (!this.constantTimeEquals(encodedSignature, expectedSignature)) {
      throw new UnauthorizedException('Invalid token signature.');
    }

    const payload = this.parseBase64UrlJson(encodedPayload) as Partial<JwtPayload> & { exp?: number };
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp <= nowInSeconds) {
      throw new UnauthorizedException('Token has expired.');
    }

    if (!payload.sub || !payload.email || !payload.tenantId || !payload.role) {
      throw new UnauthorizedException('Token payload is incomplete.');
    }

    if (!Object.values(UserRole).includes(payload.role)) {
      throw new UnauthorizedException('Token role is invalid.');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
      deptId: payload.deptId ?? null,
    };
  }

  private parseBase64UrlJson(value: string): unknown {
    try {
      return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Invalid token encoding.');
    }
  }

  private base64UrlEncode(value: Buffer): string {
    return value.toString('base64url');
  }

  private constantTimeEquals(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
  }
}
