import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AssignDepartmentMemberDto } from './dto/assign-department-member.dto';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  // CREATE
  @Post()
  createDepartment(@Body() dto: CreateDepartmentDto, @Req() req: any) {
    return this.departmentService.create(dto, req.user.tenantId);
  }

  // LIST
  @Get()
  listDepartments(@Req() req: any) {
    return this.departmentService.listDepartments(req.user.tenantId);
  }

  // UPDATE
  @Patch(':id')
  updateDepartment(
    @Param('id', ParseUUIDPipe) departmentId: string,
    @Body() dto: UpdateDepartmentDto,
    @Req() req: any,
  ) {
    return this.departmentService.updateDepartment(
      departmentId,
      dto,
      req.user.tenantId,
    );
  }

  // DELETE
  @Delete(':id')
  deleteDepartment(
    @Param('id', ParseUUIDPipe) departmentId: string,
    @Req() req: any,
  ) {
    return this.departmentService.deleteDepartment(
      departmentId,
      req.user.tenantId,
    );
  }

  // ASSIGN HEAD (HOD)
  @Post(':id/head')
  assignHead(
    @Param('id', ParseUUIDPipe) departmentId: string,
    @Body() body: AssignDepartmentMemberDto,
  ) {
    return this.departmentService.assignDepartmentHead(
      departmentId,
      body.userId,
    );
  }

  // ASSIGN STAFF
  @Post(':id/staff')
  assignStaff(
    @Param('id', ParseUUIDPipe) departmentId: string,
    @Body() body: AssignDepartmentMemberDto,
  ) {
    return this.departmentService.assignDepartmentStaff(
      departmentId,
      body.userId,
    );
  }

  // LIST STAFF
  @Get(':id/staff')
  listStaff(@Param('id', ParseUUIDPipe) departmentId: string) {
    return this.departmentService.listDepartmentStaff(departmentId);
  }
}