// src/components/hr-components/layout/HRDashboardLayout.tsx
'use client';

import React, { ReactNode, useState } from 'react';
import { HRSidebar } from './HRSidebar';
import { HRNavbar } from './HRNavbar';
import { PulseStrip } from '@/components/ui';
import type { AuthUser } from '@/types/hod';

interface HRDashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function HRDashboardLayout({ children, title, subtitle }: HRDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const user = null; // Will be fetched from context

  return (
    <div className="flex h-screen bg-gray-100">
      <HRSidebar 
        user={user} 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <PulseStrip active />
        <HRNavbar title={title} subtitle={subtitle} user={user} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}