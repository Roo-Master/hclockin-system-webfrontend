import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { CurrentUserPayload } from '../common/types/current-user.type';
import { AssignEmployeesDto } from './dto/assign-employees.dto';
import { CreateShiftDto } from './dto/create-shift.dto';
import { QueryShiftsDto } from './dto/query-shifts.dto';
import { UnassignEmployeesDto } from './dto/unassign-employees.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftService } from './shift.service';

const MANAGE_SHIFTS = ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'HR_MANAGER', 'SUPERVISOR'];

@ApiTags('Shifts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  @Roles(...MANAGE_SHIFTS)
  @ApiOperation({ summary: 'Create a shift' })
  create(@Body() dto: CreateShiftDto, @CurrentUser() user: CurrentUserPayload) {
    return this.shiftService.create(dto, user);
  }

  @Get()
  @Roles(...MANAGE_SHIFTS, 'EMPLOYEE')
  @ApiOperation({ summary: 'List shifts with tenant-scoped filtering, search, and pagination' })
  findAll(@Query() query: QueryShiftsDto, @CurrentUser() user: CurrentUserPayload) {
    return this.shiftService.findAll(query, user);
  }

  @Get(':id')
  @Roles(...MANAGE_SHIFTS, 'EMPLOYEE')
  @ApiOperation({ summary: 'Get a shift by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.shiftService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(...MANAGE_SHIFTS)
  @ApiOperation({ summary: 'Update a shift' })
  update(@Param('id') id: string, @Body() dto: UpdateShiftDto, @CurrentUser() user: CurrentUserPayload) {
    return this.shiftService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(...MANAGE_SHIFTS)
  @ApiOperation({ summary: 'Soft delete a shift and close active assignments' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.shiftService.remove(id, user);
  }

  @Post(':id/assign-employees')
  @Roles(...MANAGE_SHIFTS)
  @ApiOperation({ summary: 'Assign employees to a shift with assignment history preservation' })
  assignEmployees(@Param('id') id: string, @Body() dto: AssignEmployeesDto, @CurrentUser() user: CurrentUserPayload) {
    return this.shiftService.assignEmployees(id, dto, user);
  }

  @Post(':id/unassign-employees')
  @Roles(...MANAGE_SHIFTS)
  @ApiOperation({ summary: 'End active employee shift assignments' })
  unassignEmployees(@Param('id') id: string, @Body() dto: UnassignEmployeesDto, @CurrentUser() user: CurrentUserPayload) {
    return this.shiftService.unassignEmployees(id, dto, user);
  }
}
