import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  TrendingUp, RefreshCw, Download, ChevronLeft, Loader2,
  AlertCircle, Filter, Search, Printer, Users,
  UserCheck, UserX, Building2, PieChart, BarChart3,
  Calendar, Clock, Award, Briefcase, GraduationCap,
  UserPlus, UserMinus, Activity, Target, Zap
} from 'lucide-react';
import { useApi } from '../../../../hooks/hr-hooks/useApi';
import { employeeService } from '../../../../services/hr-services/employeeService';
import { attendanceService } from '../../../../services/hr-services/attendanceService';

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

export default function WorkforceAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('month');
  const [department, setDepartment] = useState('');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const { data: employeesData, loading: empLoading, error, refetch } = useApi(
    () => employeeService.getEmployees()
  );
  const { data: stats, loading: statsLoading } = useApi(
    () => attendanceService.getAttendanceStats()
  );
  const { data: departmentsData, loading: deptLoading } = useApi(
    () => employeeService.getDepartments()
  );

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('✅ Workforce analytics generated!', 'success');
    }, 1500);
  };

  const handleExport = (format: string) => {
    showToast(`📊 Exporting as ${format.toUpperCase()}...`, 'info');
  };

  const handlePrint = () => {
    showToast('🖨️ Preparing report for printing...', 'info');
  };

  // Safe data handling - ensure arrays and objects
  const employeesList = Array.isArray(employeesData?.data) ? employeesData.data : [];
  const departmentsList = Array.isArray(departmentsData) ? departmentsData : [];
  const attendanceStats = stats || {};

  // Calculate workforce metrics safely
  const totalEmployees = employeesList.length || 0;
  const activeEmployees = employeesList.filter((e: any) => e?.status === 'active').length || 0;
  const onLeave = employeesList.filter((e: any) => e?.status === 'on_leave').length || 0;
  const inactive = employeesList.filter((e: any) => e?.status === 'inactive').length || 0;
  const attendanceRate = attendanceStats.attendanceRate || 0;

  // Department breakdown
  const deptBreakdown = departmentsList.map((dept: any) => ({
    name: dept?.name || '--',
    count: employeesList.filter((e: any) => e?.departmentId === dept?.id).length || 0
  }));

  // Calculate percentages safely
  const getPercentage = (value: number) => {
    return totalEmployees > 0 ? ((value / totalEmployees) * 100).toFixed(1) : 0;
  };

  if (empLoading || statsLoading || deptLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-xl border border-gray-200 p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900 mt-4">Failed to Load Workforce Analytics</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button onClick={handleGenerate} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <button onClick={() => router.push('/reports')} className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 mb-2 text-sm">
            <ChevronLeft className="w-4 h-4" /> Back to Reports
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Workforce Analytics</h1>
          <p className="text-gray-500 mt-1">Track workforce metrics, KPIs, and organizational health</p>
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

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
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
              {departmentsList.map((dept: any) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Generate Analytics'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-500">Total Employees</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalEmployees || '--'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-500">Active Employees</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{activeEmployees || '--'}</p>
          <p className="text-xs text-gray-400">{getPercentage(activeEmployees)}% of total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-600" />
            <p className="text-sm text-gray-500">On Leave</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{onLeave || '--'}</p>
          <p className="text-xs text-gray-400">{getPercentage(onLeave)}% of total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-gray-500">Attendance Rate</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{attendanceRate || '--'}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Department Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {deptBreakdown.map((dept: any, index: number) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{dept.name}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{dept.count}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                    {getPercentage(dept.count)}%
                  </td>
                </tr>
              ))}
              {deptBreakdown.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No department data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
