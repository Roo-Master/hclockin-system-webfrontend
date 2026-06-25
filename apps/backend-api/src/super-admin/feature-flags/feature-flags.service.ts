import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateFeatureFlagsDto } from './dto/update-feature-flags.dto';

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly prisma: PrismaService) {}

  async getForTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException(`Tenant ${tenantId} not found`);

    const flags = await this.prisma.tenantFeatureFlag.findMany({
      where: { tenantId },
    });

    // Return as a flat key-value map for easy frontend consumption
    return flags.reduce<Record<string, boolean>>((acc, f) => {
      acc[f.flagName] = f.enabled;
      return acc;
    }, {});
  }

  async updateForTenant(tenantId: string, dto: UpdateFeatureFlagsDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException(`Tenant ${tenantId} not found`);

    const entries = Object.entries(dto).filter(([, v]) => v !== undefined) as [string, boolean][];

    await this.prisma.$transaction(
      entries.map(([flagName, enabled]) =>
        this.prisma.tenantFeatureFlag.upsert({
          where: { tenantId_flagName: { tenantId, flagName } },
          update: { enabled },
          create: { tenantId, flagName, enabled },
        }),
      ),
    );

    return this.getForTenant(tenantId);
  }
}