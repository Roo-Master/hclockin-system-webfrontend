import { BadRequestException, createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

export const TenantId = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest();
  const headerTenantId = request.headers['x-tenant-id'];
  const tenantId = Array.isArray(headerTenantId) ? headerTenantId[0] : headerTenantId;
  const userTenantId = request.user?.tenantId;

  if (tenantId && userTenantId && tenantId !== userTenantId) {
    throw new ForbiddenException('Tenant context does not match authenticated user.');
  }

  const resolvedTenantId = userTenantId ?? tenantId;

  if (!resolvedTenantId || typeof resolvedTenantId !== 'string') {
    throw new BadRequestException('X-Tenant-ID header is required.');
  }

  return resolvedTenantId;
});
