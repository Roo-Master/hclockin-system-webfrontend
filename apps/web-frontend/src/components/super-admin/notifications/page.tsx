'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppNotification, NotificationType } from '@/lib/(super-admin)/super-admin/types';
import { formatRelativeTime } from '@/lib/(super-admin)/super-admin/format';
import { superAdminApi } from '@/lib/(super-admin)/super-admin/api';

type Filter = 'all' | 'unread';

const TYPE_STYLES: Record<NotificationType, { badge: string; icon: string; label: string }> = {
  success: { badge: 'bg-green-500/10 text-green-400', icon: '✓', label: 'Success' },
  error:   { badge: 'bg-red-500/10 text-red-400',     icon: '!', label: 'Error' },
  warning: { badge: 'bg-amber-500/10 text-amber-400', icon: '⚠', label: 'Warning' },
  info:    { badge: 'bg-blue-500/10 text-blue-400',   icon: 'i', label: 'Info' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [filter, setFilter]               = useState<Filter>('all');

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await superAdminApi.getNotifications() as { notifications: AppNotification[] };
      setNotifications(data.notifications ?? []);
    } catch (err) {
      setError('Could not load notifications. Try refreshing the page.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const visibleNotifications = useMemo(
    () => (filter === 'unread' ? notifications.filter((n) => !n.read) : notifications),
    [notifications, filter]
  );

  const markAsRead = async (id: string, read: boolean) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read } : n)));
    try {
      await superAdminApi.markNotification(id, read);
    } catch (err) {
      console.error(err);
      // Roll back on failure
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !read } : n)));
    }
  };

  const dismissNotification = async (id: string) => {
    const previous = notifications;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await superAdminApi.dismissNotification(id);
    } catch (err) {
      console.error(err);
      setNotifications(previous);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const data = await superAdminApi.markAllAsRead() as { notifications: AppNotification[] };
      // Sync with server response instead of relying solely on optimistic state
      setNotifications(data.notifications ?? previous);
    } catch (err) {
      console.error(err);
      setNotifications(previous);
    }
  };

  return (
    <div className="min-h-full bg-gray-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Notifications</h1>
            <p className="mt-1 text-sm text-gray-400">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`
                : 'You are all caught up.'}
            </p>
          </div>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark all as read
          </button>
        </div>

        <div className="mb-4 flex gap-2 border-b border-gray-800">
          {(['all', 'unread'] as Filter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                filter === tab
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'border-b-2 border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All' : 'Unread'}
              {tab === 'unread' && unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-gray-800 px-1.5 py-0.5 text-xs text-gray-300">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="py-12 text-center text-sm text-gray-400">Loading notifications…</div>
        )}

        {!isLoading && error && (
          <div className="rounded-md border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {!isLoading && !error && visibleNotifications.length === 0 && (
          <div className="rounded-md border border-gray-800 bg-gray-900 px-4 py-10 text-center text-sm text-gray-400">
            {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
          </div>
        )}

        {!isLoading && !error && visibleNotifications.length > 0 && (
          <ul className="space-y-2">
            {visibleNotifications.map((notification) => {
              const style = TYPE_STYLES[notification.type];
              const content = (
                <div className="flex gap-3">
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${style.badge}`}
                    aria-hidden="true"
                  >
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" aria-label="Unread" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-400">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatRelativeTime(notification.createdAt)}</p>
                  </div>
                </div>
              );

              return (
                <li
                  key={notification.id}
                  className="flex items-start justify-between gap-4 rounded-md border border-gray-800 bg-gray-900 px-4 py-3 transition-colors hover:border-gray-700"
                >
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      onClick={() => !notification.read && markAsRead(notification.id, true)}
                      className="flex-1 min-w-0"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="flex-1 min-w-0">{content}</div>
                  )}

                  <div className="flex flex-shrink-0 items-center gap-1">
                    <button
                      onClick={() => markAsRead(notification.id, !notification.read)}
                      className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white"
                    >
                      {notification.read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      aria-label="Dismiss notification"
                      className="rounded px-2 py-1 text-xs text-gray-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}