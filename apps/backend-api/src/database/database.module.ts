import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { RolesGuard } from '../common/auth/roles.guard';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService, TenantContextService, JwtAuthGuard, RolesGuard],
  exports: [DatabaseService, TenantContextService, JwtAuthGuard, RolesGuard]
})
export class DatabaseModule {}
