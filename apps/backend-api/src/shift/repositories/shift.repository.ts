import { Injectable } from '@nestjs/common';
import { EmployeeShiftStatus, Prisma } from '@chronos/database';
import { DatabaseService } from '../../database/database.service';
import { QueryShiftsDto } from '../dto/query-shifts.dto';
import { getPagination } from '../../common/pagination/pagination.util';

type PrismaTx = Omit<DatabaseService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

@Injectable()
export class ShiftRepository {
  constructor(private readonly db: DatabaseService) {}

  create(data: Prisma.ShiftUncheckedCreateInput | Record<string, unknown>, tx: PrismaTx = this.db) {
    return tx.shift.create({ data: data as Prisma.ShiftUncheckedCreateInput, select: this.detailSelect() });
  }

  findMany(tenantId: string, query: QueryShiftsDto) {
    const { skip, take, page, limit } = getPagination(query.page, query.limit);
    const where = this.buildWhere(tenantId, query);

    return this.db.$transaction(async (tx) => {
      const [data, total] = await Promise.all([
        tx.shift.findMany({
          where,
          skip,
          take,
          orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
          select: this.listSelect()
        }),
        tx.shift.count({ where })
      ]);

      return { data, total, page, limit };
    });
  }

  findById(tenantId: string, id: string, tx: PrismaTx = this.db) {
    return tx.shift.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: this.detailSelect()
    });
  }

  findAssignableById(tenantId: string, id: string, tx: PrismaTx = this.db) {
    return tx.shift.findFirst({
      where: { id, tenantId, deletedAt: null, isActive: true },
      select: { id: true, tenantId: true, departmentId: true, effectiveFrom: true, effectiveTo: true }
    });
  }

  update(tenantId: string, id: string, data: Prisma.ShiftUncheckedUpdateInput, tx: PrismaTx = this.db) {
    return tx.shift.update({
      where: { id, tenantId },
      data,
      select: this.detailSelect()
    });
  }

  closeActiveAssignments(
    tenantId: string,
    employeeIds: string[],
    effectiveTo: Date,
    userId: string,
    reason: string | undefined,
    tx: PrismaTx
  ) {
    return tx.employeeShift.updateMany({
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        status: EmployeeShiftStatus.ACTIVE,
        effectiveTo: null
      },
      data: {
        status: EmployeeShiftStatus.ENDED,
        effectiveTo,
        unassignedById: userId,
        reason
      }
    });
  }

  createAssignments(
    tenantId: string,
    shiftId: string,
    employeeIds: string[],
    effectiveFrom: Date,
    assignedById: string,
    reason: string | undefined,
    tx: PrismaTx
  ) {
    return tx.employeeShift.createMany({
      data: employeeIds.map((employeeId) => ({
        tenantId,
        employeeId,
        shiftId,
        effectiveFrom,
        status: EmployeeShiftStatus.ACTIVE,
        assignedById,
        reason
      }))
    });
  }

  softDeleteAssignmentsForShift(tenantId: string, shiftId: string, effectiveTo: Date, userId: string, tx: PrismaTx) {
    return tx.employeeShift.updateMany({
      where: { tenantId, shiftId, status: EmployeeShiftStatus.ACTIVE, effectiveTo: null },
      data: { status: EmployeeShiftStatus.ENDED, effectiveTo, unassignedById: userId, reason: 'Shift deleted' }
    });
  }

  transaction<T>(callback: (tx: PrismaTx) => Promise<T>) {
    return this.db.$transaction(callback);
  }

  private buildWhere(tenantId: string, query: QueryShiftsDto): Prisma.ShiftWhereInput {
    const where: Prisma.ShiftWhereInput = { tenantId, deletedAt: null };

    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.scheduleType) where.scheduleType = query.scheduleType;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }
    if (query.effectiveOn) {
      const date = new Date(query.effectiveOn);
      where.effectiveFrom = { lte: date };
      where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }] }];
    }

    return where;
  }

  private listSelect(): Prisma.ShiftSelect {
    return {
      id: true,
      tenantId: true,
      departmentId: true,
      name: true,
      code: true,
      scheduleType: true,
      startTime: true,
      endTime: true,
      isOvernight: true,
      isActive: true,
      effectiveFrom: true,
      effectiveTo: true,
      gracePeriodMinutes: true,
      breakMinutes: true,
      overtimeAllowed: true,
      deletedAt: true,
      department: { select: { id: true, name: true, code: true } },
      _count: { select: { assignments: true } }
    };
  }

  private detailSelect(): Prisma.ShiftSelect {
    return {
      ...this.listSelect(),
      description: true,
      earlyClockInMinutes: true,
      lateAfterMinutes: true,
      earlyClockOutMinutes: true,
      overtimeAfterMinutes: true,
      rotationPattern: true,
      metadata: true,
      createdById: true,
      updatedById: true,
      deletedById: true,
      createdAt: true,
      updatedAt: true,
      assignments: {
        where: { status: EmployeeShiftStatus.ACTIVE, effectiveTo: null },
        take: 25,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          employeeId: true,
          effectiveFrom: true,
          effectiveTo: true,
          employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true } }
        }
      }
    };
  }
}
