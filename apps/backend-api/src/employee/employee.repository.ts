import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface EmployeeListFilters {
  search?: string;
  departmentId?: string;
  employmentStatus?: string;
  employmentType?: string;
  includeDeleted?: boolean;
  accessibleDepartmentIds?: string[];
  skip: number;
  take: number;
}

@Injectable()
export class EmployeeRepository {
  constructor(private readonly database: PrismaService) {}

    const where: any = {
      ...(filters.includeDeleted ? {} : { deletedAt: null }),
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
      ...(filters.accessibleDepartmentIds ? { departmentId: { in: filters.accessibleDepartmentIds } } : {}),
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

    // ✅ DatabaseService extends PrismaClient directly — no .client needed
    const [items, total] = await this.database.$transaction([
      this.database.user.findMany({
        where,
        select: this.employeeSelect(),
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: filters.skip,
        take: filters.take,
      }),
      this.database.user.count({ where }),
    ]);

    return { items, total };
  }

    const employee = await this.database.user.findFirst({  // ✅ no .client
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      select: this.employeeSelect(),
    });

    if (!employee) {
    }

    return employee;
  }

    const department = await this.database.department.findFirst({  // ✅ no .client
      select: { id: true },
    });

    if (!department) {
    }
  }

    try {
      return await this.database.$transaction(async (tx) => {  // ✅ no .client
        const employee = await tx.user.create({
          select: this.employeeSelect(),
        });

        if (audit) {
          await tx.employeeAudit.create({
            data: {
              employeeId: employee.id,
              actorUserId: audit.actorUserId,
              action: audit.action,
              previousValue: audit.previousValue,
              newValue: audit.newValue,
            },
          });
        }

        return employee;
      });
    } catch (error) {
      this.rethrowKnownUniqueError(error);
      throw error;
    }
  }


    try {
      return await this.database.$transaction(async (tx) => {  // ✅ already correct
        const result = await tx.user.updateMany({
          data,
        });

        if (result.count !== 1) {
        }

        if (audit) {
          await tx.employeeAudit.create({
            data: {
              employeeId: id,
              actorUserId: audit.actorUserId,
              action: audit.action,
              previousValue: audit.previousValue,
              newValue: audit.newValue,
            },
          });
        }

        return tx.user.findFirstOrThrow({
          select: this.employeeSelect(),
        });
      });
    } catch (error) {
      this.rethrowKnownUniqueError(error);
      throw error;
    }
  }


    return this.database.$transaction(async (tx) => {  // ✅ no .client
      const deletedAt = new Date();
      const result = await tx.user.updateMany({
        data: {
          deletedAt,
          isActive: false,
          employmentStatus: 'TERMINATED',
        },
      });

      if (result.count !== 1) {
      }

      await tx.employeeAudit.create({
        data: {
          employeeId: id,
          actorUserId,
          action: 'SOFT_DELETE',
          previousValue: this.lifecycleSnapshot(existing),
          newValue: { employmentStatus: 'TERMINATED', isActive: false, deletedAt: deletedAt.toISOString() },
        },
      });

      return tx.user.findFirstOrThrow({
        select: this.employeeSelect(),
      });
    });
  }


    if (!existing.deletedAt) {
      return existing;
    }

    return this.database.$transaction(async (tx) => {  // ✅ no .client
      const result = await tx.user.updateMany({
        data: {
          deletedAt: null,
          isActive: true,
          employmentStatus: 'ACTIVE',
        },
      });

      if (result.count !== 1) {
      }

      await tx.employeeAudit.create({
        data: {
          employeeId: id,
          actorUserId,
          action: 'RESTORE',
          previousValue: this.lifecycleSnapshot(existing),
          newValue: { employmentStatus: 'ACTIVE', isActive: true, deletedAt: null },
        },
      });

      return tx.user.findFirstOrThrow({
        select: this.employeeSelect(),
      });
    });
  }

  private employeeSelect() {
    return {
      id: true,
      departmentId: true,
      payrollNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      role: true,
      hourlyRate: true,
      isActive: true,
      employmentType: true,
      employmentStatus: true,
      devicePin: true,
      emergencyContacts: true,
      profileMetadata: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    };
  }

  private lifecycleSnapshot(employee: any) {
    return {
      employmentStatus: employee.employmentStatus,
      isActive: employee.isActive,
      deletedAt: employee.deletedAt?.toISOString() ?? null,
    };
  }

  private rethrowKnownUniqueError(error: unknown): void {
    const code = (error as { code?: string }).code;

    if (code === 'P2002') {
    }
  }
}