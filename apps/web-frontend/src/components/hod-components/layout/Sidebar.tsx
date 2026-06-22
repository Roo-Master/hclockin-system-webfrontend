'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth } from '@/lib/api';
import type { AuthUser } from '@/types/hod';

// Navigation items for HOD portal
const NAV_ITEMS = [
  {
    href: '/hod/dashboard',
    label: 'Dashboard',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: '/hod/roster',
    label: 'Roster',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    href: '/hod/attendance',
    label: 'Attendance',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/hod/staff',
    label: 'Staff',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    href: '/hod/leave',
    label: 'Leave',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    href: '/hod/reports',
    label: 'Reports',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    href: '/hod/activity',
    label: 'My Activity',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 8.25v3.75l2.25 1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

interface SidebarProps {
  user: AuthUser | null;
  onToggle?: (collapsed: boolean) => void;
}

// Sidebar Component for HOD Portal
export function Sidebar({ user, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = () => {
    clearAuth();
    router.push('/auth/login');
  };

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <aside className={`fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 z-40 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo */}
      <div className={`p-4 border-b border-gray-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed ? (
          <>
            <div>
              <div className="text-blue-400 font-bold text-lg">⏱ Chronos</div>
              <div className="text-gray-500 text-xs mt-1">HOD Portal</div>
            </div>
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-white transition-colors p-1 rounded"
              aria-label="Collapse sidebar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-white transition-colors p-1 rounded"
            aria-label="Expand sidebar"
          >
            <div className="text-blue-400 font-bold text-lg">⏱</div>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className={`p-3 border-t border-gray-800 ${collapsed ? 'flex justify-center' : ''}`}>
        {user ? (
          <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}>
            <div className={`w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 ${
              collapsed ? 'w-10 h-10' : ''
            }`}>
              <span className="text-white text-xs font-bold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-medium truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {user.department?.name ?? 'Department'}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-red-400 transition-colors p-1"
                  title="Sign out"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </button>
              </>
            )}
            {collapsed && (
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-red-400 transition-colors p-1 mt-1"
                title="Sign out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className={`text-gray-500 text-xs ${collapsed ? 'text-center' : ''}`}>
            {!collapsed ? 'Logged in as HOD' : 'HOD'}
          </div>
        )}
      </div>
    </aside>
  );
}

// TopBar Component for HOD Portal
export function TopBar({ title, subtitle, user }: {
  title: string;
  subtitle?: string;
  user: AuthUser | null;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const today = new Date().toLocaleDateString('en-KE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const LOGIN_PATH = process.env.NEXT_PUBLIC_LOGIN_PATH || '/auth/login';

  const handleSignOut = () => {
    clearAuth();
    setMenuOpen(false);
    router.push(LOGIN_PATH);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm font-medium text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4 relative">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-900">
            {user ? `${user.firstName} ${user.lastName}` : 'Head of Department'}
          </p>
          <p className="text-xs font-medium text-gray-500">{today}</p>
        </div>

        <button
          onClick={() => setMenuOpen(o => !o)}
          className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center
            hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open profile menu" aria-haspopup="true" aria-expanded={menuOpen}>
          <span className="text-white text-sm font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-12 z-20 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : 'Head of Department'}
                </p>
                <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
              </div>
              <Link
                href={`/hod/staff/${user?.id}`}
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                My Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}