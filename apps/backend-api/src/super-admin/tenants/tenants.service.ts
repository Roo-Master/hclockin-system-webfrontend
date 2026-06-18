import { Injectable, NotFoundException } from '@nestjs/common';
// TODO: inject PrismaService from packages/database

@Injectable()
export class TenantsService {
  async findAll(filters: { status?: string; plan?: string }) {
    // TODO: return prisma.tenant.findMany({ where: filters })
    return [];
  }

  async findOne(id: string) {
    // TODO: return prisma.tenant.findUniqueOrThrow({ where: { id } })
    return null;
  }

  async create(dto: any) {
    // TODO: prisma.tenant.create + create default admin account
    return null;
  }

  async update(id: string, dto: any) {
    // TODO: prisma.tenant.update
    return null;
  }

  async suspend(id: string, reason: string) {
    // TODO: prisma.tenant.update({ status: SUSPENDED, suspendReason: reason })
    return null;
  }

  async reactivate(id: string) {
    // TODO: prisma.tenant.update({ status: ACTIVE })
    return null;
  }

  async remove(id: string) {
    // TODO: soft delete
    return null;
  }
}
