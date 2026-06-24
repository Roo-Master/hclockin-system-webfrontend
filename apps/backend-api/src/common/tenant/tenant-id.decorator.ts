import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TenantId = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest();

  if (!userTenantId || typeof userTenantId !== 'string') {
  }

  return userTenantId;
});
