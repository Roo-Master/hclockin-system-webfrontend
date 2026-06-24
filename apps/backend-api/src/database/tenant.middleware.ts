import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  public use(req: Request, res: Response, next: NextFunction): void {
    
    // Mitigate array injection tactics by extracting the primary primitive index

      this.logger.warn({
        alert: 'CONTEXT_BYPASS',
        uri: req.originalUrl,
        verb: req.method,
        ip: req.ip,
      });
      return next();
    }

    try {
    } catch (error: any) {
      this.logger.error({
        alert: 'CONTEXT_INITIALIZATION_FAILED',
        message: error.message,
        uri: req.originalUrl,
      });
      
      res.status(400).json({
        statusCode: 400,
        error: 'Bad Request',
      });
    }
  }
}