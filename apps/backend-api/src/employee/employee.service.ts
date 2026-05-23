import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EmployeeStatus, Prisma } from '@chronos/database';
import { CurrentUserPayload } from '../common/types/current-user.type';
import { toPaginatedResult } from '../common/pagination/pagination.util';
import { DatabaseService } from '../database/database.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryEmployeesDto } from './dto/query-employees.dto';
import { UpdateDeviceUserDto } from './dto/update-device-user.dto';
import { UpdateEmployeeDepartmentDto } from './dto/update-employee-department.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeRepository } from './repositories/employee.repository';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly employees: EmployeeRepository,
    private readonly db: DatabaseService
  ) {}

  async create(dto: CreateEmployeeDto, user: CurrentUserPayload) {
    await this.assertDepartmentBelongsToHospital(user.hospitalId, dto.departmentId);
    await this.assertUserBelongsToHospital(user.hospitalId, dto.userId);
    if (dto.shiftId) {
      await this.assertShiftBelongsToHospital(user.hospitalId, dto.shiftId);
    }

    try {
      return await this.employees.transaction(async (tx) => {
        const employee = await this.employees.create(
          {
            ...this.toEmployeeData(dto),
            tenantId: user.hospitalId,
            createdById: user.userId,
            updatedById: user.userId
          },
          tx
        );

        if (dto.shiftId) {
          await this.employees.createShiftAssignment(
            user.hospitalId,
            employee.id,
            dto.shiftId,
            this.toDateOnly(dto.shiftEffectiveFrom ?? dto.hiredAt ?? new Date().toISOString()),
            user.userId,
            tx
          );
        }

        return this.employees.findById(user.hospitalId, employee.id, tx);
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: QueryEmployeesDto, user: CurrentUserPayload) {
    const result = await this.employees.findMany(user.hospitalId, query);
    return toPaginatedResult(result.data, result.total, result.page, result.limit);
  }

  async findOne(id: string, user: CurrentUserPayload) {
    const employee = await this.employees.findById(user.hospitalId, id);
    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto, user: CurrentUserPayload) {
    await this.findOne(id, user);
    await this.assertDepartmentBelongsToHospital(user.hospitalId, dto.departmentId);
    await this.assertUserBelongsToHospital(user.hospitalId, dto.userId);

    try {
      return await this.employees.update(user.hospitalId, id, {
        ...this.toEmployeeData(dto),
        updatedById: user.userId
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string, user: CurrentUserPayload) {
    await this.findOne(id, user);

    return this.employees.update(user.hospitalId, id, {
      employeeStatus: EmployeeStatus.TERMINATED,
      terminatedAt: new Date(),
      deletedAt: new Date(),
      deletedById: user.userId,
      updatedById: user.userId
    });
  }

  async updateStatus(id: string, dto: UpdateEmployeeStatusDto, user: CurrentUserPayload) {
    await this.findOne(id, user);

    return this.employees.update(user.hospitalId, id, {
      employeeStatus: dto.employeeStatus,
      terminatedAt: dto.employeeStatus === EmployeeStatus.TERMINATED ? this.toDateOnly(dto.effectiveDate ?? new Date().toISOString()) : null,
      updatedById: user.userId
    });
  }

  async updateDepartment(id: string, dto: UpdateEmployeeDepartmentDto, user: CurrentUserPayload) {
    await this.findOne(id, user);
    await this.assertDepartmentBelongsToHospital(user.hospitalId, dto.departmentId);

    return this.employees.update(user.hospitalId, id, {
      departmentId: dto.departmentId ?? null,
      updatedById: user.userId
    });
  }

  async updateDeviceUser(id: string, dto: UpdateDeviceUserDto, user: CurrentUserPayload) {
    await this.findOne(id, user);

    try {
      return await this.employees.update(user.hospitalId, id, {
        deviceUserId: dto.deviceUserId ?? null,
        updatedById: user.userId
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private toEmployeeData(dto: Partial<CreateEmployeeDto>): Record<string, unknown> {
    const { shiftId: _shiftId, shiftEffectiveFrom: _shiftEffectiveFrom, ...employeeDto } = dto;
    return {
      employeeCode: employeeDto.employeeCode,
      firstName: employeeDto.firstName,
      lastName: employeeDto.lastName,
      email: employeeDto.email,
      phone: employeeDto.phone,
      departmentId: employeeDto.departmentId,
      userId: employeeDto.userId,
      jobTitle: employeeDto.jobTitle,
      deviceUserId: employeeDto.deviceUserId,
      employmentType: employeeDto.employmentType,
      employeeStatus: employeeDto.employeeStatus,
      emergencyContactName: employeeDto.emergencyContactName,
      emergencyContactPhone: employeeDto.emergencyContactPhone,
      emergencyContactRelation: employeeDto.emergencyContactRelation,
      profilePhotoUrl: employeeDto.profilePhotoUrl,
      hiredAt: employeeDto.hiredAt ? this.toDateOnly(employeeDto.hiredAt) : undefined,
      metadata: employeeDto.metadata as Prisma.InputJsonValue
    };
  }

  private async assertDepartmentBelongsToHospital(tenantId: string, departmentId?: string | null) {
    if (!departmentId) return;
    const department = await this.db.department.findFirst({ where: { id: departmentId, tenantId }, select: { id: true } });
    if (!department) {
      throw new BadRequestException('Department does not exist in this hospital.');
    }
  }

  private async assertUserBelongsToHospital(tenantId: string, userId?: string | null) {
    if (!userId) return;
    const user = await this.db.user.findFirst({ where: { id: userId, tenantId }, select: { id: true } });
    if (!user) {
      throw new BadRequestException('User does not exist in this hospital.');
    }
  }

  private async assertShiftBelongsToHospital(tenantId: string, shiftId: string) {
    const shift = await this.db.shift.findFirst({ where: { id: shiftId, tenantId, deletedAt: null, isActive: true }, select: { id: true } });
    if (!shift) {
      throw new BadRequestException('Shift does not exist in this hospital.');
    }
  }

  private toDateOnly(value: string) {
    return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Employee code and device user ID must be unique within the hospital.');
    }
    throw error;
  }
}
