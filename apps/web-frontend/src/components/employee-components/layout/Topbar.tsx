'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const [userName, setUserName] = useState('User');
  const [initials, setInitials] = useState('U');

  useEffect(() => {
    const stored = localStorage.getItem('auth_user') ?? localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        const full =
          `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() ||
          u.name ||
          u.email ||
          'User';
        setUserName(full);
        if (u.firstName || u.lastName) {
          setInitials(
            `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
          );
        } else {
          setInitials(
            full
              .split(' ')
              .map((w: string) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'U'
          );
        }
      } catch {
        // ignore invalid stored user
      }
    }
  }, []);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="h-[52px] bg-surface border-b border-border flex items-center px-6 gap-4 sticky top-0 z-40">
      <h1 className="text-heading text-primary flex-1">{title}</h1>
      <span className="text-label text-secondary hidden sm:block">{today}</span>
      <Link
        href="/user-dashboard/notifications"
        className="relative w-8 h-8 flex items-center justify-center rounded-badge border border-border hover:bg-page transition-colors"
        aria-label="Notifications"
      >
        <span className="text-secondary text-base">◻</span>
        <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-danger rounded-full" />
      </Link>
      <div className="flex items-center gap-2 pl-2 border-l border-border">
        <div className="w-7 h-7 rounded-full bg-success-bg flex items-center justify-center text-success text-xs font-semibold">
          {initials}
        </div>
        <span className="text-label text-primary font-medium hidden sm:block">
          {userName.split(' ')[0]}
        </span>
      </div>
    </header>
  );
}
