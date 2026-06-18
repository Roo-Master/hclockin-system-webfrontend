import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  TrendingUp, RefreshCw, Download, ChevronLeft, Loader2,
  AlertCircle, Filter, Search, Printer, Users,
  Award, Star, BarChart3, PieChart, Calendar,
  UserCheck, Building2, Clock
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

export default function PerformanceReports() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('month');
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
      showToast('✅ Performance report generated!', 'success');
    }, 1500);
  };

  const handleExport = (format: string) => {
    showToast(`📊 Exporting as ${format.toUpperCase()}...`, 'info');
  };

  const handlePrint = () => {
    showToast('🖨️ Preparing report for printing...', 'info');
  };

  const summaryStats = {
    averageRating: 4.2,
    topPerformers: 28,
    meetsExpectations: 156,
    needsImprovement: 34,
    underperforming: 27,
    totalEmployees: 245
  };

  const topPerformers = [
    { name: 'Dr. John Smith', department: 'Emergency', rating: 4.9, trend: '+5%' },
    { name: 'Nurse Mary Johnson', department: 'ICU', rating: 4.8, trend: '+3%' },
    { name: 'Dr. Sarah Wilson', department: 'Emergency', rating: 4.7, trend: '+2%' },
    { name: 'Lab Tech Mike Davis', department: 'Laboratory', rating: 4.6, trend: '+4%' },
    { name: 'Nurse Peter Brown', department: 'General Ward', rating: 4.5, trend: '+1%' },
  ];

  const departmentPerformance = [
    { name: 'Emergency', rating: 4.5, change: '+0.3' },
    { name: 'ICU', rating: 4.3, change: '+0.1' },
    { name: 'Laboratory', rating: 4.1, change: '+0.4' },
    { name: 'Pharmacy', rating: 3.9, change: '-0.1' },
    { name: 'General Ward', rating: 3.8, change: '+0.2' },
  ];

  const performanceTrend = [
    { month: 'Jan', rating: 3.8 },
    { month: 'Feb', rating: 3.9 },
    { month: 'Mar', rating: 4.0 },
    { month: 'Apr', rating: 4.1 },
    { month: 'May', rating: 4.2 },
    { month: 'Jun', rating: 4.3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <button onClick={() => router.push('/reports')} className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 mb-2 text-sm">
            <ChevronLeft className="w-4 h-4" /> Back to Reports
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Performance Reports</h1>
          <p className="text-gray-500 mt-1">Employee performance summaries, department performance, top performers, performance trends</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom</option>
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Average Rating</p>
          <p className="text-2xl font-bold text-blue-600">{summaryStats.averageRating}</p>
          <p className="text-xs text-gray-400">Out of 5.0</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Top Performers</p>
          <p className="text-2xl font-bold text-green-600">{summaryStats.topPerformers}</p>
          <p className="text-xs text-gray-400">Rating 4.5+</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Meets Expectations</p>
          <p className="text-2xl font-bold text-yellow-600">{summaryStats.meetsExpectations}</p>
          <p className="text-xs text-gray-400">Rating 3.0 - 4.4</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Needs Improvement</p>
          <p className="text-2xl font-bold text-red-600">{summaryStats.needsImprovement + summaryStats.underperforming}</p>
          <p className="text-xs text-gray-400">Rating below 3.0</p>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">🏆 Top Performers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map((performer, index) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500">#{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{performer.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{performer.department}</td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-green-600">{performer.rating}</td>
                  <td className="px-4 py-3 text-center text-sm text-green-600">{performer.trend}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Top Performer
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Department Performance</h3>
          <div className="space-y-4">
            {departmentPerformance.map((dept, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{dept.rating}</span>
                    <span className={`text-sm ${dept.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {dept.change}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(dept.rating / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Performance Trends</h3>
          <div className="space-y-4">
            {performanceTrend.map((trend, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{trend.month}</span>
                  <span className="text-sm font-medium text-gray-900">{trend.rating}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(trend.rating / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Performance increased by 0.5 points over the last 6 months
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
