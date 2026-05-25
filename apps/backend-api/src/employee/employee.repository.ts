import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface EmployeeListFilters {
  search?: string;
  departmentId?: string;
  employmentStatus?: string;
  employmentType?: string;
  includeDeleted?: boolean;
  skip: number;
  take: number;
}

@Injectable()
export class EmployeeRepository {
  constructor(private readonly database: DatabaseService) {}

  async list(tenantId: string, filters: EmployeeListFilters) {
    const where: any = {
      tenantId,
      ...(filters.includeDeleted ? {} : { deletedAt: null }),
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
      ...(filters.employmentStatus ? { employmentStatus: filters.employmentStatus } : {}),
      ...(filters.employmentType ? { employmentType: filters.employmentType } : {}),
      ...(filters.search
        ? {
            OR: [
              { firstName: { contains: filters.search, mode: 'insensitive' } },
              { lastName: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
              { payrollNumber: { contains: filters.search, mode: 'insensitive' } },
              { devicePin: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.database.client.$transaction([
      this.database.client.user.findMany({
        where,
        include: { department: true },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: filters.skip,
        take: filters.take,
      }),
      this.database.client.user.count({ where }),
    ]);

    return { items, total };
  }

  async findByIdOrThrow(tenantId: string, id: string, includeDeleted = false) {
    const employee = await this.database.client.user.findFirst({
      where: {
        id,
        tenantId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: { department: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee was not found for this tenant.');
    }

    return employee;
  }

  async assertDepartmentBelongsToTenant(tenantId: string, departmentId: string): Promise<void> {
    const department = await this.database.client.department.findFirst({
      where: { id: departmentId, tenantId },
      select: { id: true },
    });

    if (!department) {
      throw new NotFoundException('Department was not found for this tenant.');
    }
  }

  async create(tenantId: string, data: any) {
    try {
      return await this.database.client.user.create({
        data: { ...data, tenantId },
        include: { department: true },
      });
    } catch (error) {
      this.rethrowKnownUniqueError(error);
      throw error;
    }
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findByIdOrThrow(tenantId, id);

    try {
      return await this.database.client.user.update({
        where: { id },
        data,
        include: { department: true },
      });
    } catch (error) {
      this.rethrowKnownUniqueError(error);
      throw error;
    }
  }

  async softDelete(tenantId: string, id: string) {
    await this.findByIdOrThrow(tenantId, id);

    return this.database.client.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        employmentStatus: 'TERMINATED',
      },
      include: { department: true },
    });
  }

  private rethrowKnownUniqueError(error: unknown): void {
    const code = (error as { code?: string }).code;

    if (code === 'P2002') {
      throw new ConflictException('Employee code, email, or device user id already exists for this tenant.');
    }
  }
}
