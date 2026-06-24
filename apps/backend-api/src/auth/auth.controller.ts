import { Controller, Post, Get, Patch, Delete, Body, Req, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any, @Req() req: any) {
    return this.authService.login(
      body.email,
      body.password,
      body.tenantId,
      req.headers['user-agent'],
      req.ip
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: any, @Req() req: any) {
    return this.authService.refresh(
      body.refreshToken,
      req.headers['user-agent'],
      req.ip
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    return this.authService.logout(token);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const payload = await this.authService.verifyToken(token);
    return this.authService.getMe(payload.sub, payload.tenantId);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const payload = await this.authService.verifyToken(token);
    return this.authService.logoutAll(payload.sub);
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Req() req: any, @Body() body: any) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const payload = await this.authService.verifyToken(token);
    return this.authService.changePassword(payload.sub, payload.tenantId, body);
  }

  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  async listSessions(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const payload = await this.authService.verifyToken(token);
    return this.authService.listSessions(payload.sub);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  async revokeSession(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const payload = await this.authService.verifyToken(token);
    const sessionId = req.params.id;
    return this.authService.revokeSession(payload.sub, sessionId);
  }
}
