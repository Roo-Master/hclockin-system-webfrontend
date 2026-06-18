import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Percent, Plus, Search, AlertCircle, Eye, Edit, Trash2,
  RefreshCw, ChevronLeft, Loader2, Filter, CheckCircle, XCircle
} from 'lucide-react';
import { useQuery } from '../../../../hooks/hr-hooks/useapi';
import { payrollService, Tax } from '../../../../services/hr-services/payrollService';

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

export default function Taxes() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  
  const { data, isLoading, error, refetch } = useQuery(
    () => payrollService.getTaxes(),
    []
  );

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefresh = async () => {
    await refetch();
    showToast('✅ Taxes refreshed!', 'success');
  };

  const handleAddTax = () => {
    router.push('/payroll/taxes/add');
  };

  const handleEdit = (id: string) => {
    router.push(`/payroll/taxes/edit/${id}`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete tax "${name}"?`)) {
      try {
        await payrollService.deleteTax(id);
        await refetch();
        showToast(`✅ "${name}" deleted!`, 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete tax', 'error');
      }
    }
  };

  const taxes = data?.data || data || [];
  const filteredTaxes = taxes.filter((t: Tax) =>
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading && !data) {
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
          <h3 className="text-xl font-semibold text-gray-900 mt-4">Failed to Load Taxes</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Taxes</h1>
          <p className="text-gray-500 mt-1">Configure tax settings and rates</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button onClick={handleRefresh} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleAddTax} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Tax
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search taxes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 text-gray-900 rounded-lg pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500" 
          />
        </div>
      </div>

      {filteredTaxes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Percent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Taxes</h3>
          <p className="text-gray-500">Create your first tax configuration to get started.</p>
          <button onClick={handleAddTax} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 inline mr-2" /> Add Tax
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTaxes.map((tax: Tax) => (
            <div key={tax.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tax.name}</h3>
                    <p className="text-sm text-gray-500">{tax.rate}%</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(tax.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                    <Edit className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                  </button>
                  <button onClick={() => handleDelete(tax.id, tax.name)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Rate</span>
                  <span className="font-medium text-gray-900">{tax.rate}%</span>
                </div>
                {tax.bracketMin !== undefined && tax.bracketMax !== undefined && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-500">Bracket</span>
                    <span className="font-medium text-gray-900">
                      ${tax.bracketMin} - ${tax.bracketMax}
                    </span>
                  </div>
                )}
                {tax.description && (
                  <p className="text-xs text-gray-400 mt-2">{tax.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
