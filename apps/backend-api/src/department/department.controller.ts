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
  }

  // LIST
  @Get()
  listDepartments(@Req() req: any) {
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