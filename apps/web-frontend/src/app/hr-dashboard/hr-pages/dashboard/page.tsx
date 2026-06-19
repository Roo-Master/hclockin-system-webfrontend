"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const dashboardAPI = {
  getStats: async () => ({
    totalEmployees:       0,
    presentToday:         0,
    absentToday:          0,
    lateEmployees:        0,
    pendingLeaveRequests: 0,
    payrollStatus:        0,
  }),
  getRecentActivities: async () => [] as any[],
};

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEmployees:       0,
    presentToday:         0,
    absentToday:          0,
    lateEmployees:        0,
    pendingLeaveRequests: 0,
    payrollStatus:        0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivities(),
      ]);
      setStats(statsData);
      setRecentActivities(activitiesData);
      setError("");
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const statCards = [
    { label: "Total Employees",    value: stats.totalEmployees,                          color: "#3b82f6" },
    { label: "Present Today",      value: stats.presentToday,                            color: "#10b981" },
    { label: "Absent Today",       value: stats.absentToday,                             color: "#ef4444" },
    { label: "Late Employees",     value: stats.lateEmployees,                           color: "#f59e0b" },
    { label: "Pending Leave",      value: stats.pendingLeaveRequests,                    color: "#8b5cf6" },
    { label: "Payroll This Month", value: `KES ${stats.payrollStatus.toLocaleString()}`, color: "#6366f1" },
  ];

  const quickActions = [
    { label: "Add Employee",     path: "/hr-dashboard/employees",  color: "#2563eb" },
    { label: "Approve Leave",    path: "/hr-dashboard/leave",      color: "#10b981" },
    { label: "View Attendance",  path: "/hr-dashboard/attendance", color: "#f59e0b" },
    { label: "Generate Payroll", path: "/hr-dashboard/payroll",    color: "#8b5cf6" },
  ];

  if (loading && !refreshing) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256, color: "#6b7280" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* Title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>HR Dashboard</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
            Welcome back — here's what's happening at CityCare today.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          style={{
            padding: "8px 16px", background: "#f3f4f6",
            border: "1px solid #e5e7eb", borderRadius: 8,
            fontSize: 13, color: "#374151", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: 12, padding: 20,
            borderLeft: `4px solid ${s.color}`,
            boxShadow: "0 1px 4px rgba(0,0,0,.06)",
          }}>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.color, margin: "4px 0 0" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Trend placeholders */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {["Attendance Trends", "Leave Trends", "Overtime Trends"].map((title) => (
          <div key={title} style={{
            background: "#fff", borderRadius: 12, padding: 20,
            boxShadow: "0 1px 4px rgba(0,0,0,.06)",
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12 }}>{title}</h3>
            <div style={{
              height: 100, display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px dashed #e5e7eb", borderRadius: 8, color: "#9ca3af", fontSize: 13,
            }}>
              Connect to API
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: 20,
        marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 14 }}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => router.push(a.path)}
              style={{
                padding: "12px 8px", background: a.color, color: "#fff",
                border: "none", borderRadius: 10, fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 14 }}>Recent Activities</h3>
        {recentActivities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>
            <p style={{ fontSize: 14, margin: 0 }}>No recent activities</p>
            <p style={{ fontSize: 12, margin: "4px 0 0" }}>Activity will appear here once the API is connected</p>
          </div>
        ) : (
          <div>
            {recentActivities.map((activity, idx) => (
              <div key={idx} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderBottom: "1px solid #f3f4f6",
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", margin: 0 }}>{activity.action}</p>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>by {activity.user}</p>
                </div>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{activity.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}