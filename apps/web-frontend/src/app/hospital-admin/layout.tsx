"use client";

import { ReactNode, useState } from 'react';
import Sidebar from '@/components/hospital-admin/layout/Sidebar';
import Header from '@/components/hospital-admin/layout/Header';

interface HospitalAdminLayoutProps {
  children: ReactNode;
}

export default function HospitalAdminLayout({ children }: HospitalAdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <Header onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}