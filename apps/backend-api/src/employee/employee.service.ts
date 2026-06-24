import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  EmployeeCreateDTO,
  EmployeeDepartmentUpdateDTO,
  EmployeeDeviceUserUpdateDTO,
  EmployeeQueryDTO,
  EmployeeResponseDTO,
  EmployeeStatusUpdateDTO,
  EmployeeUpdateDTO,
  EmploymentStatus,
  EmploymentType,
  UserRole,
} from '@chronos/types-common';
import { normalizePagination, paginatedResponse } from '../common/pagination';
import {
  assertEnumValue,
  assertOptionalEnumValue,
  assertOptionalNumber,
  assertOptionalString,
  assertPlainObject,
  assertRequiredString,
  assertUuid,
} from '../common/validation';
import { AuthenticatedUser } from '../common/auth/authenticated-user';
import { assertCanAssignRole, hasDepartmentScopedEmployeeAccess, hasTenantWideEmployeeAccess } from '../common/auth/role-policy';
import { EmployeeRepository } from './employee.repository';

@Injectable()
export class EmployeeService {
  private static readonly passwordSaltRounds = 12;

  constructor(private readonly employeeRepository: EmployeeRepository) {}

    const departmentId = payload.departmentId;
    const targetRole = payload.role ? assertEnumValue(payload.role, UserRole, 'role') : UserRole.EMPLOYEE;

    assertCanAssignRole(actor, targetRole);

    if (departmentId) {
      assertUuid(departmentId, 'departmentId');
    }

    if (hasDepartmentScopedEmployeeAccess(actor.role) && departmentId !== actor.deptId) {
      throw new ForbiddenException('You can only create employees in your assigned department.');
    }

    const password = assertRequiredString(payload.password, 'password', 128);
    const passwordHash = await bcrypt.hash(password, EmployeeService.passwordSaltRounds);

