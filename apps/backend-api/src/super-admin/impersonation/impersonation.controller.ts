import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { ImpersonationService } from './impersonation.service';
import { StartImpersonationDto } from './dto/start-impersonation.dto';
import { RequestUser } from '../interfaces/request-user.interface';

@Controller('super-admin/impersonate')
@UseGuards(SuperAdminGuard)
export class ImpersonationController {
  constructor(private readonly impersonationService: ImpersonationService) {}

  @Post(':tenantId')
  @HttpCode(HttpStatus.CREATED)
  startImpersonation(
    @Param('tenantId') tenantId: string,
    @Body() dto: StartImpersonationDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.impersonationService.start(req.user.id, tenantId, dto.reason);
  }

  @Delete('end')
  @HttpCode(HttpStatus.OK)
  endImpersonation(@Req() req: { user: RequestUser }) {
    return this.impersonationService.end(req.user.id);
  }
}