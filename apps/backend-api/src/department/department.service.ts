import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '@chronos/database';
import { UserRole } from '@chronos/types-common';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {

  // CREATE
  async create(dto: CreateDepartmentDto, tenantId: string) {
    const exists = await db.department.findFirst({
      where: { tenantId, code: dto.code },
    });

    if (exists) {
      throw new BadRequestException(
        'Department code already exists',
      );
    }

    return db.department.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        rules: dto.rules ?? {},
      },
    });
  }

  // UPDATE
  async updateDepartment(
    departmentId: string,
    dto: UpdateDepartmentDto,
    tenantId: string,
  ) {
    const department = await this.getDepartmentOrThrow(departmentId);

    if (department.tenantId !== tenantId) {
      throw new BadRequestException('Unauthorized');
    }

    if (dto.code && dto.code !== department.code) {
      const existingDepartment = await db.department.findFirst({
        where: { tenantId, code: dto.code },
      });

      if (existingDepartment && existingDepartment.id !== departmentId) {
        throw new BadRequestException('Department code already exists');
      }
    }

    return db.department.update({
      where: { id: departmentId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.code && { code: dto.code }),
        ...(dto.rules && { rules: dto.rules }),
      },
    });
  }

  // LIST
  async listDepartments(tenantId: string) {
    return db.department.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // DELETE
  async deleteDepartment(departmentId: string, tenantId: string) {
    const department = await this.getDepartmentOrThrow(departmentId);

    if (department.tenantId !== tenantId) {
      throw new BadRequestException('Unauthorized');
    }

    return db.department.delete({
      where: { id: departmentId },
    });
  }

  // ASSIGN HEAD
  async assignDepartmentHead(departmentId: string, userId: string) {
    const department = await this.getDepartmentOrThrow(departmentId);
    const user = await this.getUserOrThrow(userId);

    this.assertTenantMatch(department.tenantId, user.tenantId);

    return db.user.update({
      where: { id: userId },
      data: {
        departmentId,
        role: UserRole.DEPT_HEAD,
      },
    });
  }

  // ASSIGN STAFF
  async assignDepartmentStaff(departmentId: string, userId: string) {
    const department = await this.getDepartmentOrThrow(departmentId);
    const user = await this.getUserOrThrow(userId);

    this.assertTenantMatch(department.tenantId, user.tenantId);

    return db.user.update({
      where: { id: userId },
      data: {
        departmentId,
        role: UserRole.EMPLOYEE,
      },
    });
  }

  // STAFF LIST
  async listDepartmentStaff(departmentId: string) {
    await this.getDepartmentOrThrow(departmentId);

    return db.user.findMany({
      where: { departmentId },
    });
  }

  // HELPERS
  private async getDepartmentOrThrow(id: string) {
    const dept = await db.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  private async getUserOrThrow(id: string) {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private assertTenantMatch(a: string, b: string) {
    if (a !== b) {
      throw new BadRequestException('Tenant mismatch');
    }
  }
}