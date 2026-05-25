import { Injectable, NestMiddleware } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly tenantContext: TenantContextService) {}

  use(request: any, _response: any, next: () => void) {
    const headerTenantId = request.headers['x-tenant-id'];
    const tenantId = request.user?.tenantId ?? (Array.isArray(headerTenantId) ? headerTenantId[0] : headerTenantId);

    this.tenantContext.run({ tenantId }, next);
  }
}
