"use client";
import { useState, useEffect } from "react";

const employeeAPI = {
  getAll:     async () => [] as any[],
  create:     async (data: any) => ({ ...data, id: `EMP${Date.now()}` }),
  update:     async (id: string, data: any) => ({ ...data, id }),
  delete:     async (id: string) => ({ success: true }),
  activate:   async (id: string) => ({ success: true }),
  suspend:    async (id: string) => ({ success: true }),
  terminate:  async (id: string) => ({ success: true }),
};

export default function Employees() {
  const [activeTab, setActiveTab]               = useState("list");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [employees, setEmployees]               = useState<any[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [showModal, setShowModal]               = useState(false);
  const [modalType, setModalType]               = useState("");
  const [searchTerm, setSearchTerm]             = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [error, setError]                       = useState("");
  const [success, setSuccess]                   = useState("");

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeAPI.getAll();
      setEmployees(data);
      setError("");
    } catch {
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); };
  const showError   = (msg: string) => { setError(msg);   setTimeout(() => setError(""),   3000); };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === "All" || emp.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const handleAddEmployee = async (data: any) => {
    try {
      const emp = await employeeAPI.create(data);
      setEmployees([...employees, emp]);
      setShowModal(false);
      showSuccess("Employee added successfully!");
    } catch { showError("Failed to add employee"); }
  };

  const handleEditEmployee = async (id: string, data: any) => {
    try {
      const updated = await employeeAPI.update(id, data);
      setEmployees(employees.map((e) => (e.id === id ? updated : e)));
      setShowModal(false);
      showSuccess("Employee updated successfully!");
    } catch { showError("Failed to update employee"); }
  };

  const handleActivateEmployee = async (id: string) => {
    if (!confirm("Activate this employee?")) return;
    try {
      await employeeAPI.activate(id);
      setEmployees(employees.map((e) => (e.id === id ? { ...e, status: "Active" } : e)));
      showSuccess("Employee activated!");
    } catch { showError("Failed to activate employee"); }
  };

  const handleSuspendEmployee = async (id: string) => {
    if (!confirm("Suspend this employee?")) return;
    try {
      await employeeAPI.suspend(id);
      setEmployees(employees.map((e) => (e.id === id ? { ...e, status: "Suspended" } : e)));
      showSuccess("Employee suspended!");
    } catch { showError("Failed to suspend employee"); }
  };

  const handleTerminateEmployee = async (id: string) => {
    if (!confirm("Terminate this employee?")) return;
    try {
      await employeeAPI.terminate(id);
      setEmployees(employees.map((e) => (e.id === id ? { ...e, status: "Terminated" } : e)));
      showSuccess("Employee terminated!");
    } catch { showError("Failed to terminate employee"); }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Delete this employee? This cannot be undone.")) return;
    try {
      await employeeAPI.delete(id);
      setEmployees(employees.filter((e) => e.id !== id));
      if (selectedEmployee?.id === id) { setSelectedEmployee(null); setActiveTab("list"); }
      showSuccess("Employee deleted!");
    } catch { showError("Failed to delete employee"); }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256, color: "#6b7280" }}>
        Loading employees...
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Employees</h1>

      {success && (
        <div style={{ marginBottom: 12, padding: "10px 14px", background: "#dcfce7", color: "#166534", borderRadius: 8, fontSize: 13 }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ marginBottom: 12, padding: "10px 14px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: 24, display: "flex", gap: 0 }}>
        {["list", "profile", "records"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px", background: "none", border: "none",
              borderBottom: activeTab === tab ? "2px solid #2563eb" : "2px solid transparent",
              color: activeTab === tab ? "#2563eb" : "#6b7280",
              fontWeight: activeTab === tab ? 600 : 400,
              fontSize: 14, cursor: "pointer", textTransform: "capitalize", fontFamily: "inherit",
            }}
          >
            {tab === "list" ? "Employee List" : tab === "profile" ? "Employee Profile" : "Employee Records"}
          </button>
        ))}
      </div>

      {activeTab === "list" && (
        <EmployeeList
          employees={filteredEmployees}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterDepartment={filterDepartment}
          setFilterDepartment={setFilterDepartment}
          onSelectEmployee={(emp: any) => { setSelectedEmployee(emp); setActiveTab("profile"); }}
          onAddEmployee={() => { setModalType("add"); setShowModal(true); }}
          onEditEmployee={(emp: any) => { setSelectedEmployee(emp); setModalType("edit"); setShowModal(true); }}
          onActivateEmployee={handleActivateEmployee}
          onSuspendEmployee={handleSuspendEmployee}
          onTerminateEmployee={handleTerminateEmployee}
          onDeleteEmployee={handleDeleteEmployee}
        />
      )}
      {activeTab === "profile" && (
        <EmployeeProfile
          employee={selectedEmployee}
          onBack={() => setActiveTab("list")}
          onEdit={() => { setModalType("edit"); setShowModal(true); }}
          onActivate={handleActivateEmployee}
          onSuspend={handleSuspendEmployee}
          onTerminate={handleTerminateEmployee}
        />
      )}
      {activeTab === "records" && <EmployeeRecords employeeId={selectedEmployee?.id} />}

      {showModal && (
        <EmployeeModal
          type={modalType}
          employee={modalType === "edit" ? selectedEmployee : null}
          onClose={() => setShowModal(false)}
          onSave={(data: any) => {
            if (modalType === "add") handleAddEmployee(data);
            else handleEditEmployee(selectedEmployee.id, data);
          }}
        />
      )}
    </div>
  );
}

