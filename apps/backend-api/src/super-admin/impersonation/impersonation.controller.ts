import { Controller, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { ImpersonationService } from './impersonation.service';

@Controller('super-admin/impersonate')
@UseGuards(SuperAdminGuard)
export class ImpersonationController {
  constructor(private readonly impersonationService: ImpersonationService) {}

  @Post(':tenantId')
  startImpersonation(
    @Param('tenantId') tenantId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.impersonationService.start(req.user.id, tenantId, reason);
  }

  @Delete('end')
  endImpersonation(@Req() req: any) {
    return this.impersonationService.end(req.user.id);
  }
}
