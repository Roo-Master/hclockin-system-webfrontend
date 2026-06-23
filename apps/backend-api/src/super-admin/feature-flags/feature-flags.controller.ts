import { Controller, Get, Patch, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { FeatureFlagsService } from './feature-flags.service';
import { UpdateFeatureFlagsDto } from './dto/update-feature-flags.dto';

@Controller('super-admin/feature-flags')
@UseGuards(SuperAdminGuard)
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get(':tenantId')
  getFlags(@Param('tenantId') tenantId: string) {
    return this.featureFlagsService.getForTenant(tenantId);
  }

  @Patch(':tenantId')
  @HttpCode(HttpStatus.OK)
  updateFlags(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateFeatureFlagsDto,
  ) {
    return this.featureFlagsService.updateForTenant(tenantId, dto);
  }
}