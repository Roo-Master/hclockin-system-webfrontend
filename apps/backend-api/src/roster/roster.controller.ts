import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ShiftAssignmentCreateDTO,
  ShiftAssignmentUnassignDTO,
  ShiftTemplateCreateDTO,
  ShiftTemplateQueryDTO,
  ShiftTemplateUpdateDTO,
  UserRole,
} from '@chronos/types-common';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { TenantId } from '../common/tenant/tenant-id.decorator';
import { RosterService } from './roster.service';

@Controller('api/roster')
@UseGuards(RolesGuard)
export class RosterController {
  constructor(private readonly rosterService: RosterService) {}

  @Post('shifts')
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.DEPT_HEAD)
  createShiftTemplate(@TenantId() tenantId: string, @Body() payload: ShiftTemplateCreateDTO) {
    return this.rosterService.createShiftTemplate(tenantId, payload);
  }

  @Get('shifts')
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.DEPT_HEAD)
  listShiftTemplates(@TenantId() tenantId: string, @Query() query: ShiftTemplateQueryDTO) {
    return this.rosterService.listShiftTemplates(tenantId, query);
  }

  @Get('shifts/:id')
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.DEPT_HEAD, UserRole.EMPLOYEE)
  getShiftTemplate(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.rosterService.getShiftTemplate(tenantId, id);
  }

  @Patch('shifts/:id')
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.DEPT_HEAD)
  updateShiftTemplate(@TenantId() tenantId: string, @Param('id') id: string, @Body() payload: ShiftTemplateUpdateDTO) {
    return this.rosterService.updateShiftTemplate(tenantId, id, payload);
  }

  @Delete('shifts/:id')
  @Roles(UserRole.HOSPITAL_ADMIN)
  deactivateShiftTemplate(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.rosterService.deactivateShiftTemplate(tenantId, id);
  }

  @Post('shifts/:id/assign-employees')
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.DEPT_HEAD)
  assignEmployees(@TenantId() tenantId: string, @Param('id') id: string, @Body() payload: ShiftAssignmentCreateDTO) {
    return this.rosterService.assignEmployees(tenantId, id, payload);
  }

  @Post('shifts/:id/unassign-employees')
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.DEPT_HEAD)
  unassignEmployees(@TenantId() tenantId: string, @Param('id') id: string, @Body() payload: ShiftAssignmentUnassignDTO) {
    return this.rosterService.unassignEmployees(tenantId, id, payload);
  }
}
