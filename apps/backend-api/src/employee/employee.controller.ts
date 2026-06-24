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
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedUser } from '../common/auth/authenticated-user';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { EmployeeService } from './employee.service';

@Controller('api/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HR_MANAGER, UserRole.DEPT_HEAD)
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HR_MANAGER, UserRole.DEPT_HEAD, UserRole.SUPERVISOR)
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HR_MANAGER, UserRole.DEPT_HEAD, UserRole.SUPERVISOR, UserRole.EMPLOYEE)
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HR_MANAGER, UserRole.DEPT_HEAD)
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HR_MANAGER)
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HR_MANAGER, UserRole.DEPT_HEAD)
  }

  @Patch(':id/department')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HR_MANAGER, UserRole.DEPT_HEAD)
  }

  @Patch(':id/device-user')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HR_MANAGER)
  }

  @Patch(':id/restore')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HR_MANAGER)
  }
}
