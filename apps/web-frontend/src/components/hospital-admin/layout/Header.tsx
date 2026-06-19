"use client";
import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Calendar, Menu, Search } from "lucide-react";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/hospital-admin/dashboard":     { title: "Hospital Admin Dashboard",    subtitle: "CityCare Medical Center — Staff Operations Overview" },
  "/hospital-admin/employees":     { title: "Employees",                   subtitle: "Manage hospital staff and personnel records" },
  "/hospital-admin/departments":   { title: "Departments",                 subtitle: "Manage hospital departments and units" },
  "/hospital-admin/attendance":    { title: "Attendance",                  subtitle: "Track and manage staff attendance records" },
  "/hospital-admin/shifts":        { title: "Shift Scheduling",            subtitle: "Manage and assign staff shift schedules" },
  "/hospital-admin/leave":         { title: "Leave Management",            subtitle: "Review and approve staff leave requests" },
  "/hospital-admin/payroll":       { title: "Payroll",                     subtitle: "Process and manage staff payroll" },
  "/hospital-admin/reports":       { title: "Reports",                     subtitle: "View and export operational reports" },
  "/hospital-admin/notifications": { title: "Notifications",               subtitle: "System alerts and staff notifications" },
  "/hospital-admin/devices":       { title: "Devices",                     subtitle: "Manage clock-in devices and hardware" },
  "/hospital-admin/settings":      { title: "Settings",                    subtitle: "Configure hospital admin preferences" },
};

const MOCK_NOTIFICATIONS = [
  { text: "Dr. Omondi clocked in 12 mins late", time: "8 mins ago",  color: "#f59e0b" },
  { text: "Leave request from Nurse Achieng",   time: "23 mins ago", color: "#3b82f6" },
  { text: "Device KNH-02 went offline",         time: "1 hr ago",    color: "#ef4444" },
  { text: "Payroll processing completed",       time: "2 hrs ago",   color: "#10b981" },
];

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const pathname = usePathname();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const pageInfo = PAGE_TITLES[pathname] ?? PAGE_TITLES["/hospital-admin/dashboard"];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      style={{
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        padding:         "0 24px",
        height:          64,
        background:      "var(--color-bg-surface)",
        borderBottom:    "1px solid var(--color-border)",
        flexShrink:      0,
        gap:             16,
      }}
    >
      {/* ── Left ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
          style={{
            color:        "var(--color-text-secondary)",
            display:      "flex",
            alignItems:   "center",
            padding:      6,
            borderRadius: 6,
            background:   "none",
            border:       "none",
            cursor:       "pointer",
            flexShrink:   0,
          }}
        >
          <Menu size={20} />
        </button>

        <div>
          <h1
            style={{
              fontSize:   "var(--text-display)",
              fontWeight: 700,
              color:      "var(--color-text-primary)",
              lineHeight: 1.2,
              margin:     0,
            }}
          >
            {pageInfo.title}
          </h1>
          <p style={{ fontSize: "var(--text-body)", color: "var(--color-text-secondary)", margin: 0 }}>
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* ── Right ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>

        {/* Date range */}
        <button
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          6,
            padding:      "7px 14px",
            background:   "var(--color-bg-surface)",
            border:       "1px solid var(--color-border)",
            borderRadius: "var(--radius-badge)",
            color:        "var(--color-text-primary)",
            fontSize:     "var(--text-body)",
            fontWeight:   500,
            cursor:       "pointer",
            whiteSpace:   "nowrap",
          }}
        >
          <Calendar size={14} color="var(--color-text-secondary)" />
          May 1 – May 31, 2025
          <ChevronDown size={12} color="var(--color-text-secondary)" />
        </button>

        {/* Notification bell */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotif((v) => !v)}
            aria-label={`Notifications — ${MOCK_NOTIFICATIONS.length} unread`}
            style={{
              background:     "var(--color-bg-surface)",
              border:         "1px solid var(--color-border)",
              borderRadius:   "var(--radius-badge)",
              width:          38,
              height:         38,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              color:          "var(--color-text-secondary)",
              position:       "relative",
              cursor:         "pointer",
            }}
          >
            <Bell size={17} />
            <span
              style={{
                position:       "absolute",
                top:            -4,
                right:          -4,
                background:     "var(--color-danger)",
                color:          "#fff",
                fontSize:       10,
                fontWeight:     700,
                width:          16,
                height:         16,
                borderRadius:   "50%",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}
            >
              {MOCK_NOTIFICATIONS.length}
            </span>
          </button>

          {showNotif && (
            <div
              style={{
                position:     "absolute",
                top:          "calc(100% + 8px)",
                right:        0,
                width:        300,
                background:   "var(--color-bg-surface)",
                border:       "1px solid var(--color-border)",
                borderRadius: "var(--radius-card)",
                boxShadow:    "0 8px 24px rgba(0,0,0,.12)",
                zIndex:       200,
                overflow:     "hidden",
              }}
            >
              <div
                style={{
                  padding:      "14px 16px 10px",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize:     "var(--text-label)",
                  fontWeight:   600,
                  color:        "var(--color-text-primary)",
                  display:      "flex",
                  justifyContent: "space-between",
                  alignItems:   "center",
                }}
              >
                <span>Notifications</span>
                <span
                  style={{
                    fontSize:     11,
                    color:        "#3b82f6",
                    cursor:       "pointer",
                    fontWeight:   500,
                  }}
                >
                  Mark all read
                </span>
              </div>

              {MOCK_NOTIFICATIONS.map((n, i) => (
                <div
                  key={i}
                  style={{
                    padding:      "12px 16px",
                    borderBottom: i < MOCK_NOTIFICATIONS.length - 1 ? "1px solid var(--color-border)" : "none",
                    display:      "flex",
                    gap:          10,
                    alignItems:   "flex-start",
                    cursor:       "pointer",
                  }}
                >
                  <span
                    style={{
                      width:        8,
                      height:       8,
                      borderRadius: "50%",
                      background:   n.color,
                      marginTop:    5,
                      flexShrink:   0,
                    }}
                  />
                  <div>
                    <p style={{ fontSize: "var(--text-label)", color: "var(--color-text-primary)", lineHeight: 1.4, margin: 0 }}>
                      {n.text}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "2px 0 0" }}>
                      {n.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User avatar */}
        <button
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          8,
            padding:      "6px 12px",
            background:   "var(--color-bg-surface)",
            border:       "1px solid var(--color-border)",
            borderRadius: "var(--radius-badge)",
            cursor:       "pointer",
          }}
        >
          <div
            style={{
              width:          32,
              height:         32,
              borderRadius:   "50%",
              background:     "var(--color-info-bg)",
              color:          "var(--color-info)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       "var(--text-label)",
              fontWeight:     700,
              flexShrink:     0,
            }}
          >
            AM
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "var(--text-label)", fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>
              Dr. A. Mehta
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Administrator</div>
          </div>
          <ChevronDown size={13} color="var(--color-text-tertiary)" />
        </button>
      </div>
    </header>
  );
};

export default Header;