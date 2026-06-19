"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, CalendarDays,
  RefreshCw, DollarSign, BarChart2, Settings, Bell,
  LogOut, HelpCircle, ChevronRight, MessageCircle, Activity, X,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard",  href: "/hr-dashboard/dashboard",  icon: LayoutDashboard },
  { name: "Employees",  href: "/hr-dashboard/employees",  icon: Users },
  { name: "Attendance", href: "/hr-dashboard/attendance", icon: ClipboardList },
  { name: "Leave",      href: "/hr-dashboard/leave",      icon: CalendarDays },
  { name: "Shifts",     href: "/hr-dashboard/shifts",     icon: RefreshCw },
  { name: "Payroll",    href: "/hr-dashboard/payroll",    icon: DollarSign },
  { name: "Reports",    href: "/hr-dashboard/reports",    icon: BarChart2 },
  { name: "Settings",   href: "/hr-dashboard/settings",   icon: Settings },
];

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/hr-dashboard/dashboard":  { title: "HR Dashboard",       subtitle: "Staff operations overview" },
  "/hr-dashboard/employees":  { title: "Employees",          subtitle: "Manage staff and personnel records" },
  "/hr-dashboard/attendance": { title: "Attendance",         subtitle: "Track daily attendance records" },
  "/hr-dashboard/leave":      { title: "Leave Management",   subtitle: "Review and approve leave requests" },
  "/hr-dashboard/shifts":     { title: "Shift Scheduling",   subtitle: "Manage and assign shift schedules" },
  "/hr-dashboard/payroll":    { title: "Payroll",            subtitle: "Process and manage staff payroll" },
  "/hr-dashboard/reports":    { title: "Reports",            subtitle: "View and export HR reports" },
  "/hr-dashboard/settings":   { title: "Settings",           subtitle: "Configure HR preferences" },
};

