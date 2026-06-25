import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { TenantRepository } from './repositories/tenant.repository';

@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [TenantController],
  providers: [TenantService, TenantRepository],
  exports: [TenantService, TenantRepository],
})
export class TenantModule {}