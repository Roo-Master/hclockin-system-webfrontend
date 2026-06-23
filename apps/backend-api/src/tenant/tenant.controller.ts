import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { TenantService } from './tenant.service';
  import { CreateTenantDto } from './dto/create-tenant.dto';
  import { UpdateTenantDto } from './dto/update-tenant.dto';
  import { TenantQueryDto } from './dto/tenant-query.dto';
  import { TenantResponseDto } from './dto/tenant-response.dto';
  import { TenantGuard } from './guards/tenant.guard';
  import { TenantFeatureGuard } from './guards/tenant-feature.guard';
  import { Public } from './decorators/public.decorator';
  import { RequireFeature } from './decorators/require-feature.decorator';
  import { CurrentTenant } from './decorators/current-tenant.decorator';
  
  @Controller('api/tenants')
  export class TenantController {
    constructor(private readonly tenantService: TenantService) {}
  
    @Post()
    @Public()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
      return this.tenantService.create(createTenantDto);
    }
  
    @Get()
    @UseGuards(TenantGuard)
    async findAll(@Query() query: TenantQueryDto): Promise<{
      data: TenantResponseDto[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }> {
      return this.tenantService.findAll(query);
    }
  
    @Get('statistics')
    @UseGuards(TenantGuard)
    async getStatistics() {
      return this.tenantService.getStatistics();
    }
  
    @Get('me')
    @UseGuards(TenantGuard)
    async getCurrentTenant(@CurrentTenant() tenant: any): Promise<TenantResponseDto> {
      return TenantResponseDto.fromEntity(tenant);
    }
  
    @Get('subdomain/:subdomain')
    @Public()
    async findBySubdomain(@Param('subdomain') subdomain: string): Promise<TenantResponseDto> {
      return this.tenantService.findBySubdomain(subdomain);
    }
  
    @Get('email/:email')
    @Public()
    async findByEmail(@Param('email') email: string): Promise<TenantResponseDto> {
      return this.tenantService.findByEmail(email);
    }
  
    @Get(':id')
    @UseGuards(TenantGuard)
    async findOne(@Param('id') id: string): Promise<TenantResponseDto> {
      return this.tenantService.findOne(id);
    }
  
    @Put(':id')
    @UseGuards(TenantGuard)
    async update(
      @Param('id') id: string,
      @Body() updateTenantDto: UpdateTenantDto,
    ): Promise<TenantResponseDto> {
      return this.tenantService.update(id, updateTenantDto);
    }
  
    @Delete(':id')
    @UseGuards(TenantGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string): Promise<void> {
      return this.tenantService.softDelete(id);
    }
  
    @Delete(':id/permanent')
    @UseGuards(TenantGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePermanent(@Param('id') id: string): Promise<void> {
      return this.tenantService.delete(id);
    }
  
    @Put(':id/features')
    @UseGuards(TenantGuard, TenantFeatureGuard)
    @RequireFeature('feature_management')
    async updateFeatures(
      @Param('id') id: string,
      @Body() features: Record<string, any>,
    ): Promise<TenantResponseDto> {
      return this.tenantService.updateFeatures(id, features);
    }
  
    @Put(':id/settings')
    @UseGuards(TenantGuard)
    async updateSettings(
      @Param('id') id: string,
      @Body() settings: Record<string, any>,
    ): Promise<TenantResponseDto> {
      return this.tenantService.updateSettings(id, settings);
    }
  }