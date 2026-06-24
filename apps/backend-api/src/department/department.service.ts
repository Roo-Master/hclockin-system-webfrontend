import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@chronos/types-common';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE
    const exists = await this.prisma.client.department.findFirst({
    });

    if (exists) {
      throw new BadRequestException(
        'Department code already exists',
      );
    }

    return this.prisma.client.department.create({
      data: {
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
  ) {
    const department = await this.getDepartmentOrThrow(departmentId);

      throw new BadRequestException('Unauthorized');
    }

    if (dto.code && dto.code !== department.code) {
      const existingDepartment = await this.prisma.client.department.findFirst({
      });

      if (existingDepartment && existingDepartment.id !== departmentId) {
        throw new BadRequestException('Department code already exists');
      }
    }

    return this.prisma.client.department.update({
      where: { id: departmentId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.code && { code: dto.code }),
        ...(dto.rules && { rules: dto.rules }),
      },
    });
  }

  // LIST
    return this.prisma.client.department.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // DELETE
    const department = await this.getDepartmentOrThrow(departmentId);

      throw new BadRequestException('Unauthorized');
    }

    return this.prisma.client.department.delete({
      where: { id: departmentId },
    });
  }

  // ASSIGN HEAD
  async assignDepartmentHead(departmentId: string, userId: string) {
    const department = await this.getDepartmentOrThrow(departmentId);
    const user = await this.getUserOrThrow(userId);


    return this.prisma.client.user.update({
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


    return this.prisma.client.user.update({
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

    return this.prisma.client.user.findMany({
      where: { departmentId },
    });
  }

  // HELPERS
  private async getDepartmentOrThrow(id: string) {
    const dept = await this.prisma.client.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  private async getUserOrThrow(id: string) {
    const user = await this.prisma.client.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private assertTenantMatch(a: string, b: string) {
    if (a !== b) {
      throw new BadRequestException('Tenant mismatch');
    }
  }
}