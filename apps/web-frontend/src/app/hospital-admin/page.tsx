<<<<<<< HEAD
"use client";
import DashboardPage from "../../../pages/DashboardPage";

export default function Page() {
  return <DashboardPage />;
}
=======
import { redirect } from 'next/navigation'

export default function HospitalAdminPage() {
  redirect('/hospital-admin/dashboard')
}
>>>>>>> origin/HA
