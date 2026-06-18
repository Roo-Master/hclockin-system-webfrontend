'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function SuperAdminTopbar() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadUnreadCount = async () => {
      try {
        const res = await fetch('/api/notifications/unread-count');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setUnreadCount(data.unreadCount ?? 0);
      } catch (err) {
        console.error('Failed to load unread notification count', err);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="text-gray-400 text-sm">
        {/* Breadcrumb — TODO */}
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative text-gray-400 hover:text-white text-sm transition-colors"
        >
          <span aria-hidden="true">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[16px] rounded-full bg-red-600 px-1 text-center text-[10px] font-semibold leading-[16px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <Link
          href="/profile"
          aria-label="View profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold transition-colors hover:bg-blue-500"
        >
          SA
        </Link>
      </div>
    </header>
  );
}

// Export as Header for consistent naming
export { SuperAdminTopbar as Header };
