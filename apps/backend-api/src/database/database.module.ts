import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { RolesGuard } from '../common/auth/roles.guard';
import { TenantContextService } from '../common/tenant/tenant-context.service';
// Location: apps/backend/src/database/database.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [DatabaseService, TenantContextService, JwtAuthGuard, RolesGuard],
  exports: [DatabaseService, TenantContextService, JwtAuthGuard, RolesGuard]
  providers: [PrismaService, DatabaseService],
  exports: [PrismaService, DatabaseService],
})
export class DatabaseModule {}