// src/app/hospital-admin/pages/DashboardPage.tsx
import React from 'react'
import KPIRow    from '../../../components/hospital-admin/KPIRow'
import TrendsRow from '../../../components/hospital-admin/TrendsRow'


const DashboardPage: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <KPIRow />
    <TrendsRow />
  </div>
)

export default DashboardPage