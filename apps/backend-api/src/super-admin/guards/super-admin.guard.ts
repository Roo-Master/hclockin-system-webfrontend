import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Role } from '../enums/roles.enum';
import { RequestUser } from '../interfaces/request-user.interface';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  private readonly logger = new Logger(SuperAdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (user.role !== Role.SUPER_ADMIN) {
      this.logger.warn(
        `Unauthorized super-admin access attempt by user ${user.id} with role ${user.role}`,
      );
      throw new ForbiddenException('Super admin access required');
    }

    return true;
  }
}