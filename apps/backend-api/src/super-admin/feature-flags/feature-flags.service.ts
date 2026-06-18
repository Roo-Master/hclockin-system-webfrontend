import { Injectable } from '@nestjs/common';

@Injectable()
export class FeatureFlagsService {
  async getForTenant(tenantId: string) {
    // TODO: prisma.tenantFeatureFlag.findMany({ where: { tenantId } })
    return {};
  }

  async updateForTenant(tenantId: string, flags: Record<string, boolean>) {
    // TODO: upsert each flag
    return {};
  }
}
