import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Clock, DollarSign, CheckCircle, XCircle, RefreshCw,
  Download, ChevronLeft, Eye, Edit, AlertCircle,
  Search, Filter, FileText, Plus
} from 'lucide-react';
import { useApi } from '../../../../hooks/hr-hooks/useApi';
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

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    approved: 'bg-green-100 text-green-700 border border-green-300',
    rejected: 'bg-red-100 text-red-700 border border-red-300',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {status || '--'}
    </span>
  );
};

export default function OvertimePage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  
  const { data, loading, error, refetch } = useApi(
    () => attendanceService.getOvertimeRecords()
  );

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefresh = async () => {
    await refetch();
    showToast('✅ Overtime records refreshed!', 'success');
  };

  const handleExport = () => {
    showToast('📊 Exporting overtime data...', 'info');
  };

  const handleApprove = async (id: string) => {
    if (confirm('Approve this overtime request?')) {
      try {
        await attendanceService.approveOvertime(id);
        await refetch();
        showToast('✅ Overtime approved!', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to approve', 'error');
      }
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Reject this overtime request?')) {
      try {
        await attendanceService.rejectOvertime(id);
        await refetch();
        showToast('❌ Overtime rejected', 'warning');
      } catch (err: any) {
        showToast(err.message || 'Failed to reject', 'error');
      }
    }
  };

  const records = data || [];
  const filteredRecords = records.filter((r: any) => {
    const matchesSearch = r.employeeName?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesStatus = status ? r.status === status : true;
    return matchesSearch && matchesStatus;
  });

  const pending = filteredRecords.filter((r: any) => r.status === 'pending').length;
  const approved = filteredRecords.filter((r: any) => r.status === 'approved').length;
  const totalHours = filteredRecords.reduce((acc: number, r: any) => acc + (r.hours || 0), 0);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading overtime records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-xl border border-gray-200 p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900 mt-4">Failed to Load Overtime</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button onClick={handleRefresh} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
          <button onClick={() => router.push('/attendance')} className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 mb-2 text-sm">
            <ChevronLeft className="w-4 h-4" /> Back to Attendance
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Overtime Management</h1>
          <p className="text-gray-500 mt-1">Track and manage overtime requests</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button onClick={handleRefresh} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900">{filteredRecords.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-2xl font-bold text-yellow-600">{pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Approved Overtime</p>
          <p className="text-2xl font-bold text-green-600">{approved}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Hours</p>
          <p className="text-2xl font-bold text-blue-600">{totalHours}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 rounded-lg pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500" 
            />
          </div>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record: any) => (
                <tr key={record.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                        {record.employeeName?.[0] || 'U'}
                      </div>
                      <span className="text-sm text-gray-900">{record.employeeName || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {record.date ? new Date(record.date).toLocaleDateString() : '--'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.hours || '--'}</td>
                  <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {record.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(record.id)} className="p-1.5 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </button>
                          <button onClick={() => handleReject(record.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                            <XCircle className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      )}
                      <button onClick={() => router.push(`/attendance/overtime/${record.id}`)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4 text-blue-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Overtime Records</h3>
                    <p className="text-gray-500">No overtime requests found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
