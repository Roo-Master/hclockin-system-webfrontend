import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { FeatureFlagsService } from './feature-flags.service';

@Controller('super-admin/feature-flags')
@UseGuards(SuperAdminGuard)
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get(':tenantId')
  getFlags(@Param('tenantId') tenantId: string) {
    return this.featureFlagsService.getForTenant(tenantId);
  }

  @Patch(':tenantId')
  updateFlags(@Param('tenantId') tenantId: string, @Body() flags: Record<string, boolean>) {
    return this.featureFlagsService.updateForTenant(tenantId, flags);
  }
}
