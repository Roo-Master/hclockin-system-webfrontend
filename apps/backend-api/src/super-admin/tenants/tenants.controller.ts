import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { TenantsService } from './tenants.service';

@Controller('super-admin/tenants')
@UseGuards(SuperAdminGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('plan') plan?: string) {
    return this.tenantsService.findAll({ status, plan });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Post()
  create(@Body() dto: any) {
    return this.tenantsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.tenantsService.update(id, dto);
  }

  @Patch(':id/suspend')
  suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.tenantsService.suspend(id, reason);
  }

  @Patch(':id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.tenantsService.reactivate(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
