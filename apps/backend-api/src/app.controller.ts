// Location: apps/backend/src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Controller('v1/payroll')
export class PayrollController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  async getTenantPayroll() {
    // 🛡️ Automatically restricted by the TenantInterceptor + Prisma extension
    const payslips = await this.prisma.client.payslip.findMany({
      include: {
        employee: {
          select: { firstName: true, lastName: true, payrollNumber: true }
        }
      }
    });

    return {
      count: payslips.length,
      data: payslips,
    };
  }
}