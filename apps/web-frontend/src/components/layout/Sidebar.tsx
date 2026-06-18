'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    section: 'OVERVIEW',
    links: [
      { label: 'Dashboard', href: '/dashboard', icon: '⊞' },
    ],
  },
  {
    section: 'ATTENDANCE',
    links: [
      { label: 'My Attendance', href: '/dashboard/attendance', icon: '◷' },
      { label: 'Clock History', href: '/dashboard/clock-history', icon: '≡' },
      { label: 'Correction Request', href: '/dashboard/correction-request', icon: '✎', badge: 1 },
    ],
  },
  {
    section: 'SCHEDULE',
    links: [
      { label: 'My Shifts', href: '/dashboard/shifts', icon: '▦' },
    ],
  },
  {
    section: 'LEAVE',
    links: [
      { label: 'Apply for Leave', href: '/dashboard/apply-leave', icon: '✈' },
      { label: 'Leave History', href: '/dashboard/leave-history', icon: '✓', badge: 2 },
      { label: 'Leave Balances', href: '/dashboard/leave-balances', icon: '◑' },
    ],
  },
  {
    section: 'ACCOUNT',
    links: [
      { label: 'My Profile', href: '/dashboard/profile', icon: '◯' },
      { label: 'Notifications', href: '/dashboard/notifications', icon: '◻', badge: 3 },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-sidebar flex flex-col z-50">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-success-bg flex items-center justify-center text-success font-bold text-sm">
            H
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Hospital Chronos</p>
            <p className="text-white/40 text-xs leading-tight">Kenyatta National</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navItems.map((group) => (
          <div key={group.section} className="mb-2">
            <p className="px-5 py-1 text-white/30 text-[10px] font-semibold tracking-widest uppercase">
              {group.section}
            </p>
            {group.links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-5 py-2 text-sm transition-all border-l-2 ${
                    isActive
                      ? 'bg-white/10 text-white border-success'
                      : 'text-white/60 border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-base w-5 text-center">{link.icon}</span>
                  <span className="flex-1">{link.label}</span>
                  {link.badge && (
                    <span className="bg-danger text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-pill">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-success-bg flex items-center justify-center text-success text-xs font-semibold">
            MK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Mary Kamau</p>
            <p className="text-white/40 text-[10px]">Nurse · ICU</p>
          </div>
        </div>
      </div>
    </aside>
  );
}