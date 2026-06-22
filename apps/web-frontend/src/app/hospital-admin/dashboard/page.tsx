'use client'

import React from 'react'
import KPIRow from '@/components/hospital-admin/KPIRow'
import TrendsRow from '@/components/hospital-admin/TrendsRow'


export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <KPIRow />
      <TrendsRow />
    </div>
  )
}