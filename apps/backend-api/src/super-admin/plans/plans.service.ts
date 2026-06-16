import { Injectable } from '@nestjs/common';

@Injectable()
export class PlansService {
  async findAll() {
    // TODO: prisma.plan.findMany()
    return [];
  }

  async updatePricing(tier: string, dto: any) {
    // TODO: prisma.plan.update
    return null;
  }
}
