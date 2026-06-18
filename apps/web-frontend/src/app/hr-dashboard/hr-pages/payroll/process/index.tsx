import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Calculator, Plus, RefreshCw, ChevronLeft, Loader2,
  Eye, Edit, Trash2, AlertCircle, CheckCircle, XCircle,
  Calendar, Users, DollarSign, FileText
} from 'lucide-react';
import { payrollService, PayrollRun } from '../../../../../services/hr-services/payrollService';

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
    draft: 'bg-gray-100 text-gray-700 border border-gray-300',
    processing: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    completed: 'bg-blue-100 text-blue-700 border border-blue-300',
    approved: 'bg-green-100 text-green-700 border border-green-300',
    paid: 'bg-purple-100 text-purple-700 border border-purple-300',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
      {status || '--'}
    </span>
  );
};

export default function ProcessPayroll() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runs, setRuns] = useState([]);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await payrollService.getPayrollRuns();
      setRuns(response?.data?.data || response || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load payroll runs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    await fetchData();
    showToast('✅ Payroll runs refreshed!', 'success');
  };

  const handleAddRun = () => {
    router.push('/payroll/process/add');
  };

  const handleProcess = async (id: string) => {
    if (confirm('Process this payroll run?')) {
      try {
        await payrollService.processPayrollRun(id);
        await fetchData();
        showToast('✅ Payroll run processing started!', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to process payroll run', 'error');
      }
    }
  };

  const handleApprove = async (id: string) => {
    if (confirm('Approve this payroll run?')) {
      try {
        await payrollService.approvePayrollRun(id);
        await fetchData();
        showToast('✅ Payroll run approved!', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to approve payroll run', 'error');
      }
    }
  };

  const handleView = (id: string) => {
    router.push(`/payroll/process/${id}`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete payroll run "${name}"?`)) {
      try {
        await payrollService.deletePayrollRun(id);
        await fetchData();
        showToast(`✅ "${name}" deleted!`, 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete payroll run', 'error');
      }
    }
  };

  if (loading) {
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
          <h3 className="text-xl font-semibold text-gray-900 mt-4">Failed to Load Payroll Runs</h3>
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
          <button onClick={() => router.push('/payroll')} className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 mb-2 text-sm">
            <ChevronLeft className="w-4 h-4" /> Back to Payroll
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Process Payroll</h1>
          <p className="text-gray-500 mt-1">Run and manage payroll processing</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button onClick={handleRefresh} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleAddRun} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Payroll Run
          </button>
        </div>
      </div>

      {runs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payroll Runs</h3>
          <p className="text-gray-500">Create your first payroll run to get started.</p>
          <button onClick={handleAddRun} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 inline mr-2" /> Create Payroll Run
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run: any) => (
                  <tr key={run.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{run.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {run.periodStart ? new Date(run.periodStart).toLocaleDateString() : '--'} - 
                      {run.periodEnd ? new Date(run.periodEnd).toLocaleDateString() : '--'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{run.totalEmployees || '--'}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      ${run.totalGrossPay ? run.totalGrossPay.toLocaleString() : '--'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      ${run.totalNetPay ? run.totalNetPay.toLocaleString() : '--'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {run.status === 'draft' && (
                          <button onClick={() => handleProcess(run.id)} className="p-1.5 hover:bg-yellow-50 rounded-lg transition-colors" title="Process">
                            <Calculator className="w-4 h-4 text-yellow-500" />
                          </button>
                        )}
                        {run.status === 'completed' && (
                          <button onClick={() => handleApprove(run.id)} className="p-1.5 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                        <button onClick={() => handleView(run.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                        {run.status === 'draft' && (
                          <button onClick={() => handleDelete(run.id, run.name)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
