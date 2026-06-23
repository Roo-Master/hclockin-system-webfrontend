<<<<<<< HEAD
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
=======
'use client'

import { useState } from 'react'
import Sidebar from '@/components/hospital-admin/Sidebar'
import Header from '@/components/hospital-admin/Header'
//import '@/app/globals.css'

export default function HospitalAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(p => !p)}
      />

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#f5f6fa',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          padding: 24,
          minWidth: 0,
        }}
      >
        <Header onMenuToggle={() => setCollapsed(p => !p)} />
        {children}
        <div style={{ height: 32 }} />
      </main>
    </div>
  )
}
>>>>>>> origin/HA
