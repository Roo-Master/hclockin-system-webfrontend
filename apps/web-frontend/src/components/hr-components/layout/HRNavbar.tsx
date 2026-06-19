// src/components/hr-components/layout/HRNavbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearAuth } from '@/lib/api';
import type { AuthUser } from '@/types';

interface HRNavbarProps {
  title: string;
  subtitle?: string;
  user: AuthUser | null;
}

export function HRNavbar({ title, subtitle, user }: HRNavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    clearAuth();
    setMenuOpen(false);
    router.push('/auth/login');
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
            {user ? `${user.firstName} ${user.lastName}` : 'HR Administrator'}
          </p>
          <p className="text-xs font-medium text-gray-500">
            {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <button
          onClick={() => setMenuOpen(o => !o)}
          className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center
            hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open profile menu"
        >
          <span className="text-white text-sm font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0] || 'HR'}
          </span>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-12 z-20 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : 'HR Administrator'}
                </p>
                <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
              </div>
              <Link
                href="/hr-dashboard/hr-pages/profile"
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