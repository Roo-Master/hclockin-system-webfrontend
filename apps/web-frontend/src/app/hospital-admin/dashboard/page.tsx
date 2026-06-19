"use client";
// Thin App Router wrapper — exposes the existing DashboardPage component
// (src/app/hospital-admin/pages/DashboardPage.tsx) at the real route
// /hospital-admin/dashboard, without modifying the original component.
import DashboardPage from "../pages/DashboardPage";

export default function Page() {
  return <DashboardPage />;
}