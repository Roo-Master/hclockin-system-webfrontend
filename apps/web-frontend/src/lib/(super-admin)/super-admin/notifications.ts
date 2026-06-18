// src/lib/super-admin/notifications.ts
import type {
  NotificationLog,
  NotificationTriggerEvent,
} from '@prisma/client';
import { AppNotification, NotificationType } from './types';

// Tune these groupings to taste — this is just a sensible starting point.
const SUCCESS_EVENTS = new Set<NotificationTriggerEvent>([
  'CLOCK_IN',
  'CLOCK_OUT',
  'LEAVE_REQUEST_APPROVED',
  'SHIFT_ASSIGNED',
  'SCHEDULE_POSTED',
]);

const ERROR_EVENTS = new Set<NotificationTriggerEvent>([
  'LEAVE_REQUEST_REJECTED',
  'INTEGRATION_FAILED',
  'MISSED_PUNCH',
  'MISSED_BREAK',
]);

const WARNING_EVENTS = new Set<NotificationTriggerEvent>([
  'LATE_IN',
  'EARLY_OUT',
  'OVERTIME_APPROACHING',
  'UNSUBMITTED_TIMESHEET',
  'SHIFT_CHANGED',
  'SHIFT_SWAP_REQUESTED',
  'OPEN_SHIFT_BID',
  'CLOCK_IN_REMINDER',
  'TIMECARD_EDITED',
]);

function mapType(log: NotificationLog): NotificationType {
  if (log.status === 'FAILED' || log.status === 'EXPIRED') return 'error';

  if (log.triggerEvent) {
    if (SUCCESS_EVENTS.has(log.triggerEvent)) return 'success';
    if (ERROR_EVENTS.has(log.triggerEvent)) return 'error';
    if (WARNING_EVENTS.has(log.triggerEvent)) return 'warning';
  }

  if (log.priority === 'HIGH') return 'warning';

  return 'info';
}

function extractLink(log: NotificationLog): string | null {
  const metadata = log.metadata as unknown as Record<string, unknown> | null;
  if (metadata && typeof metadata.link === 'string') return metadata.link;

  const actions = log.actions as unknown as Array<{ url?: string }> | null;
  if (Array.isArray(actions) && typeof actions[0]?.url === 'string') {
    return actions[0].url;
  }

  return null;
}

export function toAppNotification(log: NotificationLog): AppNotification {
  return {
    id: log.id,
    type: mapType(log),
    title: log.title,
    message: log.body,
    createdAt: log.createdAt.toISOString(),
    read: log.status === 'READ',
    link: extractLink(log),
  };
}