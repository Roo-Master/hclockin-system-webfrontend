<<<<<<< HEAD
"use client";
// Thin App Router wrapper — exposes the existing DashboardPage component
// (src/app/hospital-admin/pages/DashboardPage.tsx) at the real route
// /hospital-admin/dashboard, without modifying the original component.
import DashboardPage from "../pages/DashboardPage";
=======
'use client'
>>>>>>> origin/HA

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