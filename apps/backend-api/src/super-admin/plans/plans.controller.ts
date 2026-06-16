import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { PlansService } from './plans.service';

@Controller('super-admin/plans')
@UseGuards(SuperAdminGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  @Patch(':tier')
  updatePricing(@Param('tier') tier: string, @Body() dto: any) {
    return this.plansService.updatePricing(tier, dto);
  }
}
