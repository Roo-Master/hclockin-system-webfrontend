"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  Activity,
  History,
  ClipboardEdit,
  Bell,
  User,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/user-dashboard", icon: LayoutDashboard },
  { label: "Attendance", path: "/user-dashboard/attendance", icon: UserCheck },
  { label: "Apply Leave", path: "/user-dashboard/apply-leave", icon: Calendar },
  { label: "Leave Balances", path: "/user-dashboard/leave-balances", icon: Calendar },
  { label: "Leave History", path: "/user-dashboard/leave-history", icon: History },
  { label: "Shifts", path: "/user-dashboard/shifts", icon: Activity },
  { label: "Clock History", path: "/user-dashboard/clock-history", icon: History },
  {
    label: "Correction Request",
    path: "/user-dashboard/correction-request",
    icon: ClipboardEdit,
  },
  { label: "Notifications", path: "/user-dashboard/notifications", icon: Bell },
  { label: "Profile", path: "/user-dashboard/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-sidebar flex flex-col z-50">
      <div className="h-[52px] flex items-center px-5 border-b border-white/10">
        <span className="text-white font-bold text-sm tracking-tight">
          MedClock
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.path === "/user-dashboard"
              ? pathname === "/user-dashboard"
              : pathname?.startsWith(item.path);

          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-badge text-label transition-colors ${
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/40 text-xs">© 2026 MedClock System</p>
      </div>
    </aside>
  );
}
