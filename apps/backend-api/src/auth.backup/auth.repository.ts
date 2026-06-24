import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { createHash } from 'node:crypto';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  // User lookups
    return this.prisma.client.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        departmentId: true,
        isActive: true,
        employmentStatus: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        mustChangePassword: true,
      },
    });
  }

    return this.prisma.client.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        departmentId: true,
        isActive: true,
        employmentStatus: true,
        mustChangePassword: true,
        lastLoginAt: true,
      },
    });
  }

  async incrementFailedAttempts(userId: string): Promise<void> {
    await this.prisma.client.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: {
          increment: 1,
        },
      },
    });
  }

  async lockUser(userId: string, until: Date): Promise<void> {
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { lockedUntil: until },
    });
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0 },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async updatePasswordHash(userId: string, hash: string): Promise<void> {
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });
  }

  async setMustChangePassword(userId: string, value: boolean): Promise<void> {
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { mustChangePassword: value },
    });
  }

  // Session management
  async createSession(data: {
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return this.prisma.client.session.create({
      data: {
        userId: data.userId,
        token: this.hashToken(data.accessToken),
        refreshToken: this.hashToken(data.refreshToken),
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        lastUsedAt: new Date(),
      },
    });
  }

  async findSessionByTokenHash(tokenHash: string) {
    return this.prisma.client.session.findFirst({
      where: { token: tokenHash },
      include: { user: true },
    });
  }

  async findSessionByRefreshTokenHash(refreshTokenHash: string) {
    return this.prisma.client.session.findFirst({
      where: { refreshToken: refreshTokenHash },
      include: { user: true },
    });
  }

  async updateSession(sessionId: string, data: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    lastUsedAt?: Date;
  }) {
    const updateData: any = {};
    if (data.accessToken) updateData.token = this.hashToken(data.accessToken);
    if (data.refreshToken) updateData.refreshToken = this.hashToken(data.refreshToken);
    if (data.expiresAt) updateData.expiresAt = data.expiresAt;
    if (data.lastUsedAt) updateData.lastUsedAt = data.lastUsedAt;

    return this.prisma.client.session.update({
      where: { id: sessionId },
      data: updateData,
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.prisma.client.session.delete({
      where: { id: sessionId },
    });
  }

  async deleteAllUserSessions(userId: string): Promise<number> {
    const result = await this.prisma.client.session.deleteMany({
      where: { userId },
    });
    return result.count;
  }

  async deleteAllUserSessionsExcept(userId: string, sessionId: string): Promise<number> {
    const result = await this.prisma.client.session.deleteMany({
      where: {
        userId,
        id: { not: sessionId },
      },
    });
    return result.count;
  }

  async countUserSessions(userId: string): Promise<number> {
    return this.prisma.client.session.count({
      where: { userId },
    });
  }

  async deleteOldestUserSession(userId: string): Promise<void> {
    const oldestSession = await this.prisma.client.session.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (oldestSession) {
      await this.prisma.client.session.delete({
        where: { id: oldestSession.id },
      });
    }
  }

  async listUserSessions(userId: string) {
    return this.prisma.client.session.findMany({
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
}
