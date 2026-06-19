"use client";
import { useState, useEffect } from "react";

const attendanceAPI = {
  getDailyStats:    async () => ({ present: 0, absent: 0, late: 0, earlyDepartures: 0 }),
  getRecords:       async (date?: string) => [] as any[],
  getCorrections:   async () => [] as any[],
  approveCorrection:async (id: string) => ({ success: true }),
  rejectCorrection: async (id: string) => ({ success: true }),
  getOvertime:      async () => ({ total: 0, pending: 0, approved: 0, records: [] as any[] }),
  approveOvertime:  async (id: string) => ({ success: true }),
  getRealTimeStatus:async () => ({ onDuty: 0, total: 0, departments: [] as any[] }),
  exportRecords:    async (format: string, date?: string) => ({ success: true }),
};

const TABS = [
  { key: "daily",       label: "Daily Attendance" },
  { key: "records",     label: "Attendance Records" },
  { key: "corrections", label: "Corrections" },
  { key: "overtime",    label: "Overtime" },
  { key: "monitoring",  label: "Monitoring" },
];

const statusColors: Record<string, { bg: string; color: string }> = {
  Present:  { bg: "#dcfce7", color: "#166534" },
  Late:     { bg: "#fef9c3", color: "#854d0e" },
  Absent:   { bg: "#fee2e2", color: "#dc2626" },
  Pending:  { bg: "#fef9c3", color: "#854d0e" },
  Approved: { bg: "#dcfce7", color: "#166534" },
  Rejected: { bg: "#fee2e2", color: "#dc2626" },
};

const sc = (status: string) => statusColors[status] || { bg: "#f3f4f6", color: "#6b7280" };

const btn = (color: string, hover?: string) => ({
  padding: "6px 14px", background: color, color: "#fff",
  border: "none", borderRadius: 7, fontSize: 13,
  cursor: "pointer", fontFamily: "inherit",
});

const tableHead = (cols: string[]) => (
  <thead>
    <tr style={{ background: "#f9fafb" }}>
      {cols.map((c) => (
        <th key={c} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
          {c}
        </th>
      ))}
    </tr>
  </thead>
);

export default function Attendance() {
  const [activeTab, setActiveTab]     = useState("daily");
  const [stats, setStats]             = useState({ present: 0, absent: 0, late: 0, earlyDepartures: 0 });
  const [records, setRecords]         = useState<any[]>([]);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [overtimeData, setOvertimeData] = useState({ total: 0, pending: 0, approved: 0, records: [] as any[] });
  const [realTimeData, setRealTimeData] = useState({ onDuty: 0, total: 0, departments: [] as any[] });
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => { fetchAllData(); }, [selectedDate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [s, r, c, o, rt] = await Promise.all([
        attendanceAPI.getDailyStats(),
        attendanceAPI.getRecords(selectedDate),
        attendanceAPI.getCorrections(),
        attendanceAPI.getOvertime(),
        attendanceAPI.getRealTimeStatus(),
      ]);
      setStats(s); setRecords(r); setCorrections(c);
      setOvertimeData(o); setRealTimeData(rt);
      setError("");
    } catch { setError("Failed to load attendance data"); }
    finally { setLoading(false); }
  };

  const flash = (fn: typeof setSuccess, msg: string) => { fn(msg); setTimeout(() => fn(""), 3000); };

  const handleApproveCorrection = async (id: string) => {
    if (!confirm("Approve this correction?")) return;
    try { await attendanceAPI.approveCorrection(id); flash(setSuccess, "Correction approved!"); fetchAllData(); }
    catch { flash(setError, "Failed to approve correction"); }
  };
  const handleRejectCorrection = async (id: string) => {
    if (!confirm("Reject this correction?")) return;
    try { await attendanceAPI.rejectCorrection(id); flash(setSuccess, "Correction rejected!"); fetchAllData(); }
    catch { flash(setError, "Failed to reject correction"); }
  };
  const handleApproveOvertime = async (id: string) => {
    if (!confirm("Approve this overtime?")) return;
    try { await attendanceAPI.approveOvertime(id); flash(setSuccess, "Overtime approved!"); fetchAllData(); }
    catch { flash(setError, "Failed to approve overtime"); }
  };
  const handleExport = async (format: string) => {
    try { await attendanceAPI.exportRecords(format, selectedDate); flash(setSuccess, `${format.toUpperCase()} export started!`); }
    catch { flash(setError, "Failed to export"); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256, color: "#6b7280" }}>
      Loading attendance data...
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Attendance</h1>

      {success && <div style={{ marginBottom: 12, padding: "10px 14px", background: "#dcfce7", color: "#166534", borderRadius: 8, fontSize: 13 }}>{success}</div>}
      {error   && <div style={{ marginBottom: 12, padding: "10px 14px", background: "#fee2e2", color: "#dc2626",  borderRadius: 8, fontSize: 13 }}>{error}</div>}

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: 24, display: "flex" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: "10px 20px", background: "none", border: "none",
            borderBottom: activeTab === t.key ? "2px solid #2563eb" : "2px solid transparent",
            color: activeTab === t.key ? "#2563eb" : "#6b7280",
            fontWeight: activeTab === t.key ? 600 : 400,
            fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "daily"       && <DailyAttendance   stats={stats} date={selectedDate} onDateChange={setSelectedDate} onRefresh={fetchAllData} onExport={handleExport} />}
      {activeTab === "records"     && <AttendanceRecords records={records} date={selectedDate} onDateChange={setSelectedDate} onRefresh={fetchAllData} onExport={handleExport} />}
      {activeTab === "corrections" && <AttendanceCorrections corrections={corrections} onApprove={handleApproveCorrection} onReject={handleRejectCorrection} onRefresh={fetchAllData} />}
      {activeTab === "overtime"    && <OvertimeManagement data={overtimeData} onApprove={handleApproveOvertime} onRefresh={fetchAllData} />}
      {activeTab === "monitoring"  && <AttendanceMonitoring data={realTimeData} onRefresh={fetchAllData} />}
    </div>
  );
}

