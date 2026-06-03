// Location: apps/backend-api/src/database/tenant.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantStorage } from './tenant.storage';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  public use(req: Request, res: Response, next: NextFunction): void {
    const rawTenantId = req.headers['x-hospital-id'] || req.headers['x-tenant-id'];
    
    // Mitigate array injection tactics by extracting the primary primitive index
    const tenantId = Array.isArray(rawTenantId) ? rawTenantId[0] : rawTenantId;

    if (!tenantId || tenantId.trim() === '') {
      this.logger.warn({
        alert: 'CONTEXT_BYPASS',
        message: 'Inbound route execution transparently bypassing tenant assignment container.',
        uri: req.originalUrl,
        verb: req.method,
        ip: req.ip,
      });
      return next();
    }

    try {
      TenantStorage.run(tenantId, next);
    } catch (error: any) {
      this.logger.error({
        alert: 'CONTEXT_INITIALIZATION_FAILED',
        message: error.message,
        uri: req.originalUrl,
      });
      
      res.status(400).json({
        statusCode: 400,
        error: 'Bad Request',
        message: 'The structural format of the provided tenant context identifier is invalid.',
      });
    }
  }
}