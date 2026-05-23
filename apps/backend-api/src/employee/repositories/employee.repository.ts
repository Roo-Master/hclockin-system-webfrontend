import { Injectable } from '@nestjs/common';
import { EmployeeShiftStatus, Prisma } from '@chronos/database';
import { DatabaseService } from '../../database/database.service';
import { QueryEmployeesDto } from '../dto/query-employees.dto';
import { getPagination } from '../../common/pagination/pagination.util';

type PrismaTx = Omit<DatabaseService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

@Injectable()
export class EmployeeRepository {
  constructor(private readonly db: DatabaseService) {}

  create(data: Prisma.EmployeeUncheckedCreateInput | Record<string, unknown>, tx: PrismaTx = this.db) {
    return tx.employee.create({ data: data as Prisma.EmployeeUncheckedCreateInput, select: this.detailSelect() });
  }

  findMany(tenantId: string, query: QueryEmployeesDto) {
    const { skip, take, page, limit } = getPagination(query.page, query.limit);
    const where = this.buildWhere(tenantId, query);

    return this.db.$transaction(async (tx) => {
      const [data, total] = await Promise.all([
        tx.employee.findMany({
          where,
          skip,
          take,
          orderBy: [{ employeeStatus: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
          select: this.listSelect()
        }),
        tx.employee.count({ where })
      ]);

      return { data, total, page, limit };
    });
  }

  findById(tenantId: string, id: string, tx: PrismaTx = this.db) {
    return tx.employee.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: this.detailSelect()
    });
  }

  findManyExisting(tenantId: string, employeeIds: string[], tx: PrismaTx = this.db) {
    return tx.employee.findMany({
      where: { tenantId, id: { in: employeeIds }, deletedAt: null },
      select: { id: true, departmentId: true, employeeStatus: true }
    });
  }

  update(tenantId: string, id: string, data: Prisma.EmployeeUncheckedUpdateInput, tx: PrismaTx = this.db) {
    return tx.employee.update({
      where: { id, tenantId },
      data,
      select: this.detailSelect()
    });
  }

  createShiftAssignment(
    tenantId: string,
    employeeId: string,
    shiftId: string,
    effectiveFrom: Date,
    assignedById: string,
    tx: PrismaTx
  ) {
    return tx.employeeShift.create({
      data: {
        tenantId,
        employeeId,
        shiftId,
        effectiveFrom,
        status: EmployeeShiftStatus.ACTIVE,
        assignedById,
        reason: 'Initial employee shift assignment'
      }
    });
  }

  transaction<T>(callback: (tx: PrismaTx) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  private buildWhere(tenantId: string, query: QueryEmployeesDto): Prisma.EmployeeWhereInput {
    const where: Prisma.EmployeeWhereInput = { tenantId, deletedAt: null };

    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.employmentType) where.employmentType = query.employmentType;
    if (query.employeeStatus) where.employeeStatus = query.employeeStatus;
    if (query.search) {
      where.OR = [
        { employeeCode: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { deviceUserId: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    return where;
  }

  private listSelect(): Prisma.EmployeeSelect {
    return {
      id: true,
      tenantId: true,
      departmentId: true,
      userId: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      jobTitle: true,
      deviceUserId: true,
      employmentType: true,
      employeeStatus: true,
      profilePhotoUrl: true,
      hiredAt: true,
      terminatedAt: true,
      deletedAt: true,
      department: { select: { id: true, name: true, code: true } },
      shiftHistory: {
        where: { status: EmployeeShiftStatus.ACTIVE, effectiveTo: null },
        take: 1,
        select: {
          id: true,
          shiftId: true,
          effectiveFrom: true,
          shift: { select: { id: true, name: true, code: true, startTime: true, endTime: true, isOvernight: true } }
        }
      }
    };
  }

  private detailSelect(): Prisma.EmployeeSelect {
    return {
      ...this.listSelect(),
      emergencyContactName: true,
      emergencyContactPhone: true,
      emergencyContactRelation: true,
      metadata: true,
      createdById: true,
      updatedById: true,
      deletedById: true,
      createdAt: true,
      updatedAt: true,
      shiftHistory: {
        orderBy: { effectiveFrom: 'desc' },
        take: 20,
        select: {
          id: true,
          shiftId: true,
          status: true,
          effectiveFrom: true,
          effectiveTo: true,
          reason: true,
          shift: { select: { id: true, name: true, code: true, startTime: true, endTime: true, isOvernight: true } }
        }
      }
    };
  }
}
