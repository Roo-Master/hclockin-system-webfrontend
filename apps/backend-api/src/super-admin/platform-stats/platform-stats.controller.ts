import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
  getActivity(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.statsService.getRecentActivity(parsedLimit);
  }
}