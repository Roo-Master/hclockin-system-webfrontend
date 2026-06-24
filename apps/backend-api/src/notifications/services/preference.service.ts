// services/preference.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  NotificationChannel,
  NotificationTriggerEvent,
  NotificationPreference,
  MANDATORY_EVENTS,
  PRIORITY_CHANNEL_RULES,
  HIGH_PRIORITY_EVENTS,   // ✅ restored — was commented out but used throughout
  NotificationPriority,
} from '../types/notification.types';

// In-memory store — replace with DB persistence when scaling
const preferenceStore = new Map<string, NotificationPreference>();

@Injectable()
export class PreferenceService {
  private readonly logger = new Logger(PreferenceService.name);

  constructor(private readonly db: DatabaseService) {}  // ✅ removed unused PrismaService

  private key(userId: string, event: NotificationTriggerEvent, channel: NotificationChannel) {
    return `${userId}:${event}:${channel}`;
  }

  // ==================== Existing Methods ====================

  async getEnabledChannels(
    userId: string,
    event: NotificationTriggerEvent,
  ): Promise<NotificationChannel[]> {
    const priority = HIGH_PRIORITY_EVENTS.has(event)
      ? NotificationPriority.HIGH
      : NotificationPriority.MEDIUM;

    const defaultChannels = PRIORITY_CHANNEL_RULES[priority];

    const dbPreferences = await this.db.notificationPreference.findMany({
    });

    const prefMap = new Map<string, boolean>();
    dbPreferences.forEach(pref => prefMap.set(pref.channel, pref.enabled));

    return defaultChannels.filter((channel) => {
      if (MANDATORY_EVENTS.has(event)) return true;

      const enabled = prefMap.has(channel)
        ? prefMap.get(channel)
        : preferenceStore.get(this.key(userId, event, channel))?.enabled ?? true;

      return enabled;
    });
  }

  async updatePreference(
    userId: string,
    event: NotificationTriggerEvent,
    channel: NotificationChannel,
    enabled: boolean,
  ): Promise<NotificationPreference> {
    if (MANDATORY_EVENTS.has(event) && !enabled) {
      throw new BadRequestException(
        `Notifications for "${event}" are mandatory and cannot be disabled.`,
      );
    }

    const dbPreference = await this.db.notificationPreference.upsert({
      where: {
      },
      update: { enabled },
    });

    const pref: NotificationPreference = {
      userId,
      event,
      channel,
      enabled,
      mandatory: MANDATORY_EVENTS.has(event),
    };
    preferenceStore.set(this.key(userId, event, channel), pref);

    this.logger.debug(`Preference updated: ${userId} | ${event} | ${channel} = ${enabled}`);
    return dbPreference as any;
  }

    const dbPreferences = await this.db.notificationPreference.findMany({
    });

    const dbPrefMap = new Map<string, typeof dbPreferences[number]>();
    dbPreferences.forEach(pref => dbPrefMap.set(`${pref.event}:${pref.channel}`, pref));

    const result: NotificationPreference[] = [];

    for (const event of Object.values(NotificationTriggerEvent)) {
      const priority = HIGH_PRIORITY_EVENTS.has(event as NotificationTriggerEvent)
        ? NotificationPriority.HIGH
        : NotificationPriority.MEDIUM;

      const defaultChannels = PRIORITY_CHANNEL_RULES[priority];

      for (const channel of defaultChannels) {
        const key = `${event}:${channel}`;
        const dbPref = dbPrefMap.get(key);
        const stored = preferenceStore.get(this.key(userId, event as NotificationTriggerEvent, channel));

        if (dbPref) {
          result.push({
            userId,
            event: event as NotificationTriggerEvent,
            channel,
            enabled: dbPref.enabled,
            mandatory: MANDATORY_EVENTS.has(event as NotificationTriggerEvent),
          } as NotificationPreference);
        } else if (stored) {
          result.push(stored);
        } else {
          result.push({
            userId,
            event: event as NotificationTriggerEvent,
            channel,
            enabled: true,
            mandatory: MANDATORY_EVENTS.has(event as NotificationTriggerEvent),
          } as NotificationPreference);
        }
      }
    }

