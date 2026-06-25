import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantService } from '../tenant.service';

@Injectable()
export class TenantFeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantService: TenantService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeatures = this.reflector.get<string[]>('features', context.getHandler());
    if (!requiredFeatures || requiredFeatures.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required');
    }

    // ✅ Now hasFeatures exists on TenantService
    const hasFeatures = await this.tenantService.hasFeatures(tenantId, requiredFeatures);
    if (!hasFeatures) {
      throw new ForbiddenException('Tenant does not have required features');
    }

    return true;
  }
}