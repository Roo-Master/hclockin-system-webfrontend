'use client';

import Link from 'next/link';

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="h-[52px] bg-surface border-b border-border flex items-center px-6 gap-4 sticky top-0 z-40">
      {/* Title */}
      <h1 className="text-heading text-primary flex-1">{title}</h1>

      {/* Date */}
      <span className="text-label text-secondary hidden sm:block">{today}</span>

      {/* Notification bell */}
      <Link
        href="/dashboard/notifications"
        className="relative w-8 h-8 flex items-center justify-center rounded-badge border border-border hover:bg-page transition-colors"
        aria-label="Notifications"
      >
        <span className="text-secondary text-base">◻</span>
        <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-danger rounded-full" />
      </Link>

      {/* User */}
      <div className="flex items-center gap-2 pl-2 border-l border-border">
        <div className="w-7 h-7 rounded-full bg-success-bg flex items-center justify-center text-success text-xs font-semibold">
          MK
        </div>
        <span className="text-label text-primary font-medium hidden sm:block">Mary K.</span>
      </div>
    </header>
  );
}