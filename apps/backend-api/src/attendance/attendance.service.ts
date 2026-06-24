import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { QueueService } from '../queue/queue.service';
import { AttendanceStatus, AttendanceLog } from '@chronos/database';

export interface CreateAttendanceLogDto {
  userId: string;
  deviceId: string;
  direction: 'IN' | 'OUT';
  timestamp: Date;
  rosterAssignmentId?: string;
}

export interface AttendanceSummaryFilters {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly queue: QueueService,
  ) {}

  // ─── Clock In / Clock Out (manual web) ────────────────────────────────────

    const user = await this.db.user.findFirst({
    });
    if (!user) throw new BadRequestException('User not found or inactive');

    // Find a virtual/web device for manual clock-ins
    const webDevice = await this.db.device.findFirst({
    });

    const log = await this.db.attendanceLog.create({
      data: {
        userId,
        deviceId: webDevice.id,
        direction: 'IN',
        timestamp: new Date(),
      },
    });

    await this.queue.addAttendanceJob({
      userId,
      date: log.timestamp.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      attendanceLogId: log.id,
    });

    this.logger.log(`Manual clock-in: user ${userId}`);
    return log;
  }

    const user = await this.db.user.findFirst({
    });
    if (!user) throw new BadRequestException('User not found or inactive');

    const webDevice = await this.db.device.findFirst({
    });

    const log = await this.db.attendanceLog.create({
      data: {
        userId,
        deviceId: webDevice.id,
        direction: 'OUT',
        timestamp: new Date(),
      },
    });

    await this.queue.addAttendanceJob({
      userId,
      date: log.timestamp.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      attendanceLogId: log.id,
    });

    this.logger.log(`Manual clock-out: user ${userId}`);
    return log;
  }

  // ─── Device Sync ──────────────────────────────────────────────────────────

    // Pull unprocessed logs directly — no DeviceService dependency needed
    const logs = await this.db.attendanceLog.findMany({
      take: 500,
      orderBy: { timestamp: 'asc' },
    });

    if (!logs.length) {
      return { synced: 0 };
    }

    const results = await this.bulkIngest(
      logs.map((log) => ({
        userId: log.userId,
        deviceId: log.deviceId,
        direction: log.direction as 'IN' | 'OUT',
        timestamp: log.timestamp,
      })),
    );

    // Mark successfully synced logs as processed
    const successfulLogIds = logs.slice(0, results.success).map((l) => l.id);
    if (successfulLogIds.length) {
      await this.db.attendanceLog.updateMany({
        where: { id: { in: successfulLogIds } },
        data: { processed: true },
      });
    }

    this.logger.log(
        (results.failed ? ` (${results.failed} failed)` : ''),
    );

    return results;
  }

  // ─── Ingest ───────────────────────────────────────────────────────────────

  async ingestLog(data: CreateAttendanceLogDto) {
    try {
      const user = await this.db.user.findFirst({
      });

      if (!user) throw new BadRequestException('Invalid user or user not active');

      const log = await this.db.attendanceLog.upsert({
        where: {
          userId_deviceId_direction_timestamp: {
            userId: data.userId,
            deviceId: data.deviceId,
            direction: data.direction,
            timestamp: data.timestamp,
          },
        },
        update: {},
        create: {
          userId: data.userId,
          deviceId: data.deviceId,
          direction: data.direction,
          timestamp: data.timestamp,
          rosterAssignmentId: data.rosterAssignmentId,
        },
      });

      await this.queue.addAttendanceJob({
        userId: log.userId,
        date: log.timestamp.toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        attendanceLogId: log.id,
      });

      this.logger.debug(`Ingested log ${log.id} for user ${data.userId}`);
      return log;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to ingest log: ${err.message}`, err.stack);
      throw error;
    }
  }

  async bulkIngest(logs: CreateAttendanceLogDto[]) {
    const results = { success: 0, failed: 0, errors: [] as any[] };
    const batchSize = 100;

    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(async (log) => {
          try {
            await this.ingestLog(log);
            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push({ log, error: error.message });
          }
        }),
      );
    }

    return results;
  }

  // ─── Summaries ────────────────────────────────────────────────────────────

  async getSummaries(filters: AttendanceSummaryFilters) {
    const {
      userId,
      startDate,
      endDate,
      status,
      departmentId,
      page = 1,
      limit = 50,
    } = filters;

    const where: any = {
      ...(userId && { userId }),
      ...(status && { status }),
      ...(startDate && { date: { gte: startDate } }),
      ...(endDate && { date: { lte: endDate } }),
    };

    if (departmentId) {
      const users = await this.db.user.findMany({
        select: { id: true },
      });
      where.userId = { in: users.map((u) => u.id) };
    }

    const [summaries, total] = await Promise.all([
      this.db.attendanceSummary.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              departmentId: true,
            },
          },
          shift: {
            select: { id: true, name: true, startTime: true },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.attendanceSummary.count({ where }),
    ]);

    return {
      data: summaries,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.db.attendanceSummary.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            payrollNumber: true,
            department: { select: { id: true, name: true } },
          },
        },
        logs: { orderBy: { timestamp: 'asc' } },
      },
    });
  }

  // ─── Manual Override ──────────────────────────────────────────────────────

  async manualOverride(
    adminUserId: string,
    summaryId: string,
    data: {
      firstIn?: Date;
      lastOut?: Date;
      status?: string;
      totalHours?: number;
      lateMinutes?: number;
      overtimeHours?: number;
      justification: string;
    },
  ) {
    const existing = await this.db.attendanceSummary.findFirst({
    });
    if (!existing) throw new NotFoundException('Attendance summary not found');

    const results = await this.db.$transaction([
      this.db.attendanceSummary.update({
        where: { id: summaryId },
        data: {
          firstIn: data.firstIn ?? existing.firstIn,
          lastOut: data.lastOut ?? existing.lastOut,
          status: (data.status ?? existing.status) as AttendanceStatus,
          totalHours: data.totalHours ?? existing.totalHours,
          lateMinutes: data.lateMinutes ?? existing.lateMinutes,
          overtimeHours: data.overtimeHours ?? existing.overtimeHours,
          processedAt: new Date(),
          reprocessedCount: { increment: 1 },
        },
      }),
      this.db.attendanceAudit.create({
        data: {
          userId: adminUserId,
          targetSummaryId: summaryId,
          actionType: 'OVERRIDE',
          justification: data.justification,
          oldValues: JSON.stringify({
            firstIn: existing.firstIn,
            lastOut: existing.lastOut,
            status: existing.status,
            totalHours: existing.totalHours,
          }),
          newValues: JSON.stringify(data),
        },
      }),
    ]);

    this.logger.warn(`Manual override on ${summaryId} by ${adminUserId}`);
    return results[0];
  }

  // ─── Audit Trail ──────────────────────────────────────────────────────────

    return this.db.attendanceAudit.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Recalculate ──────────────────────────────────────────────────────────

  async recalculateRange(
    startDate: Date,
    endDate: Date,
    userId?: string,
  ) {
    const where: any = {
      date: { gte: startDate, lte: endDate },
      ...(userId && { userId }),
    };

    const summaries = await this.db.attendanceSummary.findMany({
      where,
      select: { id: true, userId: true, date: true },
    });

    for (const summary of summaries) {
      await this.queue.addAttendanceJob(
        {
          userId: summary.userId,
          date: summary.date,
          createdAt: new Date().toISOString(),
          attendanceLogId: summary.id,
          correlationId: `reprocess-${summary.id}`,
        },
        3,
      );
    }

    return { queued: summaries.length };
  }

  // ─── Raw Logs ─────────────────────────────────────────────────────────────

  async getRawLogs(
    filters: any,
  ): Promise<{ data: AttendanceLog[]; total: number; page: number; limit: number }> {
    const { userId, startDate, endDate, direction, page = 1, limit = 100 } = filters;

    const where: any = {
      ...(userId && { userId }),
      ...(direction && { direction }),
      ...(startDate && { timestamp: { gte: startDate } }),
      ...(endDate && { timestamp: { lte: endDate } }),
    };

    const [logs, total] = await Promise.all([
      this.db.attendanceLog.findMany({
        where,
        include: { user: true, device: true },
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.attendanceLog.count({ where }),
    ]);

    return { data: logs, total, page, limit };
  }

  // ─── Dashboard Stats ──────────────────────────────────────────────────────

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    const dateFilter = { gte: startDate, lte: endDate };

    const stats = await this.db.$transaction([
    ]);

    return {
      date: startDate,
      totalSummaries: stats[0],
      present: stats[1],
      late: stats[2],
      absent: stats[3],
      onLeave: stats[4],
      totalEmployees: stats[5],
      attendanceRate: stats[5] > 0 ? (stats[1] / stats[5]) * 100 : 0,
    };
  }
}