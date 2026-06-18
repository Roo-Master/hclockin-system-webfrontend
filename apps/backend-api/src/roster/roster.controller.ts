import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/roster')
@UseGuards(JwtAuthGuard)
export class RosterController {
  // ... existing code ...

  @Get('shifts/upcoming')
  async getUpcomingShifts(@Query('days') days: number, @Req() req: any) {
    const daysToShow = days || 7;
    return this.rosterService.getUpcomingShifts(req.user.id, daysToShow);
  }
}