    return result;
  }


    const byEvent = preferences.reduce((acc, pref) => {
      if (!acc[pref.event]) {
        acc[pref.event] = { event: pref.event, mandatory: pref.mandatory, channels: {} };
      }
      acc[pref.event].channels[pref.channel] = pref.enabled;
      return acc;
    }, {} as Record<string, any>);

    const totalPreferences = preferences.length;
    const enabledCount = preferences.filter(p => p.enabled).length;
    const disabledCount = totalPreferences - enabledCount;

    return {
      summary: {
        totalPreferences,
        enabledCount,
        disabledCount,
        enabledPercentage: totalPreferences > 0 ? (enabledCount / totalPreferences) * 100 : 0,
      },
      byEvent: Object.values(byEvent),
      settings,
    };
  }

  async bulkUpdate(
    userId: string,
    preferences: Array<{ event: NotificationTriggerEvent; channel: NotificationChannel; enabled: boolean }>,
  ): Promise<NotificationPreference[]> {
    const results: NotificationPreference[] = [];

    for (const pref of preferences) {
      const result = await this.updatePreference(
        userId,
        pref.event,
        pref.channel,
        pref.enabled,
      );
      results.push(result);
    }

    this.logger.log(`Bulk updated ${results.length} preferences for user ${userId}`);
    return results;
  }

    const deleted = await this.db.notificationPreference.deleteMany({
    });

    for (const event of Object.values(NotificationTriggerEvent)) {
      for (const channel of Object.values(NotificationChannel)) {
        preferenceStore.delete(this.key(userId, event as NotificationTriggerEvent, channel as NotificationChannel));
      }
    }

    this.logger.log(`Reset preferences to default for user ${userId}, deleted ${deleted.count} records`);
    return deleted.count;
  }

    // ✅ DatabaseService extends PrismaClient — call model directly, no .client needed
    const settings = await this.db.userSettings.findUnique({
    });

    if (!settings) {
      return {
        userId,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        digestEnabled: false,
        digestFrequency: 'daily',
        emailDigest: true,
        pushDigest: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return settings;
  }


    const updated = await this.db.userSettings.update({
      data: dto,
    });

    this.logger.log(`Updated user settings for ${userId}`);
    return updated;
  }

  async updateDigestSettings(
    userId: string,
    enabled: boolean,
    frequency?: string,
    emailDigest?: boolean,
    pushDigest?: boolean,
  ): Promise<void> {

    const updateData: any = { digestEnabled: enabled };
    if (frequency !== undefined) updateData.digestFrequency = frequency;
    if (emailDigest !== undefined) updateData.emailDigest = emailDigest;
    if (pushDigest !== undefined) updateData.pushDigest = pushDigest;

    await this.db.userSettings.update({
      data: updateData,
    });

    this.logger.log(`Updated digest settings for ${userId}: enabled=${enabled}`);
  }

  // ==================== Additional Helper Methods ====================

    const settings = await this.db.userSettings.findUnique({
    });

    return {
      enabled: settings?.quietHoursEnabled ?? false,
      start: settings?.quietHoursStart ?? '22:00',
      end: settings?.quietHoursEnd ?? '07:00',
    };
  }

  async updateQuietHours(     // ✅ added — was missing, referenced in notification.controller.ts
    userId: string,
    dto: { enabled: boolean; start: string; end: string },
  ): Promise<void> {

    await this.db.userSettings.update({
      data: {
        quietHoursEnabled: dto.enabled,
        quietHoursStart: dto.start,
        quietHoursEnd: dto.end,
      },
    });

    this.logger.log(`Updated quiet hours for ${userId}: enabled=${dto.enabled}`);
  }

  async shouldSendNow(
    userId: string,
    priority: NotificationPriority,
  ): Promise<boolean> {
    if (priority === NotificationPriority.HIGH) return true;

    if (!quietHours.enabled) return true;

    const currentHour = new Date().getHours();
    const [startHour] = quietHours.start.split(':').map(Number);
    const [endHour] = quietHours.end.split(':').map(Number);

    if (startHour > endHour) {
      // DND crosses midnight
      return !(currentHour >= startHour || currentHour < endHour);
    } else {
      return !(currentHour >= startHour && currentHour < endHour);
    }
  }

    const settings = await this.db.userSettings.findUnique({
    });
    return settings?.digestEnabled ?? true;
  }

    await this.db.userSettings.upsert({
      update: { digestEnabled: enabled },
      create: {
        userId,
        digestEnabled: enabled,
        quietHoursEnabled: false,
      },
    });
  }

    const settings = await this.db.userSettings.findMany({
      where: { digestEnabled: true },
    });

    return settings;
  }

  async getPreferenceByEvent(
    userId: string,
    event: NotificationTriggerEvent,
  ): Promise<NotificationPreference[]> {
    const dbPreferences = await this.db.notificationPreference.findMany({
    });

    if (dbPreferences.length > 0) return dbPreferences as any;

    const priority = HIGH_PRIORITY_EVENTS.has(event)
      ? NotificationPriority.HIGH
      : NotificationPriority.MEDIUM;

    const defaultChannels = PRIORITY_CHANNEL_RULES[priority];

    return defaultChannels.map(channel => ({
      userId,
      event,
      channel,
      enabled: true,
      mandatory: MANDATORY_EVENTS.has(event),
    } as NotificationPreference));
  }

  async validateChannelForEvent(
    userId: string,
    event: NotificationTriggerEvent,
    channel: NotificationChannel,
  ): Promise<boolean> {
    const priority = HIGH_PRIORITY_EVENTS.has(event)
      ? NotificationPriority.HIGH
      : NotificationPriority.MEDIUM;

    const allowedChannels = PRIORITY_CHANNEL_RULES[priority];
    return allowedChannels.includes(channel);
  }

    const existing = await this.db.userSettings.findUnique({
    });

    if (!existing) {
      await this.db.userSettings.create({
        data: {
          userId,
          quietHoursEnabled: false,
          digestEnabled: false,
        },
      });
    }
  }
}