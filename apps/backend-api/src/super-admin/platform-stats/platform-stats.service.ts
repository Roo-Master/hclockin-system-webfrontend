import { Injectable } from '@nestjs/common';

@Injectable()
export class PlatformStatsService {
  async getPlatformStats() {
    // TODO: aggregate from prisma
    return {};
  }

  async getMrrBreakdown() {
    // TODO: group tenants by plan, sum prices
    return {};
  }

  async getRecentActivity() {
    // TODO: recent clock-ins, new tenants, etc.
    return [];
  }
}
