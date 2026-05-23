import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { CurrentUserPayload } from '../common/types/current-user.type';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryEmployeesDto } from './dto/query-employees.dto';
import { UpdateDeviceUserDto } from './dto/update-device-user.dto';
import { UpdateEmployeeDepartmentDto } from './dto/update-employee-department.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeService } from './employee.service';

const MANAGE_EMPLOYEES = ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'HR_MANAGER'];
const READ_EMPLOYEES = [...MANAGE_EMPLOYEES, 'SUPERVISOR'];

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles(...MANAGE_EMPLOYEES)
  @ApiOperation({ summary: 'Create an employee profile' })
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeService.create(dto, user);
  }

  @Get()
  @Roles(...READ_EMPLOYEES)
  @ApiOperation({ summary: 'List employees with tenant-scoped filtering, search, and pagination' })
  findAll(@Query() query: QueryEmployeesDto, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeService.findAll(query, user);
  }

  @Get(':id')
  @Roles(...READ_EMPLOYEES, 'EMPLOYEE')
  @ApiOperation({ summary: 'Get an employee profile' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(...MANAGE_EMPLOYEES)
  @ApiOperation({ summary: 'Update an employee profile' })
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(...MANAGE_EMPLOYEES)
  @ApiOperation({ summary: 'Soft delete an employee profile' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeService.remove(id, user);
  }

  @Patch(':id/status')
  @Roles(...MANAGE_EMPLOYEES)
  @ApiOperation({ summary: 'Update employee lifecycle status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateEmployeeStatusDto, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeService.updateStatus(id, dto, user);
  }

  @Patch(':id/department')
  @Roles(...MANAGE_EMPLOYEES)
  @ApiOperation({ summary: 'Update employee department assignment' })
  updateDepartment(@Param('id') id: string, @Body() dto: UpdateEmployeeDepartmentDto, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeService.updateDepartment(id, dto, user);
  }

  @Patch(':id/device-user')
  @Roles(...MANAGE_EMPLOYEES)
  @ApiOperation({ summary: 'Update biometric device user mapping' })
  updateDeviceUser(@Param('id') id: string, @Body() dto: UpdateDeviceUserDto, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeService.updateDeviceUser(id, dto, user);
  }
}
