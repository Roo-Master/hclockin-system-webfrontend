// Location: apps/backend/src/database/tenant.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantStorage } from './tenant-context';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Extract the primary multi-tenant header token
    const hospitalId = request.headers['x-hospital-id'];

    // If no tenant token is present (e.g., open health check routes or root administrative actions), pass through
    if (!hospitalId || typeof hospitalId !== 'string') {
      return next.handle();
    }

    // Execute all downstream controllers and providers within this safe context box
    return new Observable((subscriber) => {
      tenantStorage.run(hospitalId, () => {
        next.handle().subscribe({
          next: (val) => subscriber.next(val),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}