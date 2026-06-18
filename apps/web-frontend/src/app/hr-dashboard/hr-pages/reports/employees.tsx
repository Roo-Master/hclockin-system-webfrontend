import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Users, RefreshCw, Download, ChevronLeft, Loader2,
  AlertCircle, Filter, Search, Printer, UserCheck,
  UserX, Briefcase, Building2, TrendingUp, PieChart,
  Male, Female, Calendar, UserPlus
} from 'lucide-react';

const Toast = ({ message, type, onClose }: any) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-100 text-green-700 border border-green-300',
    error: 'bg-red-100 text-red-700 border border-red-300',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    info: 'bg-blue-100 text-blue-700 border border-blue-300',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${styles[type]} max-w-md`}>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="p-1 hover:opacity-70">✕</button>
    </div>
  );
};

export default function EmployeeReports() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('directory');
  const [department, setDepartment] = useState('');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('✅ Employee report generated!', 'success');
    }, 1500);
  };

  const handleExport = (format: string) => {
    showToast(`📊 Exporting as ${format.toUpperCase()}...`, 'info');
  };

  const handlePrint = () => {
    showToast('🖨️ Preparing report for printing...', 'info');
  };

  const reportTypes = [
    { value: 'directory', label: 'Employee Directory' },
    { value: 'department', label: 'By Department' },
    { value: 'role', label: 'By Role' },
    { value: 'active', label: 'Active Employees' },
    { value: 'resigned', label: 'Resigned/Terminated' },
    { value: 'newhires', label: 'New Hires' }
  ];

  const summaryStats = {
    total: 245,
    active: 215,
    resigned: 18,
    onLeave: 12,
    male: 98,
    female: 147,
    newHires: 12,
    departments: 6,
    roles: 24
  };

  const departmentData = [
    { name: 'Emergency', count: 55, active: 48, onLeave: 4, resigned: 3 },
    { name: 'ICU', count: 40, active: 35, onLeave: 3, resigned: 2 },
    { name: 'Pharmacy', count: 34, active: 30, onLeave: 2, resigned: 2 },
    { name: 'Laboratory', count: 28, active: 25, onLeave: 1, resigned: 2 },
    { name: 'General Ward', count: 88, active: 77, onLeave: 2, resigned: 9 },
  ];

  const roleData = [
    { name: 'Doctor', count: 45, active: 40, onLeave: 3, resigned: 2 },
    { name: 'Nurse', count: 120, active: 108, onLeave: 8, resigned: 4 },
    { name: 'Technician', count: 35, active: 30, onLeave: 0, resigned: 5 },
    { name: 'Administration', count: 25, active: 22, onLeave: 1, resigned: 2 },
    { name: 'Support Staff', count: 20, active: 15, onLeave: 0, resigned: 5 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <button onClick={() => router.push('/reports')} className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 mb-2 text-sm">
            <ChevronLeft className="w-4 h-4" /> Back to Reports
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Employee Reports</h1>
          <p className="text-gray-500 mt-1">Employee directory, by department, by role, active, resigned, new hires</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button onClick={() => handleExport('pdf')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => handleExport('excel')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={handlePrint} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Departments</option>
              <option value="emergency">Emergency</option>
              <option value="icu">ICU</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="laboratory">Laboratory</option>
              <option value="general">General Ward</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active Employees</p>
          <p className="text-2xl font-bold text-green-600">{summaryStats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Male / Female</p>
          <p className="text-2xl font-bold text-gray-900">{summaryStats.male} / {summaryStats.female}</p>
          <p className="text-xs text-gray-400">Ratio: {((summaryStats.male / summaryStats.female) * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">New Hires</p>
          <p className="text-2xl font-bold text-blue-600">{summaryStats.newHires}</p>
          <p className="text-xs text-gray-400">This month</p>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Employees by Department</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">On Leave</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Resigned</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {departmentData.map((dept, index) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{dept.name}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{dept.count}</td>
                  <td className="px-4 py-3 text-center text-sm text-green-600">{dept.active}</td>
                  <td className="px-4 py-3 text-center text-sm text-blue-600">{dept.onLeave}</td>
                  <td className="px-4 py-3 text-center text-sm text-red-600">{dept.resigned}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                    {((dept.count / summaryStats.total) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Employees by Role</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">On Leave</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Resigned</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {roleData.map((role, index) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{role.name}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{role.count}</td>
                  <td className="px-4 py-3 text-center text-sm text-green-600">{role.active}</td>
                  <td className="px-4 py-3 text-center text-sm text-blue-600">{role.onLeave}</td>
                  <td className="px-4 py-3 text-center text-sm text-red-600">{role.resigned}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                    {((role.count / summaryStats.total) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
