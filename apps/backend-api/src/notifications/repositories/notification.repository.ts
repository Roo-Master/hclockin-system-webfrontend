// repositories/notification.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationTriggerEvent,
  NotificationAction,
} from '../types/notification.types';

export interface CreateNotificationRecord {
  userId: string;
  channel: NotificationChannel;
  recipient: string;
  title: string;
  body: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  triggerEvent?: NotificationTriggerEvent;
  actions?: NotificationAction[];
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationData {
  status?: NotificationStatus;
  readAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  retryCount?: number;
}

@Injectable()
export class NotificationRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateNotificationRecord) {
    return this.db.notificationLog.create({
      data: {
        userId: data.userId,
        channel: data.channel,
        recipient: data.recipient,
        title: data.title,
        body: data.body,
        status: data.status,
        priority: data.priority,
        triggerEvent: data.triggerEvent,
        actions: data.actions ? (data.actions as any) : undefined,
        metadata: data.metadata || undefined,
        expiresAt: data.expiresAt,
      },
    });
  }

  async updateStatus(
    id: string,
    status: NotificationStatus,
    extra?: {
      readAt?: Date;
      sentAt?: Date;
      deliveredAt?: Date;
      errorMessage?: string;
    },
  ) {
    return this.db.notificationLog.update({
      where: { id },
      data: { status, ...extra },
    });
  }

  async update(id: string, data: UpdateNotificationData) {
    return this.db.notificationLog.update({
      where: { id },
      data,
    });
  }

  async incrementRetry(id: string, errorMessage?: string) {
    return this.db.notificationLog.update({
      where: { id },
      data: {
        retryCount: { increment: 1 },
        errorMessage: errorMessage,
      },
    });
  }

    return this.db.notificationLog.findFirst({
    });
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
    filter?: { unreadOnly?: boolean; type?: NotificationTriggerEvent },
  ) {

    if (filter?.unreadOnly) {
      where.status = {
        in: [NotificationStatus.SENT, NotificationStatus.DELIVERED, NotificationStatus.PENDING],
      };
    }

    if (filter?.type) {
      where.triggerEvent = filter.type;
    }

    const [data, total] = await Promise.all([
      this.db.notificationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.notificationLog.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

    return this.db.notificationLog.findMany({
      where: {
        status: NotificationStatus.PENDING,
        createdAt: { lte: new Date() },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { priority: 'desc', createdAt: 'asc' },
      take: limit,
    });
  }

    return this.db.notificationLog.findMany({
      where: {
        channel,
        status: NotificationStatus.PENDING,
        createdAt: { lte: new Date() },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { priority: 'desc', createdAt: 'asc' },
      take: limit,
    });
  }

    return this.db.notificationLog.findMany({
      where: {
        status: NotificationStatus.FAILED,
        retryCount: { lt: maxRetries },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findExpired() {
    return this.db.notificationLog.findMany({
      where: {
        expiresAt: { lte: new Date() },
        status: {
          notIn: [NotificationStatus.EXPIRED, NotificationStatus.READ, NotificationStatus.SENT],
        },
      },
    });
  }

  async markAsExpired(id: string) {
    return this.db.notificationLog.update({
      where: { id },
      data: { status: NotificationStatus.EXPIRED },
    });
  }

    return this.db.notificationLog.updateMany({
      data: { status: NotificationStatus.READ, readAt: new Date() },
    });
  }

  async markAsSent(id: string, sentAt?: Date) {
    return this.db.notificationLog.update({
      where: { id },
      data: { status: NotificationStatus.SENT, sentAt: sentAt || new Date() },
    });
  }

  async markAsDelivered(id: string, deliveredAt?: Date) {
    return this.db.notificationLog.update({
      where: { id },
      data: {
        status: NotificationStatus.DELIVERED,
        deliveredAt: deliveredAt || new Date(),
      },
    });
  }

  async markAsFailed(id: string, errorMessage: string) {
    return this.db.notificationLog.update({
      where: { id },
      data: { status: NotificationStatus.FAILED, errorMessage },
    });
  }

    return this.db.notificationLog.updateMany({
      where: {
        userId,
        status: {
          in: [NotificationStatus.SENT, NotificationStatus.DELIVERED, NotificationStatus.PENDING],
        },
      },
      data: { status: NotificationStatus.READ, readAt: new Date() },
    });
  }

    return this.db.notificationLog.count({
      where: {
        userId,
        status: {
          in: [NotificationStatus.SENT, NotificationStatus.DELIVERED, NotificationStatus.PENDING],
        },
      },
    });
  }

  }

    const sinceDate = since || new Date();
    sinceDate.setHours(sinceDate.getHours() - 24);

    return this.db.notificationLog.findMany({
      where: {
        userId,
        priority: NotificationPriority.LOW,
        status: NotificationStatus.PENDING,
        createdAt: { gte: sinceDate },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEvent(
    userId: string,
    event: NotificationTriggerEvent,
    startDate: Date,
    endDate: Date,
  ) {
    return this.db.notificationLog.findMany({
      where: {
        userId,
        triggerEvent: event,
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

    const [data, total] = await Promise.all([
      this.db.notificationLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.notificationLog.count({
      }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.db.notificationLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: [NotificationStatus.READ, NotificationStatus.EXPIRED] },
      },
    });
  }

    if (userId) where.userId = userId;
    if (olderThanDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      where.createdAt = { lt: cutoffDate };
    }
    return this.db.notificationLog.deleteMany({ where });
  }

    const [total, sent, delivered, failed, read, pending] = await Promise.all([
      this.db.notificationLog.count({
      }),
      this.db.notificationLog.count({
      }),
      this.db.notificationLog.count({
      }),
      this.db.notificationLog.count({
      }),
      this.db.notificationLog.count({
      }),
      this.db.notificationLog.count({
      }),
    ]);

    return {
      total,
      sent,
      delivered,
      failed,
      read,
      pending,
      successRate: total > 0 ? (((sent + delivered) / total) * 100).toFixed(2) : '0',
    };
  }

    const channels = Object.values(NotificationChannel);
    const results: Record<string, any> = {};

    for (const channel of channels) {
      const [total, sent, failed] = await Promise.all([
        this.db.notificationLog.count({
        }),
        this.db.notificationLog.count({
          where: {
            channel,
            createdAt: { gte: startDate, lte: endDate },
            status: { in: [NotificationStatus.SENT, NotificationStatus.DELIVERED] },
          },
        }),
        this.db.notificationLog.count({
          where: {
            channel,
            createdAt: { gte: startDate, lte: endDate },
            status: NotificationStatus.FAILED,
          },
        }),
      ]);

      results[channel] = { total, sent, failed };
    }

    return results;
  }

    const events = await this.db.notificationLog.groupBy({
      by: ['triggerEvent'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        triggerEvent: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    return events.map((event) => ({
      event: event.triggerEvent,
      count: event._count.id,
    }));
  }

  async bulkCreate(notifications: CreateNotificationRecord[]) {
    return this.db.notificationLog.createMany({
      data: notifications.map((n) => ({
        userId: n.userId,
        channel: n.channel,
        recipient: n.recipient,
        title: n.title,
        body: n.body,
        status: n.status,
        priority: n.priority,
        triggerEvent: n.triggerEvent,
        actions: n.actions ? (n.actions as any) : undefined,
        metadata: n.metadata || undefined,
        expiresAt: n.expiresAt,
      })),
    });
  }

    const unreadStatuses = {
      in: [NotificationStatus.SENT, NotificationStatus.DELIVERED, NotificationStatus.PENDING],
    };

    const [high, medium, low] = await Promise.all([
      this.db.notificationLog.count({
      }),
      this.db.notificationLog.count({
      }),
      this.db.notificationLog.count({
      }),
    ]);

    return { high, medium, low, total: high + medium + low };
  }

  async findByExternalId(externalId: string) {
    return this.db.notificationLog.findFirst({
      where: { metadata: { path: ['externalId'], equals: externalId } },
    });
  }

  }

  async updateMany(where: any, data: any) {
    return this.db.notificationLog.updateMany({ where, data });
  }

  // ── Methods required by retry-failed.job.ts ───────────────────────────────

  /**
   */
  async getDistinctTenants(): Promise<string[]> {
    const rows = await this.db.notificationLog.findMany({
    });
  }

  // ── Methods required by send-notification.job.ts (digest) ─────────────────

  /**
   * Creates a digest record stored in notification metadata.
   * Since there is no separate digest table, we store it as a
   * special notificationLog entry with channel IN_APP and a
   * digest marker in metadata.
   */
  async createDigest(data: {
    userId: string;
    type: 'daily' | 'weekly';
    title: string;
    body: string;
    items: any[];
    status: string;
  }) {
    return this.db.notificationLog.create({
      data: {
        userId: data.userId,
        channel: NotificationChannel.IN_APP,
        recipient: data.userId,
        title: data.title,
        body: data.body,
        status: NotificationStatus.PENDING,
        priority: NotificationPriority.LOW,
        metadata: {
          isDigest: true,
          digestType: data.type,
          digestStatus: data.status,
          items: data.items,
        } as any,
      },
    });
  }

  /**
   * Updates the digest status stored in metadata.
   * `extra` can be a messageId (success) or error string (failure).
   */
  async updateDigestStatus(
    digestId: string,
    status: 'sent' | 'failed',
    extra?: string,
  ) {
    const notifStatus = status === 'sent' ? NotificationStatus.SENT : NotificationStatus.FAILED;

    return this.db.notificationLog.update({
      where: { id: digestId },
      data: {
        status: notifStatus,
        ...(status === 'sent'
          ? { sentAt: new Date() }
          : { errorMessage: extra }),
        metadata: {
          isDigest: true,
          digestStatus: status,
          ...(status === 'sent' ? { messageId: extra } : { error: extra }),
        } as any,
      },
    });
  }
}