const MOCK_NOTIFICATIONS = [
  { text: "Leave request from Nurse Achieng pending",  time: "5 mins ago",  color: "#3b82f6" },
  { text: "Dr. Omondi clocked in 15 mins late",        time: "20 mins ago", color: "#f59e0b" },
  { text: "Payroll processing due tomorrow",           time: "1 hr ago",    color: "#8b5cf6" },
  { text: "New employee onboarding: J. Waweru",        time: "2 hrs ago",   color: "#10b981" },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      router.push("/auth/login");
    }
  };

  return (
    <aside style={{
      width:         collapsed ? 64 : 240,
      minWidth:      collapsed ? 64 : 240,
      height:        "100vh",
      background:    "#0f1b3d",
      display:       "flex",
      flexDirection: "column",
      transition:    "width .25s ease, min-width .25s ease",
      overflow:      "hidden",
      flexShrink:    0,
    }}>
      {/* Logo */}
      <div style={{
        padding:        collapsed ? "16px 0" : "20px 24px",
        borderBottom:   "1px solid rgba(255,255,255,.08)",
        display:        "flex",
        alignItems:     "center",
        gap:            12,
        justifyContent: collapsed ? "center" : "flex-start",
        flexShrink:     0,
      }}>
        <div style={{
          background: "#2563eb", borderRadius: 8, width: 32, height: 32,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Activity size={20} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap" }}>CityCare</div>
            <div style={{ color: "rgba(255,255,255,.45)", fontSize: 11 }}>HR Portal</div>
          </div>
        )}
        <button onClick={onToggle} style={{
          marginLeft: collapsed ? 0 : "auto",
          color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center",
          padding: 4, borderRadius: 6, flexShrink: 0,
          background: "none", border: "none", cursor: "pointer",
        }}>
          {collapsed
            ? <ChevronRight size={16} />
            : <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />}
        </button>
      </div>

      {!collapsed && (
        <div style={{
          padding: "14px 24px 4px",
          color: "rgba(255,255,255,.28)", fontSize: 11,
          fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          Main menu
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 0", scrollbarWidth: "none" }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.name} href={item.href} style={{
              width:          isActive ? "calc(100% - 16px)" : "100%",
              margin:         isActive ? "2px 8px" : "2px 0",
              display:        "flex",
              alignItems:     "center",
              gap:            12,
              padding:        collapsed ? "11px 0" : "10px 16px",
              justifyContent: collapsed ? "center" : "flex-start",
              background:     isActive ? "#2563eb" : "transparent",
              borderRadius:   isActive ? 8 : 0,
              color:          isActive ? "#fff" : "rgba(255,255,255,.6)",
              textDecoration: "none",
              transition:     "background .15s",
            }}>
              <span style={{ flexShrink: 0, display: "flex" }}><Icon size={20} /></span>
              {!collapsed && <span style={{ fontSize: 14 }}>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        flexShrink: 0,
        borderTop:  "1px solid rgba(255,255,255,.08)",
        padding:    collapsed ? "12px 0" : 16,
        background: "#0f1b3d",
      }}>
        {collapsed ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <button title="Help" style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(255,255,255,.07)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,.55)", cursor: "pointer",
            }}>
              <HelpCircle size={18} />
            </button>
            <button onClick={handleLogout} title="Logout" style={{
              width: 40, height: 40, borderRadius: 10,
              background: "transparent", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,.45)", cursor: "pointer",
            }}>
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(37,99,235,.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <HelpCircle size={15} color="#93c5fd" />
                </div>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Need Help?</span>
              </div>
              <p style={{ color: "rgba(255,255,255,.42)", fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>
                Contact IT support for assistance.
              </p>
              <button
                onClick={() => window.open("mailto:it-support@citycare.co.ke")}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, padding: "7px 0", background: "rgba(37,99,235,.35)",
                  border: "1px solid rgba(37,99,235,.5)", borderRadius: 7,
                  color: "#93c5fd", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <MessageCircle size={13} /> Contact Support
              </button>
            </div>
            <button onClick={handleLogout} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", background: "transparent",
              border: "1px solid rgba(255,255,255,.08)", borderRadius: 8,
              color: "rgba(255,255,255,.5)", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#fee2e2";
                (e.currentTarget as HTMLElement).style.color = "#dc2626";
                (e.currentTarget as HTMLElement).style.borderColor = "#fca5a5";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.08)";
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function Header({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname();
  const [showNotif, setShowNotif] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);

  const pageInfo = PAGE_TITLES[pathname] ?? { title: "HR Dashboard", subtitle: "CityCare Medical Center" };

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 64,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        flexShrink: 0, gap: 16,
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onMenuToggle} style={{
            color: "#6b7280", display: "flex", alignItems: "center",
            padding: 6, borderRadius: 6, background: "none", border: "none", cursor: "pointer",
          }}>
            <Activity size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", lineHeight: 1.2, margin: 0 }}>
              {pageInfo.title}
            </h1>
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{pageInfo.subtitle}</p>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotif((v) => !v)}
              style={{
                position: "relative", width: 38, height: 38, borderRadius: 8,
                background: "#f9fafb", border: "1px solid #e5e7eb",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#6b7280", cursor: "pointer",
              }}
            >
              <Bell size={17} />
              <span style={{
                position: "absolute", top: -4, right: -4,
                background: "#ef4444", color: "#fff",
                fontSize: 10, fontWeight: 700,
                width: 16, height: 16, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {MOCK_NOTIFICATIONS.length}
              </span>
            </button>

            {showNotif && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0, width: 300,
                background: "#fff", border: "1px solid #e5e7eb",
                borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.10)",
                zIndex: 200, overflow: "hidden",
              }}>
                <div style={{
                  padding: "14px 16px 10px", borderBottom: "1px solid #e5e7eb",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>Notifications</span>
                  <span style={{ fontSize: 12, color: "#3b82f6", cursor: "pointer" }}>Mark all read</span>
                </div>
                {MOCK_NOTIFICATIONS.map((n, i) => (
                  <div key={i} style={{
                    padding: "12px 16px",
                    borderBottom: i < MOCK_NOTIFICATIONS.length - 1 ? "1px solid #f3f4f6" : "none",
                    display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer",
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: n.color, marginTop: 5, flexShrink: 0,
                    }} />
                    <div>
                      <p style={{ fontSize: 13, color: "#111827", lineHeight: 1.4, margin: 0 }}>{n.text}</p>
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help */}
          <button
            onClick={() => setShowHelp(true)}
            style={{
              padding: "7px 14px", background: "#2563eb", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Help
          </button>

          {/* User avatar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 12px", background: "#f9fafb",
            border: "1px solid #e5e7eb", borderRadius: 8,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "#dbeafe", color: "#2563eb",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
            }}>
              HR
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>HR Admin</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>admin@citycare.co.ke</div>
            </div>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500,
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: 24,
            width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,.2)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>Help & Support</h2>
              <button onClick={() => setShowHelp(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { bg: "#eff6ff", border: "#bfdbfe", titleColor: "#1e40af", title: "Quick Start Guide", items: ["Dashboard — HR summary and quick actions", "Employees — Manage staff records", "Attendance — Track daily clock-ins", "Leave — Handle leave requests", "Payroll — Process and generate payslips", "Reports — Generate HR analytics"] },
                { bg: "#f0fdf4", border: "#bbf7d0", titleColor: "#166534", title: "Contact Support", items: ["Email: support@citycare.co.ke", "Phone: +254 712 345 678"] },
              ].map((section) => (
                <div key={section.title} style={{ background: section.bg, border: `1px solid ${section.border}`, borderRadius: 10, padding: "14px 16px" }}>
                  <h3 style={{ fontWeight: 600, color: section.titleColor, marginBottom: 8, fontSize: 14 }}>{section.title}</h3>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {section.items.map((item) => (
                      <li key={item} style={{ fontSize: 13, color: section.titleColor, marginBottom: 4 }}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowHelp(false)} style={{
                padding: "8px 20px", background: "#2563eb", color: "#fff",
                border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer",
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function HRDashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f9fafb" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header onMenuToggle={() => setCollapsed((c) => !c)} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}