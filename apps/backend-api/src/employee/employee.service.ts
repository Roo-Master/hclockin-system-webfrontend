import { BadRequestException, Injectable } from '@nestjs/common';
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
import { EmployeeRepository } from './employee.repository';

@Injectable()
export class EmployeeService {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async create(tenantId: string, payload: EmployeeCreateDTO) {
    const departmentId = payload.departmentId;

    if (departmentId) {
      assertUuid(departmentId, 'departmentId');
      await this.employeeRepository.assertDepartmentBelongsToTenant(tenantId, departmentId);
    }

    const employee = await this.employeeRepository.create(tenantId, {
      payrollNumber: assertRequiredString(payload.employeeCode, 'employeeCode', 50),
      firstName: assertRequiredString(payload.firstName, 'firstName', 100),
      lastName: assertRequiredString(payload.lastName, 'lastName', 100),
      email: assertRequiredString(payload.email, 'email', 255).toLowerCase(),
      passwordHash: assertRequiredString(payload.passwordHash, 'passwordHash', 255),
      phoneNumber: assertOptionalString(payload.phoneNumber, 'phoneNumber', 30),
      departmentId: departmentId ?? null,
      devicePin: assertRequiredString(payload.deviceUserId, 'deviceUserId', 50),
      role: payload.role ? assertEnumValue(payload.role, UserRole, 'role') : UserRole.EMPLOYEE,
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
    });

    return this.toResponse(employee);
  }

  async list(tenantId: string, query: EmployeeQueryDTO) {
    const pagination = normalizePagination(query.page, query.limit);
    const search = assertOptionalString(query.search, 'search', 100);
    const departmentId = assertOptionalString(query.departmentId, 'departmentId', 50);

    if (departmentId) {
      assertUuid(departmentId, 'departmentId');
    }

    const employmentStatus = assertOptionalEnumValue(query.employmentStatus, EmploymentStatus, 'employmentStatus');
    const employmentType = assertOptionalEnumValue(query.employmentType, EmploymentType, 'employmentType');
    const result = await this.employeeRepository.list(tenantId, {
      ...pagination,
      search: search ?? undefined,
      departmentId: departmentId ?? undefined,
      employmentStatus,
      employmentType,
      includeDeleted: query.includeDeleted === true || String(query.includeDeleted) === 'true',
    });

    return paginatedResponse(result.items.map((employee) => this.toResponse(employee)), result.total, pagination.page, pagination.limit);
  }

  async getById(tenantId: string, id: string) {
    assertUuid(id, 'id');
    return this.toResponse(await this.employeeRepository.findByIdOrThrow(tenantId, id));
  }

  async update(tenantId: string, id: string, payload: EmployeeUpdateDTO) {
    assertUuid(id, 'id');

    const data: Record<string, unknown> = {};

    if (payload.firstName !== undefined) data.firstName = assertRequiredString(payload.firstName, 'firstName', 100);
    if (payload.lastName !== undefined) data.lastName = assertRequiredString(payload.lastName, 'lastName', 100);
    if (payload.email !== undefined) data.email = assertRequiredString(payload.email, 'email', 255).toLowerCase();
    if (payload.phoneNumber !== undefined) data.phoneNumber = assertOptionalString(payload.phoneNumber, 'phoneNumber', 30);
    if (payload.employmentType !== undefined) data.employmentType = assertEnumValue(payload.employmentType, EmploymentType, 'employmentType');
    if (payload.hourlyRate !== undefined) data.hourlyRate = assertOptionalNumber(payload.hourlyRate, 'hourlyRate');
    if (payload.emergencyContacts !== undefined) data.emergencyContacts = this.normalizeEmergencyContacts(payload.emergencyContacts);
    if (payload.profileMetadata !== undefined) data.profileMetadata = assertPlainObject(payload.profileMetadata, 'profileMetadata');

    if (!Object.keys(data).length) {
      throw new BadRequestException('At least one employee field must be provided.');
    }

    return this.toResponse(await this.employeeRepository.update(tenantId, id, data));
  }

  async updateStatus(tenantId: string, id: string, payload: EmployeeStatusUpdateDTO) {
    assertUuid(id, 'id');
    const employmentStatus = assertEnumValue(payload.employmentStatus, EmploymentStatus, 'employmentStatus');

    return this.toResponse(await this.employeeRepository.update(tenantId, id, {
      employmentStatus,
      isActive: employmentStatus === EmploymentStatus.ACTIVE,
      deletedAt: employmentStatus === EmploymentStatus.TERMINATED ? new Date() : null,
    }));
  }

  async updateDepartment(tenantId: string, id: string, payload: EmployeeDepartmentUpdateDTO) {
    assertUuid(id, 'id');

    if (payload.departmentId === undefined) {
      throw new BadRequestException('departmentId is required and may be null.');
    }

    if (payload.departmentId !== null) {
      assertUuid(payload.departmentId, 'departmentId');
      await this.employeeRepository.assertDepartmentBelongsToTenant(tenantId, payload.departmentId);
    }

    return this.toResponse(await this.employeeRepository.update(tenantId, id, { departmentId: payload.departmentId }));
  }

  async updateDeviceUser(tenantId: string, id: string, payload: EmployeeDeviceUserUpdateDTO) {
    assertUuid(id, 'id');

    return this.toResponse(await this.employeeRepository.update(tenantId, id, {
      devicePin: assertRequiredString(payload.deviceUserId, 'deviceUserId', 50),
    }));
  }

  async softDelete(tenantId: string, id: string) {
    assertUuid(id, 'id');
    return this.toResponse(await this.employeeRepository.softDelete(tenantId, id));
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
      tenantId: employee.tenantId,
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
}
