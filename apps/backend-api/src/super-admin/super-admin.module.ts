import { Module } from '@nestjs/common';
import { TenantsModule } from './tenants/tenants.module';
import { PlansModule } from './plans/plans.module';
import { ImpersonationModule } from './impersonation/impersonation.module';
import { PlatformStatsModule } from './platform-stats/platform-stats.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';

@Module({
  imports: [
    TenantsModule,
    PlansModule,
    ImpersonationModule,
    PlatformStatsModule,
    FeatureFlagsModule,
  ],
})
export class SuperAdminModule {}
