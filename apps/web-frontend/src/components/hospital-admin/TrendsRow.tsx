'use client'

import React from 'react'
import AttendanceLineChart from '@/components/hospital-admin/AttendanceLineChart'
import DepartmentDonut from '@/components/hospital-admin/DepartmentDonut'
import RecentAlerts from '@/components/hospital-admin/RecentAlerts'

export default function TrendsRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr .7fr .7fr', gap: 'var(--space-6)' }}>
      <AttendanceLineChart />
      <DepartmentDonut />
      <RecentAlerts />
    </div>
  )
}