import { Injectable, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly accessTtl: number;
  private readonly refreshTtl: number;
  private readonly sessionMaxCount: number;
  private readonly lockoutThreshold: number;
  private readonly lockoutMinutes: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly email: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') || 'dev-secret-key';
    this.accessTtl = this.configService.get<number>('JWT_ACCESS_TTL') || 900;
    this.refreshTtl = this.configService.get<number>('JWT_REFRESH_TTL') || 604800;
    this.sessionMaxCount = this.configService.get<number>('SESSION_MAX_COUNT') || 3;
    this.lockoutThreshold = this.configService.get<number>('ACCOUNT_LOCKOUT_THRESHOLD') || 5;
    this.lockoutMinutes = this.configService.get<number>('ACCOUNT_LOCKOUT_MINUTES') || 15;
  }

  private signToken(payload: object, expiresInSeconds: number): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(
      JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
      }),
    ).toString('base64url');

    const signature = createHmac('sha256', this.jwtSecret)
      .update(`${header}.${body}`)
      .digest()
      .toString('base64url');

    return `${header}.${body}.${signature}`;
  }

  private decodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    try {
      return JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    } catch {
      throw new Error('Invalid token payload');
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token format');

      const [header, body, signature] = parts;
      const expectedSignature = createHmac('sha256', this.jwtSecret)
        .update(`${header}.${body}`)
        .digest()
        .toString('base64url');

      if (signature !== expectedSignature) throw new Error('Invalid signature');

      const payload = JSON.parse(Buffer.from(body, 'base64url').toString());

      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      if (payload.type === 'refresh') {
        throw new Error('Refresh token cannot be used as access token');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async login(email: string, password: string, tenantId: string, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        tenantId: true,
        departmentId: true,
        isActive: true,
        employmentStatus: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        mustChangePassword: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      await this.auditLog.log({
        event: 'LOGIN_FAILURE',
        email,
        tenantId,
        ipAddress,
        userAgent,
        metadata: { reason: 'user_not_found' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      await this.auditLog.log({
        event: 'LOGIN_FAILURE',
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        ipAddress,
        userAgent,
        metadata: { reason: 'account_locked', remainingMinutes },
      });
      throw new ForbiddenException(`Account is temporarily locked. Try again in ${remainingMinutes} minutes.`);
    }

    // Check account status
    if (!user.isActive || user.employmentStatus !== 'ACTIVE') {
      await this.auditLog.log({
        event: 'LOGIN_FAILURE',
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        ipAddress,
        userAgent,
        metadata: { reason: 'account_inactive' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: failedAttempts },
      });

      if (failedAttempts >= this.lockoutThreshold) {
        const lockUntil = new Date(Date.now() + this.lockoutMinutes * 60 * 1000);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { lockedUntil: lockUntil },
        });
        await this.auditLog.log({
          event: 'LOCKOUT',
          userId: user.id,
          email: user.email,
          tenantId: user.tenantId,
          ipAddress,
          userAgent,
          metadata: { failedAttempts, lockUntil },
        });
      }

      await this.auditLog.log({
        event: 'LOGIN_FAILURE',
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        ipAddress,
        userAgent,
        metadata: { reason: 'invalid_password', failedAttempts },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lastLoginAt: new Date(),
      },
    });

    // Check session cap
    const sessionCount = await this.prisma.session.count({
      where: { userId: user.id },
    });

    if (sessionCount >= this.sessionMaxCount) {
      const oldestSession = await this.prisma.session.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      });
      if (oldestSession) {
        await this.prisma.session.delete({ where: { id: oldestSession.id } });
      }
    }

    // Generate tokens
    const accessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      deptId: user.departmentId || null,
    };

    const accessToken = this.signToken(accessPayload, this.accessTtl);

    const refreshPayload = {
      sub: user.id,
      type: 'refresh',
      sessionId: 'temp',
    };

    const refreshToken = this.signToken(refreshPayload, this.refreshTtl);

    // Create session
    const expiresAt = new Date(Date.now() + this.refreshTtl * 1000);
    await this.prisma.session.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        token: this.hashToken(accessToken),
        refreshToken: this.hashToken(refreshToken),
        expiresAt,
        userAgent,
        ipAddress,
        lastUsedAt: new Date(),
      },
    });

    await this.auditLog.log({
      event: 'LOGIN_SUCCESS',
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTtl,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        departmentId: user.departmentId,
        mustChangePassword: user.mustChangePassword || false,
      },
    };
  }

  async refresh(refreshToken: string, userAgent?: string, ipAddress?: string) {
    const tokenHash = this.hashToken(refreshToken);

    const session = await this.prisma.session.findFirst({
      where: { refreshToken: tokenHash },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    try {
      const payload = this.decodeToken(refreshToken);
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = session.user;

    // Generate new tokens
    const accessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      deptId: user.departmentId || null,
    };

    const newAccessToken = this.signToken(accessPayload, this.accessTtl);

    const refreshPayload = {
      sub: user.id,
      type: 'refresh',
      sessionId: session.id,
    };

    const newRefreshToken = this.signToken(refreshPayload, this.refreshTtl);

    // Update session with new tokens
    const newExpiresAt = new Date(Date.now() + this.refreshTtl * 1000);
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        token: this.hashToken(newAccessToken),
        refreshToken: this.hashToken(newRefreshToken),
        expiresAt: newExpiresAt,
        lastUsedAt: new Date(),
        userAgent,
        ipAddress,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.accessTtl,
    };
  }

  async logout(accessToken: string) {
    const tokenHash = this.hashToken(accessToken);
    const session = await this.prisma.session.findFirst({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (session) {
      await this.auditLog.log({
        event: 'LOGOUT',
        userId: session.userId,
        email: session.user.email,
        tenantId: session.tenantId,
      });
      await this.prisma.session.delete({ where: { id: session.id } });
    }

    return { success: true };
  }

  async logoutAll(userId: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId } });
    const sessions = await this.prisma.session.deleteMany({
      where: { userId },
    });

    if (user) {
      await this.auditLog.log({
        event: 'LOGOUT_ALL',
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        metadata: { revokedCount: sessions.count },
      });
    }

    return { success: true, revokedCount: sessions.count };
  }

  async getMe(userId: string, tenantId: string | null) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: tenantId ?? undefined,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        departmentId: true,
        isActive: true,
        employmentStatus: true,
        mustChangePassword: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async changePassword(userId: string, tenantId: string | null, dto: any) {
    const { currentPassword, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new ConflictException('Passwords do not match');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId: tenantId ?? undefined },
      select: { id: true, email: true, tenantId: true, passwordHash: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      await this.auditLog.log({
        event: 'PASSWORD_CHANGE_FAILED',
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        metadata: { reason: 'invalid_current_password' },
      });
      throw new UnauthorizedException('Current password is incorrect');
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new ConflictException('New password must be different from current password');
    }

    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    });

    // Delete all sessions except current
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    await this.auditLog.log({
      event: 'PASSWORD_CHANGE',
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
    });

    return { success: true };
  }

  async forgotPassword(email: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), tenantId, deletedAt: null },
    });

    // Always return success even if user not found (security)
    if (!user) {
      return { success: true };
    }

    const resetToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        tokenHash,
        expiresAt,
      },
    });

    // Send email
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}&tenant=${tenantId}`;
    await this.email.sendPasswordReset(user.email, resetUrl, user.firstName || 'User');

    await this.auditLog.log({
      event: 'PASSWORD_RESET_REQUEST',
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
    });

    return { success: true };
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    if (newPassword !== confirmPassword) {
      throw new ConflictException('Passwords do not match');
    }

    const tokenHash = this.hashToken(token);
    const reset = await this.prisma.passwordReset.findFirst({
      where: { tokenHash, usedAt: null },
      include: { user: true },
    });

    if (!reset || reset.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash: newPasswordHash },
      }),
      this.prisma.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.session.deleteMany({
        where: { userId: reset.userId },
      }),
    ]);

    await this.auditLog.log({
      event: 'PASSWORD_RESET_COMPLETE',
      userId: reset.userId,
      email: reset.user.email,
      tenantId: reset.tenantId,
    });

    return { success: true };
  }

  async listSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
      },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    await this.prisma.session.delete({ where: { id: sessionId } });
    return { success: true };
  }
}
