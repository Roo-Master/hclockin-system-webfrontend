import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Patch,
} from '@nestjs/common';
import {
  PayrollService,
  CreatePeriodDTO,
  RunPayrollDTO,
  ApprovePayslipDTO,
} from './payroll.service';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('periods')
  }

  @Post('periods')
  createPeriod(@Body() dto: CreatePeriodDTO) {
    return this.payrollService.createPeriod(dto);
  }

  @Post('periods/:id/run')
  runPayroll(@Param('id') periodId: string, @Body() dto: RunPayrollDTO) {
    return this.payrollService.runPayroll(periodId, dto);
  }

  @Get('periods/:id/payslips')
  getPayslipsByPeriod(
    @Param('id') periodId: string,
  ) {
  }

  @Get('periods/:id/export')
  exportPayroll(
    @Param('id') periodId: string,
  ) {
  }

  @Get('payslip/:pid/employee/:eid')
  getEmployeePayslip(
    @Param('pid') periodId: string,
    @Param('eid') employeeId: string,
  ) {
  }

  @Patch('payslip/:id/approve')
  approvePayslip(
    @Param('id') payslipId: string,
    @Body() dto: ApprovePayslipDTO,
  ) {
    return this.payrollService.approvePayslip(payslipId, dto);
  }

  @Patch('payslip/:id/paid')
  markPaid(
    @Param('id') payslipId: string,
  ) {
  }
}
