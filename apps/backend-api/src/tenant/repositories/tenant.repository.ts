import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Tenant } from '../entities/tenant.entity';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { TenantQueryDto } from '../dto/tenant-query.dto';

@Injectable()
export class TenantRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Partial<CreateTenantDto> & {
    name: string;
    slug: string;
    subdomain: string;
    licenseKey: string;
  }): Promise<Tenant> {
    return this.prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        subdomain: data.subdomain,
        licenseKey: data.licenseKey,
        isActive: true,
      },
    }) as unknown as Tenant;
  }

  async findAll(query: TenantQueryDto): Promise<{ data: Tenant[]; total: number }> {
    const { search, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(status !== undefined && { isActive: status === 'active' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { subdomain: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // ✅ Added type assertion
    const [data, total] = await this.prisma.$transaction([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.tenant.count({ where }),
    ]) as [any[], number];

    return { data: data as unknown as Tenant[], total };
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.prisma.tenant.findFirst({
      where: { id, deletedAt: null },
    }) as unknown as Tenant | null;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    return this.prisma.tenant.findFirst({
      where: { subdomain, deletedAt: null },
    }) as unknown as Tenant | null;
  }

  // ✅ ADDED: findBySlug method
  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.prisma.tenant.findFirst({
      where: { slug, deletedAt: null },
    }) as unknown as Tenant | null;
  }

  // ✅ ADDED: findByEmail method
  async findByEmail(email: string): Promise<Tenant | null> {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { tenant: true },
    });
    return user?.tenant as unknown as Tenant | null;
  }

  async update(id: string, data: Partial<UpdateTenantDto>): Promise<Tenant> {
    const updateData: any = {};
    
    // ✅ Only add fields that exist in the data object
    if (data.name !== undefined) updateData.name = data.name;
    if (data.subdomain !== undefined) updateData.subdomain = data.subdomain;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.licenseKey !== undefined) updateData.licenseKey = data.licenseKey;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.suspendReason !== undefined) updateData.suspendReason = data.suspendReason;

    return this.prisma.tenant.update({
      where: { id },
      data: updateData,
    }) as unknown as Tenant;
  }

  async delete(id: string): Promise<Tenant> {
    return this.prisma.tenant.delete({
      where: { id },
    }) as unknown as Tenant;
  }

  async softDelete(id: string): Promise<Tenant> {
    return this.prisma.tenant.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    }) as unknown as Tenant;
  }

  async restore(id: string): Promise<Tenant> {
    return this.prisma.tenant.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
      },
    }) as unknown as Tenant;
  }

  async countTenants(): Promise<number> {
    return this.prisma.tenant.count({ where: { deletedAt: null } });
  }

  async countActiveTenants(): Promise<number> {
    return this.prisma.tenant.count({
      where: { isActive: true, deletedAt: null },
    });
  }
}