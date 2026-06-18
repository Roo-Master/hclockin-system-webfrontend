import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Calendar, RefreshCw, Download, ChevronLeft, Loader2,
  AlertCircle, Filter, Search, Printer, Users,
  TrendingUp, UserCheck, UserX, FileText, BarChart3
} from 'lucide-react';
import { useApi } from '../../../../hooks/hr-hooks/useApi';
import { leaveService } from '../../../../services/hr-services/leaveService';

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

export default function LeaveReports() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  
  const { data: requestsData, loading: requestsLoading, error, refetch } = useApi(
    () => leaveService.getLeaveRequests()
  );
  const { data: statsData, loading: statsLoading } = useApi(
    () => leaveService.getLeaveStats()
  );

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = () => {
    if (!startDate || !endDate) {
      showToast('Please select both start and end dates', 'warning');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('✅ Leave report generated!', 'success');
    }, 1500);
  };

  const handleExport = (format: string) => {
    showToast(`📊 Exporting as ${format.toUpperCase()}...`, 'info');
  };

  const handlePrint = () => {
    showToast('🖨️ Preparing report for printing...', 'info');
  };

  const requests = requestsData?.data || [];
  const stats = statsData || {};

  const summaryStats = {
    totalRequests: requests.length || 0,
    approved: requests.filter((r: any) => r.status === 'approved').length || 0,
    pending: requests.filter((r: any) => r.status === 'pending').length || 0,
    rejected: requests.filter((r: any) => r.status === 'rejected').length || 0,
    totalDays: requests.reduce((acc: number, r: any) => acc + (r.days || 0), 0),
    onLeave: stats.onLeave || 0
  };

  if (requestsLoading || statsLoading) {
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
          <h3 className="text-xl font-semibold text-gray-900 mt-4">Failed to Load Leave Reports</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Leave Reports</h1>
          <p className="text-gray-500 mt-1">Leave requests, approved, rejected, balance, employees on leave</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select 
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="personal">Personal Leave</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900">{summaryStats.totalRequests || '--'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">{summaryStats.approved || '--'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{summaryStats.pending || '--'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">On Leave</p>
          <p className="text-2xl font-bold text-blue-600">{summaryStats.onLeave || '--'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Leave Requests</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 10).map((req: any, index: number) => (
                <tr key={req.id || index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{req.employeeName || '--'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{req.leaveTypeName || '--'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{req.startDate || '--'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{req.endDate || '--'}</td>
                  <td className="px-4 py-3 text-center text-sm text-blue-600">{req.days || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      req.status === 'approved' ? 'bg-green-100 text-green-700' :
                      req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {req.status || '--'}
                    </span>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No leave records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
