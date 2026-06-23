
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