function DailyAttendance({ stats, date, onDateChange, onRefresh, onExport }: any) {
  const formatted = new Date(date).toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const cards = [
    { label: "Present Staff",    value: stats.present,         color: "#16a34a", bg: "#f0fdf4", border: "#16a34a" },
    { label: "Absent Staff",     value: stats.absent,          color: "#dc2626", bg: "#fef2f2", border: "#dc2626" },
    { label: "Late Staff",       value: stats.late,            color: "#d97706", bg: "#fffbeb", border: "#d97706" },
    { label: "Early Departures", value: stats.earlyDepartures, color: "#2563eb", bg: "#eff6ff", border: "#2563eb" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 }}>{formatted}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)}
            style={{ padding: "7px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} />
          <button onClick={onRefresh} style={btn("#2563eb")}>Refresh</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: c.bg, borderLeft: `4px solid ${c.border}`, borderRadius: 10, padding: 16 }}>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: c.color, margin: "4px 0 0" }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: 0 }}>Attendance Summary</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onExport("pdf")}   style={btn("#dc2626")}>Export PDF</button>
            <button onClick={() => onExport("excel")} style={btn("#16a34a")}>Export Excel</button>
          </div>
        </div>
        <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #e5e7eb", borderRadius: 8, color: "#9ca3af", fontSize: 13 }}>
          Attendance chart — connect to API
        </div>
      </div>
    </div>
  );
}

