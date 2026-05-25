import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TenantId = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest();
  const userTenantId = request.user?.tenantId;

  if (!userTenantId || typeof userTenantId !== 'string') {
    throw new BadRequestException('Authenticated tenant context is required.');
  }

  return userTenantId;
});
