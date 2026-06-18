import { Controller, Get, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { PlatformStatsService } from './platform-stats.service';

@Controller('super-admin/stats')
@UseGuards(SuperAdminGuard)
export class PlatformStatsController {
  constructor(private readonly statsService: PlatformStatsService) {}

  @Get()
  getStats() {
    return this.statsService.getPlatformStats();
  }

  @Get('mrr')
  getMrr() {
    return this.statsService.getMrrBreakdown();
  }

  @Get('activity')
  getActivity() {
    return this.statsService.getRecentActivity();
  }
}
