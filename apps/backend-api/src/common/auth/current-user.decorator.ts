import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedUser } from './authenticated-user';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedUser => {
  const user = context.switchToHttp().getRequest().user as AuthenticatedUser | undefined;

  if (!user) {
    throw new UnauthorizedException('Authenticated user context is required.');
  }

  return user;
});
