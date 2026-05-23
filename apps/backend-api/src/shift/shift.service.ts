import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@chronos/database';
import { DatabaseService } from '../database/database.service';
import { CurrentUserPayload } from '../common/types/current-user.type';
import { toPaginatedResult } from '../common/pagination/pagination.util';
import { AssignEmployeesDto } from './dto/assign-employees.dto';
import { CreateShiftDto } from './dto/create-shift.dto';
import { QueryShiftsDto } from './dto/query-shifts.dto';
import { UnassignEmployeesDto } from './dto/unassign-employees.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftRepository } from './repositories/shift.repository';

@Injectable()
export class ShiftService {
  private readonly logger = new Logger(ShiftService.name);

  constructor(
    private readonly shifts: ShiftRepository,
    private readonly db: DatabaseService
  ) {}

  async create(dto: CreateShiftDto, user: CurrentUserPayload) {
    await this.assertDepartmentBelongsToHospital(user.hospitalId, dto.departmentId);
    this.assertEffectiveDates(dto.effectiveFrom, dto.effectiveTo);

    try {
      return await this.shifts.create({
        ...this.toShiftData(dto),
        tenantId: user.hospitalId,
        isOvernight: this.isOvernight(dto.startTime, dto.endTime),
        createdById: user.userId,
        updatedById: user.userId
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: QueryShiftsDto, user: CurrentUserPayload) {
    const result = await this.shifts.findMany(user.hospitalId, query);
    return toPaginatedResult(result.data, result.total, result.page, result.limit);
  }

  async findOne(id: string, user: CurrentUserPayload) {
    const shift = await this.shifts.findById(user.hospitalId, id);
    if (!shift) {
      throw new NotFoundException('Shift not found.');
    }
    return shift;
  }

  async update(id: string, dto: UpdateShiftDto, user: CurrentUserPayload) {
    const existing = await this.findOne(id, user);
    await this.assertDepartmentBelongsToHospital(user.hospitalId, dto.departmentId);
    this.assertEffectiveDates(dto.effectiveFrom ?? existing.effectiveFrom.toISOString(), dto.effectiveTo ?? existing.effectiveTo?.toISOString());

    try {
      return await this.shifts.update(user.hospitalId, id, {
        ...this.toShiftData(dto),
        isOvernight: dto.startTime || dto.endTime ? this.isOvernight(dto.startTime ?? existing.startTime, dto.endTime ?? existing.endTime) : undefined,
        updatedById: user.userId
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string, user: CurrentUserPayload) {
    await this.findOne(id, user);
    const today = this.toDateOnly(new Date().toISOString());

    return this.shifts.transaction(async (tx) => {
      await this.shifts.softDeleteAssignmentsForShift(user.hospitalId, id, today, user.userId, tx);
      return this.shifts.update(
        user.hospitalId,
        id,
        { isActive: false, deletedAt: new Date(), deletedById: user.userId, updatedById: user.userId },
        tx
      );
    });
  }

  async assignEmployees(id: string, dto: AssignEmployeesDto, user: CurrentUserPayload) {
    const effectiveFrom = this.toDateOnly(dto.effectiveFrom);

    return this.shifts.transaction(async (tx) => {
      const shift = await this.shifts.findAssignableById(user.hospitalId, id, tx);
      if (!shift) {
        throw new NotFoundException('Active shift not found.');
      }
      this.assertDateWithinShiftWindow(effectiveFrom, shift.effectiveFrom, shift.effectiveTo);

      const employees = await tx.employee.findMany({
        where: { tenantId: user.hospitalId, id: { in: dto.employeeIds }, deletedAt: null },
        select: { id: true, departmentId: true, employeeStatus: true }
      });

      if (employees.length !== new Set(dto.employeeIds).size) {
        throw new BadRequestException('One or more employees do not exist in this hospital.');
      }

      const invalidDepartment = shift.departmentId && employees.some((employee) => employee.departmentId !== shift.departmentId);
      if (invalidDepartment) {
        throw new BadRequestException('All employees must belong to the shift department.');
      }

      const closeDate = new Date(effectiveFrom);
      closeDate.setUTCDate(closeDate.getUTCDate() - 1);
      await this.shifts.closeActiveAssignments(user.hospitalId, dto.employeeIds, closeDate, user.userId, dto.reason, tx);
      const created = await this.shifts.createAssignments(user.hospitalId, id, dto.employeeIds, effectiveFrom, user.userId, dto.reason, tx);

      this.logger.log(`Assigned ${created.count} employee(s) to shift ${id} for hospital ${user.hospitalId}`);
      return { assigned: created.count };
    });
  }

  async unassignEmployees(id: string, dto: UnassignEmployeesDto, user: CurrentUserPayload) {
    await this.findOne(id, user);
    const effectiveTo = this.toDateOnly(dto.effectiveTo);

    const result = await this.db.employeeShift.updateMany({
      where: {
        tenantId: user.hospitalId,
        shiftId: id,
        employeeId: { in: dto.employeeIds },
        status: 'ACTIVE',
        effectiveTo: null
      },
      data: {
        status: 'ENDED',
        effectiveTo,
        unassignedById: user.userId,
        reason: dto.reason
      }
    });

    return { unassigned: result.count };
  }

  private toShiftData(dto: Partial<CreateShiftDto>): Record<string, unknown> {
    return {
      name: dto.name,
      code: dto.code,
      description: dto.description,
      departmentId: dto.departmentId,
      scheduleType: dto.scheduleType,
      startTime: dto.startTime,
      endTime: dto.endTime,
      isActive: dto.isActive,
      effectiveFrom: dto.effectiveFrom ? this.toDateOnly(dto.effectiveFrom) : undefined,
      effectiveTo: dto.effectiveTo ? this.toDateOnly(dto.effectiveTo) : null,
      gracePeriodMinutes: dto.gracePeriodMinutes,
      earlyClockInMinutes: dto.earlyClockInMinutes,
      lateAfterMinutes: dto.lateAfterMinutes,
      earlyClockOutMinutes: dto.earlyClockOutMinutes,
      breakMinutes: dto.breakMinutes,
      overtimeAllowed: dto.overtimeAllowed,
      overtimeAfterMinutes: dto.overtimeAfterMinutes,
      rotationPattern: dto.rotationPattern as Prisma.InputJsonValue,
      metadata: dto.metadata as Prisma.InputJsonValue
    };
  }

  private async assertDepartmentBelongsToHospital(tenantId: string, departmentId?: string | null) {
    if (!departmentId) return;
    const department = await this.db.department.findFirst({ where: { id: departmentId, tenantId }, select: { id: true } });
    if (!department) {
      throw new BadRequestException('Department does not exist in this hospital.');
    }
  }

  private assertEffectiveDates(effectiveFrom?: string, effectiveTo?: string) {
    if (effectiveFrom && effectiveTo && this.toDateOnly(effectiveFrom) > this.toDateOnly(effectiveTo)) {
      throw new BadRequestException('effectiveTo must be on or after effectiveFrom.');
    }
  }

  private assertDateWithinShiftWindow(date: Date, effectiveFrom: Date, effectiveTo?: Date | null) {
    if (date < effectiveFrom || (effectiveTo && date > effectiveTo)) {
      throw new BadRequestException('Assignment date must be within the shift effective window.');
    }
  }

  private isOvernight(startTime: string, endTime: string) {
    return endTime <= startTime;
  }

  private toDateOnly(value: string) {
    return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Shift code must be unique within the hospital.');
    }
    throw error;
  }
}