function AttendanceRecords({ records, date, onDateChange, onRefresh, onExport }: any) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 }}>Attendance Records</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)}
            style={{ padding: "7px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }} />
          <button onClick={onRefresh}           style={btn("#2563eb")}>Refresh</button>
          <button onClick={() => onExport("pdf")}   style={btn("#dc2626")}>PDF</button>
          <button onClick={() => onExport("excel")} style={btn("#16a34a")}>Excel</button>
          <button onClick={() => onExport("csv")}   style={btn("#6b7280")}>CSV</button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          {tableHead(["Employee", "Clock In", "Clock Out", "Hours", "Status"])}
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "40px 16px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No records for this date</td></tr>
            ) : records.map((r: any, i: number) => (
              <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#111827" }}>{r.employee}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{r.clockIn  || "--"}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{r.clockOut || "--"}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{r.hours    || "--"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 500, ...sc(r.status) }}>{r.status || "--"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 16px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Total Records: {records.length}</p>
        </div>
      </div>
    </div>
  );
}

function AttendanceCorrections({ corrections, onApprove, onReject, onRefresh }: any) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 }}>Attendance Corrections</h2>
        <button onClick={onRefresh} style={btn("#2563eb")}>Refresh</button>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          {tableHead(["Employee", "Issue", "Date", "Status", "Actions"])}
          <tbody>
            {corrections.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "40px 16px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No correction requests pending</td></tr>
            ) : corrections.map((c: any, i: number) => (
              <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#111827" }}>{c.employee}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{c.type === "clockout" ? "Missing Clock-Out" : "Incorrect Time Entry"}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{c.date}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 500, ...sc(c.status) }}>{c.status}</span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {c.status === "Pending" ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => onApprove(c.id)} style={btn("#16a34a")}>Approve</button>
                      <button onClick={() => onReject(c.id)}  style={btn("#dc2626")}>Reject</button>
                    </div>
                  ) : <span style={{ fontSize: 13, color: "#9ca3af" }}>No actions</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 16px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Pending: {corrections.filter((c: any) => c.status === "Pending").length}</p>
        </div>
      </div>
    </div>
  );
}

function OvertimeManagement({ data, onApprove, onRefresh }: any) {
  const cards = [
    { label: "Total Overtime Hours", value: `${data.total || 0} hrs`, color: "#2563eb", border: "#2563eb" },
    { label: "Pending Approval",     value: `${data.pending || 0} hrs`, color: "#d97706", border: "#d97706" },
    { label: "Approved Overtime",    value: `${data.approved || 0} hrs`, color: "#16a34a", border: "#16a34a" },
  ];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 }}>Overtime Management</h2>
        <button onClick={onRefresh} style={btn("#2563eb")}>Refresh</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: "#fff", borderRadius: 12, padding: 20, borderLeft: `4px solid ${c.border}`, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: c.color, margin: "4px 0 0" }}>{c.value}</p>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          {tableHead(["Employee", "Date", "Hours", "Status", "Action"])}
          <tbody>
            {!data.records || data.records.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "40px 16px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No overtime records</td></tr>
            ) : data.records.map((r: any, i: number) => (
              <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#111827" }}>{r.employee}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{r.date}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{r.hours} hrs</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 500, ...sc(r.status) }}>{r.status}</span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {r.status === "Pending"
                    ? <button onClick={() => onApprove(r.id)} style={btn("#16a34a")}>Approve</button>
                    : <span style={{ fontSize: 13, color: "#9ca3af" }}>--</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceMonitoring({ data, onRefresh }: any) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 }}>Real-Time Monitoring</h2>
        <button onClick={onRefresh} style={btn("#2563eb")}>Refresh</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#f0fdf4", borderLeft: "4px solid #16a34a", borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#166534", margin: 0 }}>Staff Currently On Duty</h3>
          <p style={{ fontSize: 32, fontWeight: 700, color: "#16a34a", margin: "8px 0 4px" }}>{data.onDuty || 0}</p>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>of {data.total || 0} total staff</p>
        </div>
        <div style={{ background: "#eff6ff", borderLeft: "4px solid #2563eb", borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e40af", margin: 0 }}>Departments Active</h3>
          <p style={{ fontSize: 32, fontWeight: 700, color: "#2563eb", margin: "8px 0 4px" }}>{data.departments?.length || 0}</p>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>departments with active staff</p>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          {tableHead(["Department", "On Duty", "Total Staff", "Coverage", "Action"])}
          <tbody>
            {!data.departments || data.departments.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "40px 16px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No real-time data available</td></tr>
            ) : data.departments.map((dept: any, i: number) => {
              const coverageColor = dept.coverage >= 75 ? "#16a34a" : dept.coverage >= 50 ? "#d97706" : "#dc2626";
              const coverageBg    = dept.coverage >= 75 ? "#dcfce7"  : dept.coverage >= 50 ? "#fef9c3"  : "#fee2e2";
              return (
                <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#111827" }}>{dept.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{dept.onDuty}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{dept.total}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 500, background: coverageBg, color: coverageColor }}>{dept.coverage}%</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => alert(`${dept.name} details`)} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}