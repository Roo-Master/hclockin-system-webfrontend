import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { PlansService } from './plans.service';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { PlanTier } from '../enums/plan-tier.enum';

@Controller('super-admin/plans')
@UseGuards(SuperAdminGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':tier')
  findOne(@Param('tier') tier: PlanTier) {
    return this.plansService.findOne(tier);
  }

  @Patch(':tier')
  @HttpCode(HttpStatus.OK)
  updatePricing(
    @Param('tier') tier: PlanTier,
    @Body() dto: UpdatePricingDto,
  ) {
    return this.plansService.updatePricing(tier, dto);
  }
}