'use client';

import { useEffect, useState, type ReactNode, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, employeeApi } from '@/lib/api';
import { Sidebar, TopBar } from '@/components/hod-components/layout/Sidebar';
import { PulseStrip, Spinner } from '@/components/ui';
import type { AuthUser } from '@/types';

// Auth context hook for child pages to get the current HOD user
export const UserContext = createContext<AuthUser | null>(null);

export function useHODUser() { 
  const context = useContext(UserContext);
  if (!context) {
    console.warn('useHODUser must be used within a HODLayout component');
  }
  return context; 
}

interface HODLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function HODLayout({ children, title, subtitle }: HODLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const LOGIN_PATH = process.env.NEXT_PUBLIC_LOGIN_PATH || '/auth/login';

  // Convert fake user from localStorage to AuthUser format
  const convertFakeUser = (fakeUser: any): AuthUser | null => {
    if (!fakeUser || !fakeUser.role) return null;
    
    const roleMap: Record<string, string> = {
      'hod': 'DEPT_HEAD',
      'super_admin': 'SUPER_ADMIN',
      'hospital_admin': 'HOSPITAL_ADMIN',
      'hr': 'HR',
      'staff': 'STAFF'
    };

    return {
      id: fakeUser.email || 'fake-id',
      firstName: fakeUser.email?.split('@')[0] || 'User',
      lastName: 'User',
      email: fakeUser.email || '',
      role: roleMap[fakeUser.role] || fakeUser.role,
      tenantId: 'fake-tenant',
      departmentId: 'fake-dept',
      department: { 
        id: 'fake-dept', 
        name: 'Intensive Care Unit', 
        code: 'ICU' 
      },
    };
  };

  useEffect(() => {
    // Check for fake login from localStorage
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    
    if (storedUser) {
      try {
        const fakeUser = JSON.parse(storedUser);
        if (fakeUser.role === 'hod') {
          const authUser = convertFakeUser(fakeUser);
          setUser(authUser);
          setLoading(false);
          return;
        } else {
          router.push(LOGIN_PATH);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    // Fallback: Try real authentication (JWT/API) if fake login not found
    const raw = getCurrentUser();
    if (!raw) { 
      router.push(LOGIN_PATH); 
      setLoading(false);
      return; 
    }
    if (raw.role !== 'DEPT_HEAD') { 
      router.push(LOGIN_PATH); 
      setLoading(false);
      return; 
    }

    employeeApi.getById(raw.id || raw.sub)
      .then((emp: any) => {
        setUser({
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          role: emp.role,
          tenantId: emp.tenantId,
          departmentId: emp.departmentId,
          department: emp.department,
        });
      })
      .catch(() => {
        setUser({
          id: raw.id || raw.sub,
          firstName: raw.firstName || '',
          lastName: raw.lastName || '',
          email: raw.email || '',
          role: raw.role,
          tenantId: raw.tenantId,
          departmentId: raw.departmentId || null,
          department: null,
        });
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Handle sidebar collapse state
  const handleSidebarToggle = (isCollapsed: boolean) => {
    setCollapsed(isCollapsed);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push(LOGIN_PATH);
    return null;
  }

  return (
    <UserContext.Provider value={user}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={user} onToggle={handleSidebarToggle} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}>
          <PulseStrip active />
          <TopBar title={title} subtitle={subtitle} user={user} />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </UserContext.Provider>
  );
}