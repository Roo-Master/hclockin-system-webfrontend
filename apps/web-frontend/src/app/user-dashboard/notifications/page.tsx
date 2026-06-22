'use client';

import DashboardLayout from '@/components/user-components/layout/DashboardLayout';
import { useMyNotifications } from '@/hooks/user-hooks/useGeneralUser';
import { markNotificationRead, markAllNotificationsRead } from '@/app/api/user-api/userService';

export default function NotificationsPage() {
  const { data, loading, error, refetch } = useMyNotifications();
  const notifications: Array<Record<string, unknown>> = data?.data ?? data ?? [];
  const unreadCount = notifications.filter(
    (n) => !n.readAt && !n.isRead
  ).length;

  async function markAsRead(id: string) {
    await markNotificationRead(id);
    refetch();
  }

  async function markAllAsRead() {
    await markAllNotificationsRead();
    refetch();
  }

  return (
    <DashboardLayout title="Notifications">
      <div className="flex flex-col gap-5">
        {!loading && unreadCount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-label text-secondary">{unreadCount} unread notifications</span>
            <button onClick={markAllAsRead} className="text-label text-success hover:underline">
              Mark all as read
            </button>
          </div>
        )}
        {loading && <p className="text-label text-secondary">Loading...</p>}
        {error && <p className="text-label text-danger">Error: {error}</p>}
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          {notifications.map((notif) => {
            const isRead = Boolean(notif.readAt || notif.isRead);
            const message = String(notif.message ?? notif.body ?? notif.title ?? '');
            const createdAt = notif.createdAt as string | undefined;

            return (
              <div
                key={String(notif.id)}
                className={`flex items-start gap-3 p-4 border-b border-border last:border-0 cursor-pointer hover:bg-page transition-colors ${
                  !isRead ? 'bg-page/30' : ''
                }`}
                onClick={() => !isRead && markAsRead(String(notif.id))}
              >
                <div className="flex-1">
                  <p
                    className={`text-body leading-snug ${
                      !isRead ? 'font-medium text-primary' : 'text-secondary'
                    }`}
                  >
                    {message}
                  </p>
                  <p className="text-label text-tertiary mt-1">
                    {createdAt ? new Date(createdAt).toLocaleString() : '—'}
                  </p>
                </div>
                {!isRead && <div className="w-2 h-2 rounded-full bg-info flex-shrink-0 mt-1" />}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