function EmployeeList({ employees, searchTerm, setSearchTerm, filterDepartment, setFilterDepartment,
  onSelectEmployee, onAddEmployee, onEditEmployee, onActivateEmployee, onSuspendEmployee, onTerminateEmployee, onDeleteEmployee }: any) {
  const departments = ["All", "IT", "HR", "Finance", "Operations", "Marketing", "Sales", "Nursing"];
  const statusColors: Record<string, { bg: string; color: string }> = {
    Active:     { bg: "#dcfce7", color: "#166534" },
    "On Leave": { bg: "#fef9c3", color: "#854d0e" },
    Suspended:  { bg: "#fee2e2", color: "#dc2626" },
    Terminated: { bg: "#f3f4f6", color: "#6b7280" },
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Search by name, ID or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 8,
              width: 300, fontSize: 13, outline: "none",
            }}
          />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}
          >
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button
            onClick={() => { setSearchTerm(""); setFilterDepartment("All"); }}
            style={{
              padding: "8px 14px", background: "#f3f4f6", border: "1px solid #d1d5db",
              borderRadius: 8, fontSize: 13, cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
        <button
          onClick={onAddEmployee}
          style={{
            padding: "8px 16px", background: "#2563eb", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          + Add Employee
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Employee ID", "Name", "Department", "Position", "Status", "Actions"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "48px 16px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                  No employees found. Click "+ Add Employee" to create one.
                </td>
              </tr>
            ) : (
              employees.map((emp: any) => {
                const sc = statusColors[emp.status] || { bg: "#f3f4f6", color: "#6b7280" };
                return (
                  <tr key={emp.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{emp.id}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#111827" }}>{emp.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{emp.department}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{emp.position}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 500, background: sc.bg, color: sc.color }}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => onSelectEmployee(emp)} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>View</button>
                        <button onClick={() => onEditEmployee(emp)} style={{ color: "#16a34a", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Edit</button>
                        {emp.status === "Active" && (
                          <button onClick={() => onSuspendEmployee(emp.id)} style={{ color: "#d97706", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Suspend</button>
                        )}
                        {emp.status === "Suspended" && (
                          <button onClick={() => onActivateEmployee(emp.id)} style={{ color: "#16a34a", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Activate</button>
                        )}
                        {emp.status !== "Terminated" && (
                          <button onClick={() => onTerminateEmployee(emp.id)} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Terminate</button>
                        )}
                        <button onClick={() => onDeleteEmployee(emp.id)} style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div style={{ padding: "10px 16px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Total: {employees.length} employees</p>
        </div>
      </div>
    </div>
  );
}

function EmployeeProfile({ employee, onBack, onEdit, onActivate, onSuspend, onTerminate }: any) {
  if (!employee) {
    return (
      <div>
        <button onClick={onBack} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", marginBottom: 16, fontSize: 14 }}>
          ← Back to Employee List
        </button>
        <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#9ca3af", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
          Please select an employee from the list
        </div>
      </div>
    );
  }

  const statusColors: Record<string, { bg: string; color: string }> = {
    Active:     { bg: "#dcfce7", color: "#166534" },
    "On Leave": { bg: "#fef9c3", color: "#854d0e" },
    Suspended:  { bg: "#fee2e2", color: "#dc2626" },
    Terminated: { bg: "#f3f4f6", color: "#6b7280" },
  };
  const sc = statusColors[employee.status] || { bg: "#f3f4f6", color: "#6b7280" };

  return (
    <div>
      <button onClick={onBack} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", marginBottom: 16, fontSize: 14 }}>
        ← Back to Employee List
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
        {/* Left card */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", background: "#dbeafe", color: "#2563eb",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 700, margin: "0 auto 12px",
            }}>
              {employee.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>{employee.name || "N/A"}</h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0" }}>{employee.position || "N/A"}</p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{employee.department || "N/A"}</p>
            <span style={{ display: "inline-block", marginTop: 8, padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 500, background: sc.bg, color: sc.color }}>
              {employee.status || "N/A"}
            </span>
          </div>
          {[
            { title: "Personal Information", items: [{ label: "Email", value: employee.email }, { label: "Phone", value: employee.phone }, { label: "Join Date", value: employee.joinDate }] },
            { title: "Emergency Contact", items: [{ label: "", value: employee.emergency }] },
            { title: "Assigned Shift", items: [{ label: "", value: employee.shift }] },
          ].map((section) => (
            <div key={section.title} style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>{section.title}</h3>
              {section.items.map((item, i) => (
                <p key={i} style={{ fontSize: 13, color: "#6b7280", margin: "2px 0" }}>
                  {item.label ? `${item.label}: ` : ""}{item.value || "N/A"}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Actions</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={onEdit} style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Edit Employee</button>
              {employee.status === "Suspended" && (
                <button onClick={() => onActivate(employee.id)} style={{ padding: "8px 16px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Activate</button>
              )}
              {employee.status === "Active" && (
                <button onClick={() => onSuspend(employee.id)} style={{ padding: "8px 16px", background: "#d97706", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Suspend</button>
              )}
              {employee.status !== "Terminated" && (
                <button onClick={() => onTerminate(employee.id)} style={{ padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Terminate</button>
              )}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Employee Records</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[{ label: "Attendance History", color: "#2563eb" }, { label: "Leave History", color: "#16a34a" }, { label: "Payroll History", color: "#8b5cf6" }].map((item) => (
                <div key={item.label} style={{ padding: 16, background: "#f9fafb", borderRadius: 10, textAlign: "center" }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: item.color, margin: 0 }}>--</p>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeRecords({ employeeId }: any) {
  const [recordTab, setRecordTab] = useState("attendance");

  if (!employeeId) {
    return (
      <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#9ca3af", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
        Select an employee to view their records
      </div>
    );
  }

  return (
    <div>
      <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: 20, display: "flex" }}>
        {["attendance", "leave", "payroll"].map((tab) => (
          <button key={tab} onClick={() => setRecordTab(tab)} style={{
            padding: "10px 20px", background: "none", border: "none",
            borderBottom: recordTab === tab ? "2px solid #2563eb" : "2px solid transparent",
            color: recordTab === tab ? "#2563eb" : "#6b7280",
            fontWeight: recordTab === tab ? 600 : 400,
            fontSize: 14, cursor: "pointer", textTransform: "capitalize", fontFamily: "inherit",
          }}>
            {tab} History
          </button>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#9ca3af", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
        {recordTab.charAt(0).toUpperCase() + recordTab.slice(1)} records will appear here once the API is connected
      </div>
    </div>
  );
}

function EmployeeModal({ type, employee, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name:      employee?.name      || "",
    department:employee?.department|| "",
    position:  employee?.position  || "",
    email:     employee?.email     || "",
    phone:     employee?.phone     || "",
    emergency: employee?.emergency || "",
    shift:     employee?.shift     || "",
    joinDate:  employee?.joinDate  || "",
  });

  const update = (key: string, val: string) => setFormData((p) => ({ ...p, [key]: val }));

  const inputStyle = {
    width: "100%", padding: "8px 12px", border: "1px solid #d1d5db",
    borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const,
  };
  const labelStyle = { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 4 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
          {type === "add" ? "Add New Employee" : "Edit Employee"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Name *",     key: "name",     type: "text",  required: true },
            { label: "Position *", key: "position", type: "text",  required: true },
            { label: "Email *",    key: "email",    type: "email", required: true },
            { label: "Phone *",    key: "phone",    type: "tel",   required: true },
            { label: "Emergency Contact", key: "emergency", type: "text", required: false },
            { label: "Join Date *", key: "joinDate", type: "date", required: true },
          ].map((field) => (
            <div key={field.key}>
              <label style={labelStyle}>{field.label}</label>
              <input
                type={field.type}
                required={field.required}
                value={(formData as any)[field.key]}
                onChange={(e) => update(field.key, e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}

          <div>
            <label style={labelStyle}>Department *</label>
            <select required value={formData.department} onChange={(e) => update("department", e.target.value)} style={inputStyle}>
              <option value="">Select Department</option>
              {["IT", "HR", "Finance", "Operations", "Marketing", "Sales", "Nursing"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Assigned Shift</label>
            <select value={formData.shift} onChange={(e) => update("shift", e.target.value)} style={inputStyle}>
              <option value="">Select Shift</option>
              <option value="Morning (06:00 - 14:00)">Morning (06:00 - 14:00)</option>
              <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
              <option value="Night (22:00 - 06:00)">Night (22:00 - 06:00)</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
          >
            {type === "add" ? "Add Employee" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}