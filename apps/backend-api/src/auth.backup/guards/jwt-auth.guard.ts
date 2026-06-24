import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../employee/users/enum/user-role.enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtSecret: string;

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {
    this.jwtSecret = this.config.getOrThrow<string>('JWT_SECRET');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token.');
    }

    const payload = this.verifyToken(token);

    if (payload.role !== UserRole.SUPER_ADMIN) {
      if (!headerTenantId || typeof headerTenantId !== 'string') {
      }
        throw new UnauthorizedException(
        );
      }
    }


    const user: AuthenticatedUser = {
      userId: payload.sub,
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      deptId: payload.deptId,
    };
    request.user = user;

    return true;
  }

  private extractBearerToken(request: any): string | null {
    const authHeader: string | undefined = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.slice(7);
  }

  private verifyToken(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Malformed token.');
    }

    const [headerB64, bodyB64, sigB64] = parts;

    const expectedSig = createHmac('sha256', this.jwtSecret)
      .update(`${headerB64}.${bodyB64}`)
      .digest();

    const providedSig = Buffer.from(sigB64, 'base64url');

    if (
      expectedSig.length !== providedSig.length ||
      !timingSafeEqual(expectedSig, providedSig)
    ) {
      throw new UnauthorizedException('Invalid token signature.');
    }

    let payload: JwtPayload;
    try {
      payload = JSON.parse(Buffer.from(bodyB64, 'base64url').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Malformed token payload.');
    }

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      throw new UnauthorizedException('Token has expired.');
    }

    if (payload.type === 'refresh') {
      throw new UnauthorizedException('Refresh tokens cannot be used for authentication.');
    }

    return payload;
  }
}
