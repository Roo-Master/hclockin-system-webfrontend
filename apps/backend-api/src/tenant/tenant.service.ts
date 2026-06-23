import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TenantRepository } from './repositories/tenant.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantQueryDto } from './dto/tenant-query.dto';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantService {
  constructor(private tenantRepository: TenantRepository) {}

  async create(createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    const existingSubdomain = await this.tenantRepository.findBySubdomain(
      createTenantDto.subdomain,
    );
    if (existingSubdomain) {
      throw new ConflictException('Subdomain already taken');
    }

    const tenant = await this.tenantRepository.create(createTenantDto);
    return TenantResponseDto.fromEntity(tenant);
  }

  async findAll(query: TenantQueryDto): Promise<{
    data: TenantResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { data, total } = await this.tenantRepository.findAll(query);
    const { page = 1, limit = 10 } = query;

    return {
      data: TenantResponseDto.fromEntities(data),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) throw new NotFoundException(`Tenant with ID ${id} not found`);
    return TenantResponseDto.fromEntity(tenant);
  }

  async findBySubdomain(subdomain: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findBySubdomain(subdomain);
    if (!tenant) {
      throw new NotFoundException(`Tenant with subdomain '${subdomain}' not found`);
    }
    return TenantResponseDto.fromEntity(tenant);
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) throw new NotFoundException(`Tenant with ID ${id} not found`);

    if (updateTenantDto.subdomain && updateTenantDto.subdomain !== tenant.subdomain) {
      const existing = await this.tenantRepository.findBySubdomain(updateTenantDto.subdomain);
      if (existing && existing.id !== id) {
        throw new ConflictException('Subdomain already taken');
      }
    }

    const updated = await this.tenantRepository.update(id, updateTenantDto);
    return TenantResponseDto.fromEntity(updated);
  }

  async softDelete(id: string): Promise<void> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) throw new NotFoundException(`Tenant with ID ${id} not found`);
    await this.tenantRepository.softDelete(id);
  }

  async restore(id: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) throw new NotFoundException(`Tenant with ID ${id} not found`);
    const restored = await this.tenantRepository.restore(id);
    return TenantResponseDto.fromEntity(restored);
  }

  async validateTenant(tenantId: string): Promise<Tenant | null> {
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant || !tenant.isActive) return null;
    return tenant;
  }

  async getStatistics() {
    const [total, active] = await Promise.all([
      this.tenantRepository.countTenants(),
      this.tenantRepository.countActiveTenants(),
    ]);

    return {
      total,
      active,
      inactive: total - active,
    };
  }
}