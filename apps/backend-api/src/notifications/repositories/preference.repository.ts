// repositories/preference.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  NotificationChannel,
  NotificationTriggerEvent,
  NotificationPreference,
  MANDATORY_EVENTS,
} from '../types/notification.types';

export interface CreatePreferenceDto {
  userId: string;
  event: NotificationTriggerEvent;
  channel: NotificationChannel;
  enabled: boolean;
}

export interface UpdatePreferenceDto {
  enabled?: boolean;
}

export interface BulkUpdateDto {
  preferences: Array<{
    event: NotificationTriggerEvent;
    channel: NotificationChannel;
    enabled: boolean;
  }>;
}

@Injectable()
export class PreferenceRepository {
  private readonly logger = new Logger(PreferenceRepository.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Create a new notification preference
   */
  async create(data: CreatePreferenceDto): Promise<NotificationPreference> {
    try {
      const preference = await this.db.notificationPreference.create({
        data: {
          userId: data.userId,
          event: data.event,
          channel: data.channel,
          enabled: data.enabled,
        },
      });
      
      this.logger.debug(`Created preference: ${data.userId} - ${data.event} - ${data.channel}`);
      return preference as NotificationPreference;
    } catch (error) {
      this.logger.error(`Failed to create preference: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upsert (update or create) a notification preference
   */
  async upsert(
    userId: string,
    event: NotificationTriggerEvent,
    channel: NotificationChannel,
    enabled: boolean,
  ): Promise<NotificationPreference> {
    try {
      const preference = await this.db.notificationPreference.upsert({
        where: {
            userId,
            event,
            channel,
          },
        },
        update: { enabled },
        create: {
          userId,
          event,
          channel,
          enabled,
        },
      });
      
      return preference as NotificationPreference;
    } catch (error) {
      this.logger.error(`Failed to upsert preference: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find preference by ID
   */
  async findById(id: string): Promise<NotificationPreference | null> {
    try {
      const preference = await this.db.notificationPreference.findUnique({
        where: { id },
      });
      
      return preference as NotificationPreference | null;
    } catch (error) {
      this.logger.error(`Failed to find preference by ID: ${error.message}`);
      throw error;
    }
  }

  /**
   */
  async findOne(
    userId: string,
    event: NotificationTriggerEvent,
    channel: NotificationChannel,
  ): Promise<NotificationPreference | null> {
    try {
      const preference = await this.db.notificationPreference.findUnique({
        where: {
            userId,
            event,
            channel,
          },
        },
      });
      
      return preference as NotificationPreference | null;
    } catch (error) {
      this.logger.error(`Failed to find preference: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all preferences for a user
   */
  async findByUser(
    userId: string,
    options?: { event?: NotificationTriggerEvent; channel?: NotificationChannel },
  ): Promise<NotificationPreference[]> {
    try {
      
      if (options?.event) {
        where.event = options.event;
      }
      
      if (options?.channel) {
        where.channel = options.channel;
      }
      
      const preferences = await this.db.notificationPreference.findMany({
        where,
        orderBy: [{ event: 'asc' }, { channel: 'asc' }],
      });
      
      return preferences as NotificationPreference[];
    } catch (error) {
      this.logger.error(`Failed to find preferences by user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all preferences for an event across users
   */
  async findByEvent(
    event: NotificationTriggerEvent,
  ): Promise<NotificationPreference[]> {
    try {
      const preferences = await this.db.notificationPreference.findMany({
      });
      
      return preferences as NotificationPreference[];
    } catch (error) {
      this.logger.error(`Failed to find preferences by event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get enabled channels for a specific event and user
   */
  async getEnabledChannels(
    userId: string,
    event: NotificationTriggerEvent,
    defaultChannels: NotificationChannel[],
  ): Promise<NotificationChannel[]> {
    try {
      
      // If no preferences found, return default channels
      if (preferences.length === 0) {
        return defaultChannels;
      }
      
      // Filter channels that are enabled
      const enabledChannels = preferences
        .filter(pref => pref.enabled)
        .map(pref => pref.channel);
      
      // For mandatory events, ensure all default channels are included
      if (MANDATORY_EVENTS.has(event)) {
        const mandatoryChannels = [...defaultChannels];
        for (const channel of mandatoryChannels) {
          if (!enabledChannels.includes(channel)) {
            enabledChannels.push(channel);
          }
        }
      }
      
      return enabledChannels;
    } catch (error) {
      this.logger.error(`Failed to get enabled channels: ${error.message}`);
      return defaultChannels; // Fallback to defaults
    }
  }

  /**
   * Update a preference
   */
  async update(
    userId: string,
    event: NotificationTriggerEvent,
    channel: NotificationChannel,
    data: UpdatePreferenceDto,
  ): Promise<NotificationPreference> {
    try {
      const preference = await this.db.notificationPreference.update({
        where: {
            userId,
            event,
            channel,
          },
        },
        data: {
          enabled: data.enabled,
        },
      });
      
      this.logger.debug(`Updated preference: ${userId} - ${event} - ${channel} = ${data.enabled}`);
      return preference as NotificationPreference;
    } catch (error) {
      this.logger.error(`Failed to update preference: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk update preferences for a user
   */
  async bulkUpdate(
    userId: string,
    updates: BulkUpdateDto,
  ): Promise<NotificationPreference[]> {
    const results: NotificationPreference[] = [];
    
    for (const pref of updates.preferences) {
      const result = await this.upsert(
        userId,
        pref.event,
        pref.channel,
        pref.enabled,
      );
      results.push(result);
    }
    
    this.logger.debug(`Bulk updated ${results.length} preferences for user ${userId}`);
    return results;
  }

  /**
   * Reset all preferences for a user to default (enabled)
   */
    try {
      const result = await this.db.notificationPreference.updateMany({
        data: { enabled: true },
      });
      
      this.logger.log(`Reset ${result.count} preferences for user ${userId}`);
      return result.count;
    } catch (error) {
      this.logger.error(`Failed to reset preferences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a specific preference
   */
  async delete(
    userId: string,
    event: NotificationTriggerEvent,
    channel: NotificationChannel,
  ): Promise<boolean> {
    try {
      await this.db.notificationPreference.delete({
        where: {
            userId,
            event,
            channel,
          },
        },
      });
      
      this.logger.debug(`Deleted preference: ${userId} - ${event} - ${channel}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete preference: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete all preferences for a user
   */
    try {
      const result = await this.db.notificationPreference.deleteMany({
      });
      
      this.logger.log(`Deleted ${result.count} preferences for user ${userId}`);
      return result.count;
    } catch (error) {
      this.logger.error(`Failed to delete user preferences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get preference summary for a user
   */
    total: number;
    enabled: number;
    disabled: number;
    byEvent: Record<string, { enabled: number; total: number }>;
    byChannel: Record<string, { enabled: number; total: number }>;
  }> {
    
    const total = preferences.length;
    const enabled = preferences.filter(p => p.enabled).length;
    const disabled = total - enabled;
    
    const byEvent: Record<string, { enabled: number; total: number }> = {};
    const byChannel: Record<string, { enabled: number; total: number }> = {};
    
    for (const pref of preferences) {
      // By event
      if (!byEvent[pref.event]) {
        byEvent[pref.event] = { enabled: 0, total: 0 };
      }
      byEvent[pref.event].total++;
      if (pref.enabled) byEvent[pref.event].enabled++;
      
      // By channel
      if (!byChannel[pref.channel]) {
        byChannel[pref.channel] = { enabled: 0, total: 0 };
      }
      byChannel[pref.channel].total++;
      if (pref.enabled) byChannel[pref.channel].enabled++;
    }
    
    return { total, enabled, disabled, byEvent, byChannel };
  }

  /**
   * Copy preferences from one user to another
   */
  async copyPreferences(
    fromUserId: string,
    toUserId: string,
  ): Promise<number> {
    try {
      
      let created = 0;
      for (const pref of sourcePreferences) {
        await this.upsert(
          toUserId,
          pref.event,
          pref.channel,
          pref.enabled,
        );
        created++;
      }
      
      this.logger.log(`Copied ${created} preferences from ${fromUserId} to ${toUserId}`);
      return created;
    } catch (error) {
      this.logger.error(`Failed to copy preferences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all preferences with pagination
   */
  async findAllPaginated(
    page = 1,
    limit = 50,
    filter?: { event?: NotificationTriggerEvent; channel?: NotificationChannel; enabled?: boolean },
  ): Promise<{ data: NotificationPreference[]; total: number; page: number; limit: number }> {
    try {
      
      if (filter?.event) where.event = filter.event;
      if (filter?.channel) where.channel = filter.channel;
      if (filter?.enabled !== undefined) where.enabled = filter.enabled;
      
      const [data, total] = await Promise.all([
        this.db.notificationPreference.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [{ userId: 'asc' }, { event: 'asc' }, { channel: 'asc' }],
        }),
        this.db.notificationPreference.count({ where }),
      ]);
      
      return {
        data: data as NotificationPreference[],
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to find paginated preferences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if a user has any custom preferences
   */
    try {
      const count = await this.db.notificationPreference.count({
      });
      
      return count > 0;
    } catch (error) {
      this.logger.error(`Failed to check custom preferences: ${error.message}`);
      return false;
    }
  }

  /**
   * Get default preferences for all events and channels
   */
  async getDefaultsForUser(
    userId: string,
  ): Promise<Array<{ event: NotificationTriggerEvent; channel: NotificationChannel; enabled: boolean }>> {
    const events = Object.values(NotificationTriggerEvent);
    const channels = Object.values(NotificationChannel);
    const defaults: Array<{ event: NotificationTriggerEvent; channel: NotificationChannel; enabled: boolean }> = [];
    
    for (const event of events) {
      for (const channel of channels) {
        defaults.push({
          event,
          channel,
          enabled: true, // Default to enabled
        });
      }
    }
    
    return defaults;
  }

  /**
   * Initialize default preferences for a new user
   */
    let created = 0;
    
    for (const pref of defaults) {
      created++;
    }
    
    this.logger.log(`Initialized ${created} preferences for new user ${userId}`);
    return created;
  }
}