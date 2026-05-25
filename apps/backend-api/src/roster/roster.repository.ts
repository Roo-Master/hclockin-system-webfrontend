import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface ShiftTemplateListFilters {
  search?: string;
  type?: string;
  isActive?: boolean;
  skip: number;
  take: number;
}

@Injectable()
export class RosterRepository {
  constructor(private readonly database: DatabaseService) {}

  async listShiftTemplates(tenantId: string, filters: ShiftTemplateListFilters) {
    const where: any = {
      tenantId,
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.isActive === undefined ? {} : { isActive: filters.isActive }),
      ...(filters.search ? { name: { contains: filters.search, mode: 'insensitive' } } : {}),
    };

    const [items, total] = await this.database.client.$transaction([
      this.database.client.shiftTemplate.findMany({
        where,
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
        skip: filters.skip,
        take: filters.take,
      }),
      this.database.client.shiftTemplate.count({ where }),
    ]);

    return { items, total };
  }

  async findShiftTemplateOrThrow(tenantId: string, shiftTemplateId: string) {
    const shiftTemplate = await this.database.client.shiftTemplate.findFirst({
      where: { id: shiftTemplateId, tenantId },
    });

    if (!shiftTemplate) {
      throw new NotFoundException('Shift template was not found for this tenant.');
    }

    return shiftTemplate;
  }

  async createShiftTemplate(tenantId: string, data: any) {
    return this.database.client.shiftTemplate.create({ data: { ...data, tenantId } });
  }

  async updateShiftTemplate(tenantId: string, id: string, data: any) {
    await this.findShiftTemplateOrThrow(tenantId, id);
    return this.database.client.shiftTemplate.update({ where: { id }, data });
  }

  async assertEmployeesBelongToTenant(tenantId: string, employeeIds: string[]) {
    const employees = await this.database.client.user.findMany({
      where: { tenantId, id: { in: employeeIds }, deletedAt: null },
      select: { id: true, departmentId: true },
    });

    if (employees.length !== employeeIds.length) {
      throw new NotFoundException('One or more employees were not found for this tenant.');
    }

    return employees;
  }

  async assertDepartmentBelongsToTenant(tenantId: string, departmentId: string): Promise<void> {
    const department = await this.database.client.department.findFirst({
      where: { tenantId, id: departmentId },
      select: { id: true },
    });

    if (!department) {
      throw new NotFoundException('Department was not found for this tenant.');
    }
  }

  async assignEmployees(tenantId: string, shiftTemplateId: string, rows: any[]) {
    return this.database.client.$transaction(async (tx) => {
      const results = [];

      for (const row of rows) {
        const existing = await tx.rosterAssignment.findUnique({
          where: { userId_date: { userId: row.userId, date: row.date } },
        });

        if (existing) {
          const updated = await tx.rosterAssignment.update({
            where: { id: existing.id },
            data: {
              tenantId,
              departmentId: row.departmentId,
              shiftTemplateId,
              overriddenHourlyRate: row.overriddenHourlyRate,
              status: 'UNVERIFIED',
              effectiveFrom: row.effectiveFrom,
              effectiveTo: row.effectiveTo,
              assignedByUserId: row.assignedByUserId,
              unassignedAt: null,
              unassignedReason: null,
            },
          });

          await tx.rosterAssignmentHistory.create({
            data: {
              tenantId,
              rosterAssignmentId: updated.id,
              userId: row.userId,
              previousShiftTemplateId: existing.shiftTemplateId,
              newShiftTemplateId: shiftTemplateId,
              previousDepartmentId: existing.departmentId,
              newDepartmentId: row.departmentId,
              previousStatus: existing.status,
              newStatus: 'UNVERIFIED',
              effectiveDate: row.date,
              action: existing.shiftTemplateId === shiftTemplateId ? 'ASSIGNED' : 'REASSIGNED',
              reason: row.reason,
              actorUserId: row.assignedByUserId,
            },
          });

          results.push(updated);
          continue;
        }

        const created = await tx.rosterAssignment.create({
          data: {
            tenantId,
            userId: row.userId,
            departmentId: row.departmentId,
            shiftTemplateId,
            date: row.date,
            overriddenHourlyRate: row.overriddenHourlyRate,
            status: 'UNVERIFIED',
            effectiveFrom: row.effectiveFrom,
            effectiveTo: row.effectiveTo,
            assignedByUserId: row.assignedByUserId,
          },
        });

        await tx.rosterAssignmentHistory.create({
          data: {
            tenantId,
            rosterAssignmentId: created.id,
            userId: row.userId,
            newShiftTemplateId: shiftTemplateId,
            newDepartmentId: row.departmentId,
            newStatus: 'UNVERIFIED',
            effectiveDate: row.date,
            action: 'ASSIGNED',
            reason: row.reason,
            actorUserId: row.assignedByUserId,
          },
        });

        results.push(created);
      }

      return results;
    });
  }

  async unassignEmployees(tenantId: string, shiftTemplateId: string, rows: any[]) {
    return this.database.client.$transaction(async (tx) => {
      const results = [];

      for (const row of rows) {
        const existing = await tx.rosterAssignment.findFirst({
          where: {
            tenantId,
            userId: row.userId,
            shiftTemplateId,
            date: row.date,
          },
        });

        if (!existing) {
          throw new ConflictException('One or more employees are not assigned to this shift for the requested date range.');
        }

        const updated = await tx.rosterAssignment.update({
          where: { id: existing.id },
          data: {
            status: 'CANCELLED',
            unassignedAt: new Date(),
            unassignedReason: row.reason,
          },
        });

        await tx.rosterAssignmentHistory.create({
          data: {
            tenantId,
            rosterAssignmentId: existing.id,
            userId: row.userId,
            previousShiftTemplateId: existing.shiftTemplateId,
            previousDepartmentId: existing.departmentId,
            previousStatus: existing.status,
            newStatus: 'CANCELLED',
            effectiveDate: row.date,
            action: 'UNASSIGNED',
            reason: row.reason,
            actorUserId: row.actorUserId,
          },
        });

        results.push(updated);
      }

      return results;
    });
  }
}
