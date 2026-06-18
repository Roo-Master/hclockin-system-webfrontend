import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  // ... existing code ...

  @Get('balances/me')
  async getMyBalances(@Req() req: any) {
    return this.leaveService.getBalancesByEmployee(req.user.id);
  }

  @Get('employee/me')
  async getMyLeaves(@Req() req: any) {
    return this.leaveService.getLeavesByEmployee(req.user.id);
  }
}