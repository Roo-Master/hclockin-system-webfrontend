"use client";
import { useState, useEffect } from 'react';

// API service placeholders - replace with actual API calls
const reportsAPI = {
  // Attendance Reports
  getDailyAttendanceReport: async (date: string) => {
    // Replace with: return await axios.get('/api/reports/attendance/daily', { params: { date } })
    return { data: [], summary: {} };
  },
  getMonthlyAttendanceReport: async (month: string) => {
    // Replace with: return await axios.get('/api/reports/attendance/monthly', { params: { month } })
    return { data: [], summary: {} };
  },
  getOvertimeReport: async (month: string) => {
    // Replace with: return await axios.get('/api/reports/attendance/overtime', { params: { month } })
    return { data: [], summary: {} };
  },
  getLateArrivalReport: async (month: string) => {
    // Replace with: return await axios.get('/api/reports/attendance/late-arrivals', { params: { month } })
    return { data: [], summary: {} };
  },
  
  // Employee Reports
  getEmployeeListReport: async () => {
    // Replace with: return await axios.get('/api/reports/employees/list')
    return { data: [], summary: {} };
  },
  getDepartmentReport: async () => {
    // Replace with: return await axios.get('/api/reports/employees/departments')
    return { data: [], summary: {} };
  },
  getActiveEmployeesReport: async () => {
    // Replace with: return await axios.get('/api/reports/employees/active')
    return { data: [], summary: {} };
  },
  
  // Leave Reports
  getLeaveSummaryReport: async (month: string) => {
    // Replace with: return await axios.get('/api/reports/leave/summary', { params: { month } })
    return { data: [], summary: {} };
  },
  getLeaveTrendsReport: async (year: string) => {
    // Replace with: return await axios.get('/api/reports/leave/trends', { params: { year } })
    return { data: [], summary: {} };
  },
  
  // Shift Reports
  getShiftCoverageReport: async (date: string) => {
    // Replace with: return await axios.get('/api/reports/shifts/coverage', { params: { date } })
    return { data: [], summary: {} };
  },
  getShiftAttendanceReport: async (date: string) => {
    // Replace with: return await axios.get('/api/reports/shifts/attendance', { params: { date } })
    return { data: [], summary: {} };
  },
  
  // Payroll Reports
  getSalaryReport: async (month: string) => {
    // Replace with: return await axios.get('/api/reports/payroll/salary', { params: { month } })
    return { data: [], summary: {} };
  },
  getPayrollSummaryReport: async (month: string) => {
    // Replace with: return await axios.get('/api/reports/payroll/summary', { params: { month } })
    return { data: [], summary: {} };
  },
  
  // Export
  exportReport: async (format: string, reportType: string, params: any) => {
    // Replace with: return await axios.post(`/api/reports/export/${format}`, { reportType, params })
    return { success: true, url: '/report.pdf' };
  }
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [reportData, setReportData] = useState<any>({ data: [], summary: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Report parameters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const fetchReport = async (reportType: string) => {
    try {
      setLoading(true);
      let result;
      
      switch (reportType) {
        // Attendance Reports
        case 'daily':
          result = await reportsAPI.getDailyAttendanceReport(selectedDate);
          break;
        case 'monthly':
          result = await reportsAPI.getMonthlyAttendanceReport(selectedMonth);
          break;
        case 'overtime':
          result = await reportsAPI.getOvertimeReport(selectedMonth);
          break;
        case 'late-arrivals':
          result = await reportsAPI.getLateArrivalReport(selectedMonth);
          break;
          
        // Employee Reports
        case 'employee-list':
          result = await reportsAPI.getEmployeeListReport();
          break;
        case 'department':
          result = await reportsAPI.getDepartmentReport();
          break;
        case 'active-employees':
          result = await reportsAPI.getActiveEmployeesReport();
          break;
          
        // Leave Reports
        case 'leave-summary':
          result = await reportsAPI.getLeaveSummaryReport(selectedMonth);
          break;
        case 'leave-trends':
          result = await reportsAPI.getLeaveTrendsReport(selectedYear);
          break;
          
        // Shift Reports
        case 'shift-coverage':
          result = await reportsAPI.getShiftCoverageReport(selectedDate);
          break;
        case 'shift-attendance':
          result = await reportsAPI.getShiftAttendanceReport(selectedDate);
          break;
          
        // Payroll Reports
        case 'salary':
          result = await reportsAPI.getSalaryReport(selectedMonth);
          break;
        case 'payroll-summary':
          result = await reportsAPI.getPayrollSummaryReport(selectedMonth);
          break;
          
        default:
          result = { data: [], summary: {} };
      }
      
      setReportData(result);
      setError('');
    } catch (err) {
      setError('Failed to load report data');
      setReportData({ data: [], summary: {} });
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

  const handleExport = async (format: string) => {
    try {
      await reportsAPI.exportReport(format, activeTab, {
        date: selectedDate,
        month: selectedMonth,
        year: selectedYear,
        employeeSearch,
        departmentFilter
      });
      showSuccess(`${format.toUpperCase()} export initiated successfully!`);
    } catch (err) {
      showError('Failed to export report');
    }
  };

  const handleGenerateReport = () => {
    fetchReport(activeTab);
  };

  useEffect(() => {
    // Don't auto-fetch on mount - wait for user to click Generate
  }, []);

  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>
        
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
            {['attendance', 'employees', 'leave', 'shifts', 'payroll'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setReportData({ data: [], summary: {} });
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize
                  ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab} Reports
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'attendance' && (
          <AttendanceReports 
            reportData={reportData}
            loading={loading}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onGenerate={handleGenerateReport}
            onExport={handleExport}
          />
        )}
        {activeTab === 'employees' && (
          <EmployeeReports 
            reportData={reportData}
            loading={loading}
            employeeSearch={employeeSearch}
            setEmployeeSearch={setEmployeeSearch}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            onGenerate={handleGenerateReport}
            onExport={handleExport}
          />
        )}
        {activeTab === 'leave' && (
          <LeaveReports 
            reportData={reportData}
            loading={loading}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onGenerate={handleGenerateReport}
            onExport={handleExport}
          />
        )}
        {activeTab === 'shifts' && (
          <ShiftReports 
            reportData={reportData}
            loading={loading}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onGenerate={handleGenerateReport}
            onExport={handleExport}
          />
        )}
        {activeTab === 'payroll' && (
          <PayrollReports 
            reportData={reportData}
            loading={loading}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onGenerate={handleGenerateReport}
            onExport={handleExport}
          />
        )}
      </div>
  );
}

function AttendanceReports({ reportData, loading, selectedDate, onDateChange, selectedMonth, onMonthChange, onGenerate, onExport }: any) {
  const [reportType, setReportType] = useState('daily');

  const getSummary = () => {
    const summary = reportData.summary || {};
    return (
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="bg-green-50 p-3 rounded">
          <p className="text-sm text-gray-600">Present</p>
          <p className="text-xl font-bold text-green-600">{summary.present || 0}</p>
        </div>
        <div className="bg-red-50 p-3 rounded">
          <p className="text-sm text-gray-600">Absent</p>
          <p className="text-xl font-bold text-red-600">{summary.absent || 0}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded">
          <p className="text-sm text-gray-600">Late</p>
          <p className="text-xl font-bold text-yellow-600">{summary.late || 0}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-gray-600">Total Staff</p>
          <p className="text-xl font-bold text-blue-600">{summary.total || 0}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Attendance Reports</h2>
        <div className="flex gap-2">
          <button onClick={() => onExport('pdf')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            PDF
          </button>
          <button onClick={() => onExport('excel')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Excel
          </button>
          <button onClick={() => onExport('csv')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${reportType === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Daily Attendance Report
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${reportType === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Monthly Attendance Report
          </button>
          <button
            onClick={() => setReportType('overtime')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${reportType === 'overtime' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Overtime Report
          </button>
          <button
            onClick={() => setReportType('late-arrivals')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${reportType === 'late-arrivals' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Late Arrival Report
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          {reportType === 'daily' && (
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
            />
          )}
          {(reportType === 'monthly' || reportType === 'overtime' || reportType === 'late-arrivals') && (
            <input
              type="month"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
            />
          )}
          <button
            onClick={onGenerate}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Generate Report
          </button>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-500">Loading report data...</div>
        )}

        {reportData.data?.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Click "Generate Report" to view data
          </div>
        )}

        {reportData.data?.length > 0 && !loading && (
          <>
            {getSummary()}
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.data.map((record: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm text-gray-900">{record.employee}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{record.date}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{record.clockIn || '--'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{record.clockOut || '--'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{record.hours || '--'}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium
                          ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 
                            record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 bg-gray-50 border-t">
                <p className="text-sm text-gray-600">Total Records: {reportData.data.length}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmployeeReports({ reportData, loading, employeeSearch, setEmployeeSearch, departmentFilter, setDepartmentFilter, onGenerate, onExport }: any) {
  const [reportType, setReportType] = useState('employee-list');
  const departments = ['All', 'IT', 'HR', 'Finance', 'Operations', 'Marketing', 'Sales', 'Nursing'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Employee Reports</h2>
        <div className="flex gap-2">
          <button onClick={() => onExport('pdf')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            PDF
          </button>
          <button onClick={() => onExport('excel')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Excel
          </button>
          <button onClick={() => onExport('csv')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setReportType('employee-list')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${reportType === 'employee-list' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Employee List Report
          </button>
          <button
            onClick={() => setReportType('department')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${reportType === 'department' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Department Report
          </button>
          <button
            onClick={() => setReportType('active-employees')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${reportType === 'active-employees' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Active Employees Report
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search employee..."
            className="px-4 py-2 border border-gray-300 rounded-lg flex-1 focus:ring-blue-500 focus:border-blue-500"
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button
            onClick={onGenerate}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Generate Report
          </button>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-500">Loading report data...</div>
        )}

        {reportData.data?.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Click "Generate Report" to view data
          </div>
        )}

        {reportData.data?.length > 0 && !loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.data.map((record: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-600">{record.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{record.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{record.department}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{record.position}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium
                        ${record.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          record.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">Total Employees: {reportData.data.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaveReports({ reportData, loading, selectedMonth, onMonthChange, selectedYear, onYearChange, onGenerate, onExport }: any) {
  const [reportType, setReportType] = useState('leave-summary');

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Leave Reports</h2>
        <div className="flex gap-2">
          <button onClick={() => onExport('pdf')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            PDF
          </button>
          <button onClick={() => onExport('excel')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Excel
          </button>
          <button onClick={() => onExport('csv')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setReportType('leave-summary')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${reportType === 'leave-summary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Leave Summary Report
          </button>
          <button
            onClick={() => setReportType('leave-trends')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${reportType === 'leave-trends' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Leave Trends Report
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          {reportType === 'leave-summary' && (
            <input
              type="month"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
            />
          )}
          {reportType === 'leave-trends' && (
            <input
              type="number"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-32"
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              placeholder="Year"
            />
          )}
          <button
            onClick={onGenerate}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Generate Report
          </button>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-500">Loading report data...</div>
        )}

        {reportData.data?.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Click "Generate Report" to view data
          </div>
        )}

        {reportData.data?.length > 0 && !loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.data.map((record: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-900">{record.employee}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{record.type}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{record.startDate}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{record.endDate}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{record.days}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium
                        ${record.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">Total Leave Records: {reportData.data.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShiftReports({ reportData, loading, selectedDate, onDateChange, onGenerate, onExport }: any) {
  const [reportType, setReportType] = useState('shift-coverage');

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Shift Reports</h2>
        <div className="flex gap-2">
          <button onClick={() => onExport('pdf')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            PDF
          </button>
          <button onClick={() => onExport('excel')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Excel
          </button>
          <button onClick={() => onExport('csv')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setReportType('shift-coverage')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${reportType === 'shift-coverage' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Shift Coverage Report
          </button>
          <button
            onClick={() => setReportType('shift-attendance')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${reportType === 'shift-attendance' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Shift Attendance Report
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
          <button
            onClick={onGenerate}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Generate Report
          </button>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-500">Loading report data...</div>
        )}

        {reportData.data?.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Click "Generate Report" to view data
          </div>
        )}

        {reportData.data?.length > 0 && !loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Coverage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.data.map((record: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-900">{record.department}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{record.shift}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{record.scheduled}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{record.present}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium
                        ${record.coverage >= 90 ? 'bg-green-100 text-green-800' : 
                          record.coverage >= 75 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {record.coverage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">Total Records: {reportData.data.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PayrollReports({ reportData, loading, selectedMonth, onMonthChange, onGenerate, onExport }: any) {
  const [reportType, setReportType] = useState('salary');

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Payroll Reports</h2>
        <div className="flex gap-2">
          <button onClick={() => onExport('pdf')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            PDF
          </button>
          <button onClick={() => onExport('excel')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Excel
          </button>
          <button onClick={() => onExport('csv')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setReportType('salary')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${reportType === 'salary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Salary Report
          </button>
          <button
            onClick={() => setReportType('payroll-summary')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${reportType === 'payroll-summary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Payroll Summary Report
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <input
            type="month"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
          />
          <button
            onClick={onGenerate}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Generate Report
          </button>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-500">Loading report data...</div>
        )}

        {reportData.data?.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Click "Generate Report" to view data
          </div>
        )}

        {reportData.data?.length > 0 && !loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Allowances</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tax</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.data.map((record: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-900">{record.employee}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">${record.basicSalary?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">${record.allowances?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">${record.deductions?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">${record.tax?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2 text-sm font-medium text-green-600">${record.netPay?.toLocaleString() || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">Total Records: {reportData.data.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
