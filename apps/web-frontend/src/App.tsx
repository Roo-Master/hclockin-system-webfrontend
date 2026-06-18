// src/App.tsx
import React, { useState } from 'react'
import { Routes, Route }   from 'react-router-dom'
import Sidebar             from './components/hospital-admin/Sidebar'
import Header              from './components/hospital-admin/Header'

import DashboardPage       from './app/hospital-admin/pages/DashboardPage'
import EmployeesPage       from './app/hospital-admin/pages/EmployeesPage'
import DepartmentsPage     from './app/hospital-admin/pages/DepartmentsPage'
import AttendancePage      from './app/hospital-admin/pages/AttendancePage'
import LeavePage           from './app/hospital-admin/pages/LeavePage'
import ShiftSchedulingPage from './app/hospital-admin/pages/ShiftSchedulingPage'
import PayrollPage         from './app/hospital-admin/pages/PayrollPage'
import ReportsPage         from './app/hospital-admin/pages/ReportsPage'
import NotificationsPage   from './app/hospital-admin/pages/NotificationsPage'
import SettingsPage        from './app/hospital-admin/pages/SettingsPage'
import DevicesPage         from './app/hospital-admin/pages/DevicesPage'

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(p => !p)}
      />

      <main
        style={{
          flex:          1,
          overflowY:     'auto',
          background:    '#f5f6fa',
          display:       'flex',
          flexDirection: 'column',
          gap:           24,
          padding:       24,
          minWidth:      0,
        }}
      >
        <Header onMenuToggle={() => setCollapsed(p => !p)} />

        <Routes>
          <Route path="/"              element={<DashboardPage />}       />
          <Route path="/employees/*"   element={<EmployeesPage />}       />
          <Route path="/departments/*" element={<DepartmentsPage />}     />
          <Route path="/attendance"    element={<AttendancePage />}      />
          <Route path="/leave"         element={<LeavePage />}           />
          <Route path="/shifts"        element={<ShiftSchedulingPage />} />
          <Route path="/payroll"       element={<PayrollPage />}         />
          <Route path="/reports"       element={<ReportsPage />}         />
          <Route path="/notifications" element={<NotificationsPage />}   />
          <Route path="/settings"      element={<SettingsPage />}        />
          <Route path="/devices"       element={<DevicesPage />}         />
        </Routes>

        <div style={{ height: 32 }} />
      </main>
    </div>
  )
}

export default App