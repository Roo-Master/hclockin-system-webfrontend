import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.authService.verifyToken(token);
      
      // Cross-tenant security check
      const headerTenantId = request.headers['x-tenant-id'];
      
      // SUPER_ADMIN has tenantId: null - skip cross-tenant check
      if (payload.role !== 'SUPER_ADMIN') {
        if (!headerTenantId || typeof headerTenantId !== 'string') {
          throw new UnauthorizedException('x-tenant-id header is required.');
        }

        if (headerTenantId !== payload.tenantId) {
          throw new UnauthorizedException(
            'Cross-tenant access denied. Token does not match request tenant.',
          );
        }
      }

      // Attach user to request
      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
        deptId: payload.deptId || null,
      };
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
