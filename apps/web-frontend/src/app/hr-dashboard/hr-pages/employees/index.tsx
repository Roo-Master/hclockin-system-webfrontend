import Layout from '@/components/hr-components/layout/Layout';
import { useState, useEffect } from 'react';

// API service placeholders - replace with actual API calls
const employeeAPI = {
  getAll: async () => {
    // Replace with: return await axios.get('/api/employees')
    return [];
  },
  create: async (data: any) => {
    // Replace with: return await axios.post('/api/employees', data)
    return { ...data, id: `EMP${Date.now()}` };
  },
  update: async (id: string, data: any) => {
    // Replace with: return await axios.put(`/api/employees/${id}`, data)
    return { ...data, id };
  },
  delete: async (id: string) => {
    // Replace with: return await axios.delete(`/api/employees/${id}`)
    return { success: true };
  },
  activate: async (id: string) => {
    // Replace with: return await axios.patch(`/api/employees/${id}/activate`)
    return { success: true };
  },
  suspend: async (id: string) => {
    // Replace with: return await axios.patch(`/api/employees/${id}/suspend`)
    return { success: true };
  },
  terminate: async (id: string) => {
    // Replace with: return await axios.patch(`/api/employees/${id}/terminate`)
    return { success: true };
  }
};

export default function Employees() {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeAPI.getAll();
      setEmployees(data);
      setError('');
    } catch (err) {
      setError('Failed to load employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 3000);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'All' || emp.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Add Employee
  const handleAddEmployee = async (employeeData: any) => {
    try {
      const newEmployee = await employeeAPI.create(employeeData);
      setEmployees([...employees, newEmployee]);
      setShowModal(false);
      showSuccess('Employee added successfully!');
    } catch (err) {
      showError('Failed to add employee');
      console.error(err);
    }
  };

  // Edit Employee
  const handleEditEmployee = async (id: string, updatedData: any) => {
    try {
      const updated = await employeeAPI.update(id, updatedData);
      const updatedEmployees = employees.map(emp => 
        emp.id === id ? updated : emp
      );
      setEmployees(updatedEmployees);
      setShowModal(false);
      showSuccess('Employee updated successfully!');
    } catch (err) {
      showError('Failed to update employee');
      console.error(err);
    }
  };

  // Activate Employee
  const handleActivateEmployee = async (id: string) => {
    if (confirm('Are you sure you want to activate this employee?')) {
      try {
        await employeeAPI.activate(id);
        const updatedEmployees = employees.map(emp =>
          emp.id === id ? { ...emp, status: 'Active' } : emp
        );
        setEmployees(updatedEmployees);
        showSuccess('Employee activated successfully!');
      } catch (err) {
        showError('Failed to activate employee');
        console.error(err);
      }
    }
  };

  // Suspend Employee
  const handleSuspendEmployee = async (id: string) => {
    if (confirm('Are you sure you want to suspend this employee?')) {
      try {
        await employeeAPI.suspend(id);
        const updatedEmployees = employees.map(emp =>
          emp.id === id ? { ...emp, status: 'Suspended' } : emp
        );
        setEmployees(updatedEmployees);
        showSuccess('Employee suspended successfully!');
      } catch (err) {
        showError('Failed to suspend employee');
        console.error(err);
      }
    }
  };

  // Terminate Employee
  const handleTerminateEmployee = async (id: string) => {
    if (confirm('Are you sure you want to terminate this employee?')) {
      try {
        await employeeAPI.terminate(id);
        const updatedEmployees = employees.map(emp =>
          emp.id === id ? { ...emp, status: 'Terminated' } : emp
        );
        setEmployees(updatedEmployees);
        showSuccess('Employee terminated successfully!');
      } catch (err) {
        showError('Failed to terminate employee');
        console.error(err);
      }
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        await employeeAPI.delete(id);
        const updatedEmployees = employees.filter(emp => emp.id !== id);
        setEmployees(updatedEmployees);
        if (selectedEmployee?.id === id) {
          setSelectedEmployee(null);
          setActiveTab('list');
        }
        showSuccess('Employee deleted successfully!');
      } catch (err) {
        showError('Failed to delete employee');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading employees...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Employees</h1>
        
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'list' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Employee List
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Employee Profile
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'records' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Employee Records
            </button>
          </nav>
        </div>

        {activeTab === 'list' && (
          <EmployeeList 
            employees={filteredEmployees}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterDepartment={filterDepartment}
            setFilterDepartment={setFilterDepartment}
            onSelectEmployee={(emp: any) => {
              setSelectedEmployee(emp);
              setActiveTab('profile');
            }}
            onAddEmployee={() => {
              setModalType('add');
              setShowModal(true);
            }}
            onEditEmployee={(emp: any) => {
              setSelectedEmployee(emp);
              setModalType('edit');
              setShowModal(true);
            }}
            onActivateEmployee={handleActivateEmployee}
            onSuspendEmployee={handleSuspendEmployee}
            onTerminateEmployee={handleTerminateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}
        {activeTab === 'profile' && (
          <EmployeeProfile 
            employee={selectedEmployee} 
            onBack={() => setActiveTab('list')}
            onEdit={() => {
              setModalType('edit');
              setShowModal(true);
            }}
            onActivate={handleActivateEmployee}
            onSuspend={handleSuspendEmployee}
            onTerminate={handleTerminateEmployee}
          />
        )}
        {activeTab === 'records' && (
          <EmployeeRecords employeeId={selectedEmployee?.id} />
        )}
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <EmployeeModal
          type={modalType}
          employee={modalType === 'edit' ? selectedEmployee : null}
          onClose={() => setShowModal(false)}
          onSave={(data: any) => {
            if (modalType === 'add') {
              handleAddEmployee(data);
            } else {
              handleEditEmployee(selectedEmployee.id, data);
            }
          }}
        />
      )}
    </Layout>
  );
}

function EmployeeList({ 
  employees, 
  searchTerm, 
  setSearchTerm,
  filterDepartment,
  setFilterDepartment,
  onSelectEmployee,
  onAddEmployee,
  onEditEmployee,
  onActivateEmployee,
  onSuspendEmployee,
  onTerminateEmployee,
  onDeleteEmployee
}: any) {
  const departments = ['All', 'IT', 'HR', 'Finance', 'Operations', 'Marketing', 'Sales', 'Nursing'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name, ID or department..."
            className="px-4 py-2 border border-gray-300 rounded-lg w-80 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button 
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            onClick={() => {
              setSearchTerm('');
              setFilterDepartment('All');
            }}
          >
            Clear
          </button>
        </div>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={onAddEmployee}
        >
          + Add Employee
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employment Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No employees found. Click "Add Employee" to create one.
                </td>
              </tr>
            ) : (
              employees.map((emp: any) => (
                <tr key={emp.id}>
                  <td className="px-6 py-4 text-sm text-gray-600">{emp.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{emp.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{emp.position}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${emp.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        emp.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-1">
                    <button 
                      onClick={() => onSelectEmployee(emp)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => onEditEmployee(emp)}
                      className="text-green-600 hover:text-green-800"
                    >
                      Edit
                    </button>
                    {emp.status === 'Active' && (
                      <button 
                        onClick={() => onSuspendEmployee(emp.id)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        Suspend
                      </button>
                    )}
                    {emp.status === 'Suspended' && (
                      <button 
                        onClick={() => onActivateEmployee(emp.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Activate
                      </button>
                    )}
                    {emp.status !== 'Terminated' && (
                      <button 
                        onClick={() => onTerminateEmployee(emp.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Terminate
                      </button>
                    )}
                    <button 
                      onClick={() => onDeleteEmployee(emp.id)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-6 py-3 bg-gray-50 border-t">
          <p className="text-sm text-gray-600">Total: {employees.length} employees</p>
        </div>
      </div>
    </div>
  );
}

function EmployeeProfile({ employee, onBack, onEdit, onActivate, onSuspend, onTerminate }: any) {
  if (!employee) {
    return (
      <div>
        <button onClick={onBack} className="mb-4 text-blue-600 hover:text-blue-800">
          ← Back to Employee List
        </button>
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Please select an employee from the list
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-blue-600 hover:text-blue-800">
        ← Back to Employee List
      </button>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
              {employee.name?.split(' ').map((n: string) => n[0]).join('') || '👤'}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{employee.name || 'N/A'}</h2>
            <p className="text-gray-500">{employee.position || 'N/A'}</p>
            <p className="text-sm text-gray-400">{employee.department || 'N/A'}</p>
            <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium
              ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 
                employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}`}>
              {employee.status || 'N/A'}
            </span>
          </div>
          
          <div className="mt-6 border-t pt-4">
            <h3 className="font-medium text-gray-700 mb-2">Personal Information</h3>
            <p className="text-sm text-gray-600">Email: {employee.email || 'N/A'}</p>
            <p className="text-sm text-gray-600">Phone: {employee.phone || 'N/A'}</p>
            <p className="text-sm text-gray-600">Join Date: {employee.joinDate || 'N/A'}</p>
          </div>

          <div className="mt-4 border-t pt-4">
            <h3 className="font-medium text-gray-700 mb-2">Emergency Contact</h3>
            <p className="text-sm text-gray-600">{employee.emergency || 'N/A'}</p>
          </div>

          <div className="mt-4 border-t pt-4">
            <h3 className="font-medium text-gray-700 mb-2">Assigned Shift</h3>
            <p className="text-sm text-gray-600">{employee.shift || 'N/A'}</p>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium text-gray-700 mb-4">Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={onEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit Employee
              </button>
              {employee.status === 'Suspended' && (
                <button 
                  onClick={() => onActivate(employee.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Activate Employee
                </button>
              )}
              {employee.status === 'Active' && (
                <button 
                  onClick={() => onSuspend(employee.id)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Suspend Employee
                </button>
              )}
              {employee.status !== 'Terminated' && (
                <button 
                  onClick={() => onTerminate(employee.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Terminate Employee
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium text-gray-700 mb-4">Employee Records</h3>
            <div className="grid grid-cols-3 gap-4">
              <button className="p-4 bg-gray-50 rounded text-center hover:bg-gray-100">
                <p className="text-2xl font-bold text-blue-600">--</p>
                <p className="text-sm text-gray-500">Attendance History</p>
              </button>
              <button className="p-4 bg-gray-50 rounded text-center hover:bg-gray-100">
                <p className="text-2xl font-bold text-green-600">--</p>
                <p className="text-sm text-gray-500">Leave History</p>
              </button>
              <button className="p-4 bg-gray-50 rounded text-center hover:bg-gray-100">
                <p className="text-2xl font-bold text-purple-600">--</p>
                <p className="text-sm text-gray-500">Payroll History</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeRecords({ employeeId }: any) {
  const [recordTab, setRecordTab] = useState('attendance');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employeeId) {
      // Replace with API call: fetchRecords(employeeId)
      setRecords([]);
    }
  }, [employeeId]);

  if (!employeeId) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        Select an employee to view their records
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['attendance', 'leave', 'payroll'].map((tab) => (
            <button
              key={tab}
              onClick={() => setRecordTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize
                ${recordTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
            >
              {tab} History
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading records...</div>
        ) : (
          <>
            {recordTab === 'attendance' && (
              <div className="p-8 text-center text-gray-500">
                Attendance records will appear here
              </div>
            )}
            {recordTab === 'leave' && (
              <div className="p-8 text-center text-gray-500">
                Leave records will appear here
              </div>
            )}
            {recordTab === 'payroll' && (
              <div className="p-8 text-center text-gray-500">
                Payroll records will appear here
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmployeeModal({ type, employee, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    department: employee?.department || '',
    position: employee?.position || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    emergency: employee?.emergency || '',
    shift: employee?.shift || '',
    joinDate: employee?.joinDate || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {type === 'add' ? 'Add New Employee' : 'Edit Employee'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Nursing">Nursing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={formData.emergency}
                onChange={(e) => setFormData({...formData, emergency: e.target.value})}
                placeholder="Name - Phone Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Shift</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={formData.shift}
                onChange={(e) => setFormData({...formData, shift: e.target.value})}
              >
                <option value="">Select Shift</option>
                <option value="Morning (06:00 - 14:00)">Morning (06:00 - 14:00)</option>
                <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                <option value="Night (22:00 - 06:00)">Night (22:00 - 06:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date *</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={formData.joinDate}
                onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {type === 'add' ? 'Add Employee' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
