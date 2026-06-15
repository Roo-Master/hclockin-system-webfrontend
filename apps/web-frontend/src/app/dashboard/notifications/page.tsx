'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const initialNotifications = [
  { id: 1, icon: '⚠', iconStyle: 'bg-warning-bg text-warning', text: 'Missing clock-out detected for Thu 11 Jun. Please submit a correction.', time: 'Today · 08:00', read: false },
  { id: 2, icon: '▦', iconStyle: 'bg-info-bg text-info', text: 'Shift assigned: Night shift ICU on Thu 18 Jun. Pending roster confirmation.', time: 'Yesterday · 14:32', read: false },
  { id: 3, icon: '◷', iconStyle: 'bg-warning-bg text-warning', text: 'Your annual leave request for Jul 3–7 is pending HR approval.', time: 'Fri 12 Jun · 10:15', read: false },
  { id: 4, icon: '✓', iconStyle: 'bg-success-bg text-success', text: 'Sick leave for May 22–23 has been approved by HR.', time: 'Fri 22 May · 09:44', read: true },
  { id: 5, icon: '✎', iconStyle: 'bg-info-bg text-info', text: 'Your correction request for missing clock-out is under review.', time: 'Mon 15 Jun · 07:30', read: false },
  { id: 6, icon: '◯', iconStyle: 'bg-page text-secondary', text: 'Profile update reminder: Please verify your contact details.', time: 'Sun 14 Jun · 16:20', read: true },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  function markAsRead(id: number) {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }

  function markAllAsRead() {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout title="Notifications">
      <div className="flex flex-col gap-5">

        {unreadCount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-label text-secondary">{unreadCount} unread notifications</span>
            <button onClick={markAllAsRead} className="text-label text-success hover:underline">
              Mark all as read
            </button>
          </div>
        )}

        <div className="bg-surface border border-border rounded-card overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 p-4 border-b border-border last:border-0 cursor-pointer hover:bg-page transition-colors ${!notif.read ? 'bg-page/30' : ''}`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base ${notif.iconStyle}`}>
                {notif.icon}
              </div>
              <div className="flex-1">
                <p className={`text-body leading-snug ${!notif.read ? 'font-medium text-primary' : 'text-secondary'}`}>
                  {notif.text}
                </p>
                <p className="text-label text-tertiary mt-1">{notif.time}</p>
              </div>
              {!notif.read && <div className="w-2 h-2 rounded-full bg-info flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}