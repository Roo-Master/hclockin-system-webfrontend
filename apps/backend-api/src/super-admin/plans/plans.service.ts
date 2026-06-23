import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { PlanTier } from '../enums/plan-tier.enum';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.plan.findMany({
      orderBy: { monthlyPriceKes: 'asc' },
    });
  }

  async findOne(tier: PlanTier) {
    const plan = await this.prisma.plan.findUnique({ where: { tier } });
    if (!plan) throw new NotFoundException(`Plan tier '${tier}' not found`);
    return plan;
  }

  async updatePricing(tier: PlanTier, dto: UpdatePricingDto) {
    // Validate tier is a known enum value
    if (!Object.values(PlanTier).includes(tier)) {
      throw new BadRequestException(`Invalid plan tier: ${tier}`);
    }

    const existing = await this.prisma.plan.findUnique({ where: { tier } });
    if (!existing) throw new NotFoundException(`Plan tier '${tier}' not found`);

    const updated = await this.prisma.plan.update({
      where: { tier },
      data: {
        ...(dto.monthlyPriceKes !== undefined && { monthlyPriceKes: dto.monthlyPriceKes }),
        ...(dto.annualPriceKes !== undefined && { annualPriceKes: dto.annualPriceKes }),
        ...(dto.maxUsers !== undefined && { maxUsers: dto.maxUsers }),
        ...(dto.maxLocations !== undefined && { maxLocations: dto.maxLocations }),
        updatedAt: new Date(),
      },
    });

    this.logger.log(
      `Plan '${tier}' pricing updated: ${JSON.stringify(dto)}`,
    );

    return updated;
  }
}