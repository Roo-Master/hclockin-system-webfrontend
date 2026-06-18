// Location: apps/backend-api/src/device/device.controller.ts

import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { RolesGuard } from '../common/auth/roles.guard';
import { Roles } from '../common/auth/roles.decorator';
import { CurrentUser } from '../common/auth/current-user.decorator';
import type { AuthenticatedUser } from '../common/auth/authenticated-user';
import { UserRole } from '@chronos/types-common';

class ActivateDeviceDto {
  code: string;
  serialCode: string;
  publicKey: string;
  name: string;
  ipAddress?: string;
}

@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  /**
   * POST /devices/activation-token
   * Admin generates a 6-digit code on the dashboard, then types it
   * into the SenseFace 2A terminal screen to begin pairing.
   */
  @Post('activation-token')
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  generateActivationToken(@CurrentUser() user: AuthenticatedUser) {
    return this.deviceService.generateActivationToken(user.tenantId);
  }

  /**
   * POST /devices/activate
   * Terminal sends its serial + public key paired with the activation code.
   * Registers the device and makes it ready to push webhooks.
   */
  @Post('activate')
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  activateDevice(@Body() dto: ActivateDeviceDto) {
    return this.deviceService.activateDevice(dto);
  }

  /**
   * GET /devices
   * Lists all active terminals registered to this hospital.
   */
  @Get()
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  listDevices(@CurrentUser() user: AuthenticatedUser) {
    return this.deviceService.listDevices(user.tenantId);
  }

  /**
   * DELETE /devices/:serialCode
   * Decommissions a terminal — immediately evicts its key from cache
   * so subsequent webhooks are rejected without waiting for TTL expiry.
   */
  @Delete(':serialCode')
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  decommissionDevice(@Param('serialCode') serialCode: string) {
    return this.deviceService.decommissionDevice(serialCode);
  }
}
