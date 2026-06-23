import {
    Injectable,
    NotFoundException,
    ConflictException,
    Logger,
  } from '@nestjs/common';
  import * as bcrypt from 'bcrypt';
  import { PrismaService } from '../../database/prisma.service';
  import { CreateTenantDto } from '../../tenant/dto/create-tenant.dto';
  import { UpdateTenantDto } from '../../tenant/dto/update-tenant.dto';
  import { TenantQueryDto } from '../../tenant/dto/tenant-query.dto';
  
  const SALT_ROUNDS = 10;
  
  @Injectable()
  export class TenantsService {
    private readonly logger = new Logger(TenantsService.name);
  
    constructor(private readonly prisma: PrismaService) {}
  
    async findAll(query: TenantQueryDto) {
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
  
      const [data, total] = await this.prisma.$transaction([
        this.prisma.tenant.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: { _count: { select: { users: true } } },
        }),
        this.prisma.tenant.count({ where }),
      ]);
  
      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  
    async findOne(id: string) {
      const tenant = await this.prisma.tenant.findFirst({
        where: { id, deletedAt: null },
        include: {
          _count: { select: { users: true } },
          systemSetting: true,
        },
      });
      if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
      return tenant;
    }
  
    async create(dto: CreateTenantDto & {
      adminEmail: string;
      adminPassword: string;
      adminFirstName: string;
      adminLastName: string;
    }) {
      const existing = await this.prisma.tenant.findFirst({
        where: { OR: [{ slug: dto.slug }, { subdomain: dto.subdomain }] },
      });
      if (existing) {
        throw new ConflictException(
          existing.slug === dto.slug
            ? `Slug '${dto.slug}' is already taken`
            : `Subdomain '${dto.subdomain}' is already taken`,
        );
      }
  
      const hashedPassword = await bcrypt.hash(dto.adminPassword, SALT_ROUNDS);
  
      const tenant = await this.prisma.$transaction(async (tx) => {
        const newTenant = await tx.tenant.create({
          data: {
            name: dto.name,
            slug: dto.slug,
            subdomain: dto.subdomain,
            licenseKey: dto.licenseKey,
            isActive: true,
          },
        });
  
        await tx.user.create({
          data: {
            email: dto.adminEmail,
            password: hashedPassword,
            firstName: dto.adminFirstName,
            lastName: dto.adminLastName,
            role: 'TENANT_ADMIN',
            tenantId: newTenant.id,
          },
        });
  
        return newTenant;
      });
  
      this.logger.log(`Tenant created: ${tenant.id} (${tenant.slug})`);
      return tenant;
    }
  
    async update(id: string, dto: UpdateTenantDto) {
      await this.findOne(id);
  
      if (dto.subdomain) {
        const conflict = await this.prisma.tenant.findFirst({
          where: { subdomain: dto.subdomain, NOT: { id } },
        });
        if (conflict) throw new ConflictException(`Subdomain '${dto.subdomain}' is already taken`);
      }
  
      const updated = await this.prisma.tenant.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.subdomain && { subdomain: dto.subdomain }),
          ...(dto.licenseKey && { licenseKey: dto.licenseKey }),
        },
      });
  
      this.logger.log(`Tenant ${id} updated`);
      return updated;
    }
  
    async suspend(id: string, reason: string) {
      await this.findOne(id);
  
      const suspended = await this.prisma.tenant.update({
        where: { id },
        data: {
          isActive: false,
          suspendReason: reason,
          suspendedAt: new Date(),
        },
      });
  
      this.logger.warn(`Tenant ${id} suspended — reason: ${reason}`);
      return suspended;
    }
  
    async reactivate(id: string) {
      await this.findOne(id);
  
      const reactivated = await this.prisma.tenant.update({
        where: { id },
        data: {
          isActive: true,
          suspendReason: null,
          suspendedAt: null,
        },
      });
  
      this.logger.log(`Tenant ${id} reactivated`);
      return reactivated;
    }
  
    async softDelete(id: string) {
      await this.findOne(id);
  
      await this.prisma.tenant.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });
  
      this.logger.warn(`Tenant ${id} soft-deleted`);
      return { success: true, message: `Tenant ${id} has been deactivated` };
    }
  
    async getStatistics() {
      const [total, active] = await this.prisma.$transaction([
        this.prisma.tenant.count({ where: { deletedAt: null } }),
        this.prisma.tenant.count({ where: { isActive: true, deletedAt: null } }),
      ]);
  
      return { total, active, inactive: total - active };
    }
  }