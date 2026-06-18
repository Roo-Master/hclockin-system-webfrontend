import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FileText, Plus, Search, Eye, Edit, Trash2, 
  RefreshCw, Download, ChevronLeft, Loader2, AlertCircle
} from 'lucide-react';
import { useApi } from '../../../../hooks/hr-hooks/useApi';
import { employeeService, Contract } from '../../../../services/hr-services/employeeService';

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

export default function ContractsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, loading, error, refetch } = useApi(
    () => employeeService.getContracts({ page, limit, search: search || undefined }),
    { dependencies: [page, limit, search] }
  );

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddContract = () => {
    router.push('/employees/contracts/add');
  };

  const handleRefresh = async () => {
    await refetch();
    showToast('✅ Contracts refreshed!', 'success');
  };

  const handleExport = () => {
    showToast('📊 Exporting contracts...', 'info');
  };

  const handleView = (id: string) => {
    showToast(`📄 Viewing contract details`, 'info');
  };

  const handleEdit = (id: string) => {
    showToast(`✏️ Edit contract form opening`, 'info');
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete contract for ${name}?`)) {
      try {
        await employeeService.deleteContract(id);
        await refetch();
        showToast(`✅ Contract for ${name} deleted!`, 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete contract', 'error');
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await employeeService.updateContract(id, { status: newStatus as any });
      await refetch();
      showToast(`✅ Status updated to ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const contracts = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  if (loading && !data) {
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
          <h3 className="text-xl font-semibold text-gray-900 mt-4">Failed to Load Contracts</h3>
          <p className="text-gray-500 mt-2">{error.message}</p>
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
          <button onClick={() => router.push('/employees')} className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 mb-2 text-sm">
            <ChevronLeft className="w-4 h-4" /> Back to Employees
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-500">Manage employee contracts</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button onClick={handleRefresh} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={handleAddContract} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Contract
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search contracts by employee name..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full bg-gray-50 text-gray-900 rounded-lg pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500" 
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract: Contract, index: number) => (
                <tr key={contract.id} className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                        {contract.employeeName?.[0] || 'U'}
                      </div>
                      <span className="text-sm text-gray-900">{contract.employeeName || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{contract.type || '--'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '--'}
                    {contract.endDate && ` - ${new Date(contract.endDate).toLocaleDateString()}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {contract.salary ? `$${contract.salary.toLocaleString()}` : '--'}
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={contract.status || 'active'}
                      onChange={(e) => handleStatusChange(contract.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border ${
                        contract.status === 'active' ? 'bg-green-100 text-green-700 border-green-300' :
                        contract.status === 'inactive' ? 'bg-red-100 text-red-700 border-red-300' :
                        'bg-yellow-100 text-yellow-700 border-yellow-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleView(contract.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4 text-blue-500" />
                      </button>
                      <button onClick={() => handleEdit(contract.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4 text-yellow-500" />
                      </button>
                      <button onClick={() => handleDelete(contract.id, contract.employeeName || 'Unknown')} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Contracts Found</h3>
                    <p className="text-gray-500">Click "New Contract" to create one.</p>
                    <button onClick={handleAddContract} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Create Contract
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
