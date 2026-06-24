import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {

  use(request: any, _response: any, next: () => void) {

  }
}
