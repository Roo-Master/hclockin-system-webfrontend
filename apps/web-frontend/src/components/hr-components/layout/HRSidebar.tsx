// src/components/hr-components/layout/HRSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth } from '@/lib/api';
import type { AuthUser } from '@/types/hod';

const navigation = [
  { name: 'Dashboard', href: '/hr-dashboard', icon: '📊' },
  { name: 'Employees', href: '/hr-dashboard/hr-pages/employees', icon: '👥' },
  { name: 'Attendance', href: '/hr-dashboard/hr-pages/attendance', icon: '📋' },
  { name: 'Leave', href: '/hr-dashboard/hr-pages/leave', icon: '🏖️' },
  { name: 'Payroll', href: '/hr-dashboard/hr-pages/payroll', icon: '💰' },
  { name: 'Reports', href: '/hr-dashboard/hr-pages/reports', icon: '📈' },
  { name: 'Settings', href: '/hr-dashboard/hr-pages/settings', icon: '⚙️' },
];

interface HRSidebarProps {
  user: AuthUser | null;
  collapsed: boolean;
  onToggle: () => void;
}

export function HRSidebar({ user, collapsed, onToggle }: HRSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('HR Admin');
  const [userEmail, setUserEmail] = useState('hr@citycare.com');

  useEffect(() => {
    if (user) {
      setUserName(`${user.firstName} ${user.lastName}`);
      setUserEmail(user.email || 'hr@citycare.com');
    } else {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUserName(parsed.name || parsed.firstName + ' ' + parsed.lastName || 'HR Admin');
          setUserEmail(parsed.email || 'hr@citycare.com');
        } catch (e) {
          console.error('Failed to parse user data');
        }
      }
    }
  }, [user]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      clearAuth();
      router.push('/auth/login');
    }
  };

  return (
    <div className={`bg-[#0F1B3D] flex flex-col flex-shrink-0 h-screen sticky top-0 transition-all duration-300 z-40 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Brand */}
      <div className={`p-4 border-b border-white/10 flex items-center ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed ? (
          <>
            <h1 className="text-xl font-bold text-white">🏥 CityCare</h1>
            <button
              onClick={onToggle}
              className="ml-auto text-white/40 hover:text-white transition-colors"
              aria-label="Collapse sidebar"
            >
              ◀
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Expand sidebar"
          >
            ▶
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        {!collapsed && (
          <p className="text-xs uppercase tracking-wider text-white/40 mb-3 px-3">HR Dashboard</p>
        )}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm
                  ${isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'}
                  ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : ''}
              >
                <span className={collapsed ? '' : 'mr-3'}>{item.icon}</span>
                {!collapsed && item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* User Profile Footer */}
      <div className={`p-4 border-t border-white/10 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center p-3 bg-white/5 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {userName?.charAt(0) || 'H'}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-white/50 truncate">{userEmail}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-white/40 hover:text-white transition-colors"
              aria-label="Logout"
            >
              ⏻
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {userName?.charAt(0) || 'H'}
            </div>
            <button 
              onClick={handleLogout}
              className="text-white/40 hover:text-white transition-colors"
              aria-label="Logout"
            >
              ⏻
            </button>
          </div>
        )}
      </div>
    </div>
  );
}