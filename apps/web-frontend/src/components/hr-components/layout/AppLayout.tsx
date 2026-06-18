import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header  from "./Header";
import { useAuth } from "../../../contexts/hr-context/Authcontext";

const SIDEBAR_FULL      = 240; // px
const SIDEBAR_COLLAPSED = 64;  // px

const AppLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [collapsed, setCollapsed]      = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const sw = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_FULL;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} />
      <div
        className="flex flex-col min-h-screen transition-all duration-200"
        style={{ marginLeft: sw }}
      >
        <Header sidebarWidth={sw} onMenuToggle={() => setCollapsed((v) => !v)} />
        <main className="flex-1 p-6 mt-[60px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;