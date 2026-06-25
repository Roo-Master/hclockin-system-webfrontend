import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantService } from '../tenant.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantService: TenantService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] as string;

    // Check if route is public (no tenant required)
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required');
    }

    // Verify tenant exists and is active
    const tenant = await this.tenantService.validateTenant(tenantId);
    if (!tenant) {
      throw new ForbiddenException('Invalid or inactive tenant');
    }

    // Attach tenant to request
    request.tenant = tenant;
    request.tenantId = tenantId;

    return true;
  }
}