      payrollNumber: assertRequiredString(payload.employeeCode, 'employeeCode', 50),
      firstName: assertRequiredString(payload.firstName, 'firstName', 100),
      lastName: assertRequiredString(payload.lastName, 'lastName', 100),
      email: assertRequiredString(payload.email, 'email', 255).toLowerCase(),
      passwordHash,
      phoneNumber: assertOptionalString(payload.phoneNumber, 'phoneNumber', 30),
      departmentId: departmentId ?? null,
      devicePin: assertRequiredString(payload.deviceUserId, 'deviceUserId', 50),
      role: targetRole,
      hourlyRate: assertOptionalNumber(payload.hourlyRate, 'hourlyRate') ?? 0,
      employmentType: payload.employmentType
        ? assertEnumValue(payload.employmentType, EmploymentType, 'employmentType')
        : EmploymentType.FULL_TIME,
      employmentStatus: payload.employmentStatus
        ? assertEnumValue(payload.employmentStatus, EmploymentStatus, 'employmentStatus')
        : EmploymentStatus.ACTIVE,
      emergencyContacts: this.normalizeEmergencyContacts(payload.emergencyContacts),
      profileMetadata: assertPlainObject(payload.profileMetadata, 'profileMetadata') ?? {},
      isActive: (payload.employmentStatus ?? EmploymentStatus.ACTIVE) === EmploymentStatus.ACTIVE,
    }, {
      actorUserId: actor.userId,
      action: 'CREATE',
      previousValue: null,
      newValue: {
        employeeCode: payload.employeeCode,
        email: assertRequiredString(payload.email, 'email', 255).toLowerCase(),
        role: targetRole,
        departmentId: departmentId ?? null,
      },
    });

    return this.toResponse(employee);
  }

    const pagination = normalizePagination(query.page, query.limit);
    const search = assertOptionalString(query.search, 'search', 100);
    const departmentId = assertOptionalString(query.departmentId, 'departmentId', 50);

    if (departmentId) {
      assertUuid(departmentId, 'departmentId');
    }

    const employmentStatus = assertOptionalEnumValue(query.employmentStatus, EmploymentStatus, 'employmentStatus');
    const employmentType = assertOptionalEnumValue(query.employmentType, EmploymentType, 'employmentType');
    const accessibleDepartmentIds = this.resolveAccessibleDepartmentIds(actor, departmentId ?? undefined);
      ...pagination,
      search: search ?? undefined,
      departmentId: accessibleDepartmentIds ? undefined : departmentId ?? undefined,
      accessibleDepartmentIds,
      employmentStatus,
      employmentType,
      includeDeleted: query.includeDeleted === true || String(query.includeDeleted) === 'true',
    });

    return paginatedResponse(result.items.map((employee) => this.toResponse(employee)), result.total, pagination.page, pagination.limit);
  }

    assertUuid(id, 'id');
    this.assertCanAccessEmployee(actor, employee);
    return this.toResponse(employee);
  }

    assertUuid(id, 'id');
    this.assertCanAccessEmployee(actor, existing);

    const data: Record<string, unknown> = {};

    if (payload.firstName !== undefined) data.firstName = assertRequiredString(payload.firstName, 'firstName', 100);
    if (payload.lastName !== undefined) data.lastName = assertRequiredString(payload.lastName, 'lastName', 100);
    if (payload.email !== undefined) data.email = assertRequiredString(payload.email, 'email', 255).toLowerCase();
    if (payload.phoneNumber !== undefined) data.phoneNumber = assertOptionalString(payload.phoneNumber, 'phoneNumber', 30);
    if (payload.employmentType !== undefined) data.employmentType = assertEnumValue(payload.employmentType, EmploymentType, 'employmentType');
    if (payload.hourlyRate !== undefined) data.hourlyRate = assertOptionalNumber(payload.hourlyRate, 'hourlyRate');
    if (payload.emergencyContacts !== undefined) data.emergencyContacts = this.normalizeEmergencyContacts(payload.emergencyContacts);
    if (payload.profileMetadata !== undefined) data.profileMetadata = assertPlainObject(payload.profileMetadata, 'profileMetadata');
    if ((payload as { role?: UserRole }).role !== undefined) {
      const role = assertEnumValue((payload as { role?: UserRole }).role, UserRole, 'role');
      assertCanAssignRole(actor, role);
      data.role = role;
    }

    if (!Object.keys(data).length) {
      throw new BadRequestException('At least one employee field must be provided.');
    }

      actorUserId: actor.userId,
      action: data.role ? 'ROLE_CHANGE' : 'PROFILE_UPDATE',
      previousValue: this.pickAuditedValues(existing, Object.keys(data)),
      newValue: data,
    }));
  }

    assertUuid(id, 'id');
    const employmentStatus = assertEnumValue(payload.employmentStatus, EmploymentStatus, 'employmentStatus');
    this.assertCanAccessEmployee(actor, existing);

    if (existing.deletedAt && employmentStatus !== EmploymentStatus.TERMINATED) {
      throw new BadRequestException('Use the explicit restore workflow for terminated employees.');
    }

      employmentStatus,
      isActive: employmentStatus === EmploymentStatus.ACTIVE,
      ...(employmentStatus === EmploymentStatus.TERMINATED ? { deletedAt: new Date() } : {}),
    }, {
      actorUserId: actor.userId,
      action: 'STATUS_CHANGE',
      previousValue: {
        employmentStatus: existing.employmentStatus,
        isActive: existing.isActive,
        deletedAt: existing.deletedAt?.toISOString() ?? null,
      },
      newValue: { employmentStatus, isActive: employmentStatus === EmploymentStatus.ACTIVE },
    }));
  }

    assertUuid(id, 'id');
    this.assertCanAccessEmployee(actor, existing);

    if (payload.departmentId === undefined) {
      throw new BadRequestException('departmentId is required and may be null.');
    }

    if (payload.departmentId !== null) {
      assertUuid(payload.departmentId, 'departmentId');
    }

    if (hasDepartmentScopedEmployeeAccess(actor.role) && payload.departmentId !== actor.deptId) {
      throw new ForbiddenException('You can only assign employees within your department.');
    }

      actorUserId: actor.userId,
      action: 'DEPARTMENT_CHANGE',
      previousValue: { departmentId: existing.departmentId },
      newValue: { departmentId: payload.departmentId },
    }));
  }

    assertUuid(id, 'id');
    this.assertCanAccessEmployee(actor, existing);
    const devicePin = assertRequiredString(payload.deviceUserId, 'deviceUserId', 50);

      devicePin,
    }, {
      actorUserId: actor.userId,
      action: 'DEVICE_MAPPING_CHANGE',
      previousValue: { deviceUserId: existing.devicePin },
      newValue: { deviceUserId: devicePin },
    }));
  }

    assertUuid(id, 'id');
    this.assertCanAccessEmployee(actor, existing);
  }

    assertUuid(id, 'id');
    if (![UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HR_MANAGER].includes(actor.role)) {
      throw new ForbiddenException('You are not allowed to restore employees.');
    }
  }

  private normalizeEmergencyContacts(value: unknown) {
    if (value === undefined) {
      return [];
    }

    if (!Array.isArray(value)) {
      throw new BadRequestException('emergencyContacts must be an array.');
    }

    return value.map((contact, index) => {
      if (!contact || typeof contact !== 'object' || Array.isArray(contact)) {
        throw new BadRequestException(`emergencyContacts[${index}] must be an object.`);
      }

      const candidate = contact as Record<string, unknown>;

      return {
        name: assertRequiredString(candidate.name, `emergencyContacts[${index}].name`, 100),
        relationship: assertRequiredString(candidate.relationship, `emergencyContacts[${index}].relationship`, 50),
        phoneNumber: assertRequiredString(candidate.phoneNumber, `emergencyContacts[${index}].phoneNumber`, 30),
        ...(candidate.email ? { email: assertRequiredString(candidate.email, `emergencyContacts[${index}].email`, 255) } : {}),
      };
    });
  }

  private toResponse(employee: any): EmployeeResponseDTO {
    return {
      id: employee.id,
      employeeCode: employee.payrollNumber,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      role: employee.role,
      departmentId: employee.departmentId,
      department: employee.department
        ? {
            id: employee.department.id,
            name: employee.department.name,
            code: employee.department.code,
          }
        : null,
      deviceUserId: employee.devicePin,
      employmentType: employee.employmentType,
      employmentStatus: employee.employmentStatus,
      hourlyRate: Number(employee.hourlyRate),
      emergencyContacts: employee.emergencyContacts ?? [],
      profileMetadata: employee.profileMetadata ?? {},
      isActive: employee.isActive,
      deletedAt: employee.deletedAt?.toISOString() ?? null,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    };
  }

  private resolveAccessibleDepartmentIds(actor: AuthenticatedUser, requestedDepartmentId?: string): string[] | undefined {
    if (hasTenantWideEmployeeAccess(actor.role)) {
      return undefined;
    }

    if (actor.role === UserRole.EMPLOYEE) {
      return actor.deptId ? [actor.deptId] : [];
    }

    if (hasDepartmentScopedEmployeeAccess(actor.role)) {
      if (!actor.deptId) {
        return [];
      }
      if (requestedDepartmentId && requestedDepartmentId !== actor.deptId) {
        throw new ForbiddenException('You can only access employees in your assigned department.');
      }
      return [actor.deptId];
    }

    return [];
  }

  private assertCanAccessEmployee(actor: AuthenticatedUser, employee: any): void {
    if (hasTenantWideEmployeeAccess(actor.role)) {
      return;
    }

    if (actor.role === UserRole.EMPLOYEE && employee.id === actor.userId) {
      return;
    }

    if (hasDepartmentScopedEmployeeAccess(actor.role) && actor.deptId && employee.departmentId === actor.deptId) {
      return;
    }

    throw new ForbiddenException('You are not allowed to access this employee.');
  }

  private pickAuditedValues(employee: any, keys: string[]) {
    return keys.reduce((result, key) => {
      result[key] = employee[key];
      return result;
    }, {} as Record<string, unknown>);
  }
}
