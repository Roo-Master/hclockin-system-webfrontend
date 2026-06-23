import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { SuperAdminGuard } from '../guards/super-admin.guard';
  import { TenantsService } from './tenants.service';
  import { CreateTenantDto } from '../../tenant/dto/create-tenant.dto';
  import { UpdateTenantDto } from '../../tenant/dto/update-tenant.dto';
  import { TenantQueryDto } from '../../tenant/dto/tenant-query.dto';
  
  @Controller('super-admin/tenants')
  @UseGuards(SuperAdminGuard)
  export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) {}
  
    @Get()
    findAll(@Query() query: TenantQueryDto) {
      return this.tenantsService.findAll(query);
    }
  
    @Get('stats')
    getStatistics() {
      return this.tenantsService.getStatistics();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.tenantsService.findOne(id);
    }
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateTenantDto) {
      return this.tenantsService.create(dto);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
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
    @HttpCode(HttpStatus.OK)
    softDelete(@Param('id') id: string) {
      return this.tenantsService.softDelete(id);
    }
  }