import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  EmployeeCreateDTO,
  EmployeeDepartmentUpdateDTO,
  EmployeeDeviceUserUpdateDTO,
  EmployeeQueryDTO,
  EmployeeStatusUpdateDTO,
  EmployeeUpdateDTO,
  UserRole,
} from '@chronos/types-common';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { TenantId } from '../common/tenant/tenant-id.decorator';
import { EmployeeService } from './employee.service';

@Controller('api/employees')
@UseGuards(RolesGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.DEPT_HEAD)
  create(@TenantId() tenantId: string, @Body() payload: EmployeeCreateDTO) {
    return this.employeeService.create(tenantId, payload);
  }

  @Get()
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.DEPT_HEAD)
  list(@TenantId() tenantId: string, @Query() query: EmployeeQueryDTO) {
    return this.employeeService.list(tenantId, query);
  }

  @Get(':id')
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.DEPT_HEAD, UserRole.EMPLOYEE)
  getById(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.employeeService.getById(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.DEPT_HEAD)
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() payload: EmployeeUpdateDTO) {
    return this.employeeService.update(tenantId, id, payload);
  }

  @Delete(':id')
  @Roles(UserRole.HOSPITAL_ADMIN)
  softDelete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.employeeService.softDelete(tenantId, id);
  }

  @Patch(':id/status')
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.DEPT_HEAD)
  updateStatus(@TenantId() tenantId: string, @Param('id') id: string, @Body() payload: EmployeeStatusUpdateDTO) {
    return this.employeeService.updateStatus(tenantId, id, payload);
  }

  @Patch(':id/department')
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.DEPT_HEAD)
  updateDepartment(@TenantId() tenantId: string, @Param('id') id: string, @Body() payload: EmployeeDepartmentUpdateDTO) {
    return this.employeeService.updateDepartment(tenantId, id, payload);
  }

  @Patch(':id/device-user')
  @Roles(UserRole.HOSPITAL_ADMIN)
  updateDeviceUser(@TenantId() tenantId: string, @Param('id') id: string, @Body() payload: EmployeeDeviceUserUpdateDTO) {
    return this.employeeService.updateDeviceUser(tenantId, id, payload);
  }
}
