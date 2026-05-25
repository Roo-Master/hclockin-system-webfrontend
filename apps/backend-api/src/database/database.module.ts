import { Module } from '@nestjs/common';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService, TenantContextService],
  exports: [DatabaseService, TenantContextService]
})
export class DatabaseModule {}
