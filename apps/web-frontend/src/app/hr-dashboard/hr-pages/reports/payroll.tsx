import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  DollarSign, RefreshCw, Download, ChevronLeft, Loader2,
  AlertCircle, Filter, Search, Printer, Users,
  TrendingUp, FileText, Calendar, PieChart,
  Building2, Award, Percent
} from 'lucide-react';
import { useApi } from '../../../../hooks/hr-hooks/useApi';
import { payrollService } from '../../../../services/hr-services/payrollService';

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

export default function PayrollReports() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [department, setDepartment] = useState('');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  
  const { data: payrollData, loading: payrollLoading, error, refetch } = useApi(
    () => payrollService.getPayrollRuns()
  );
  const { data: allowancesData, loading: allowancesLoading } = useApi(
    () => payrollService.getAllowances()
  );
  const { data: deductionsData, loading: deductionsLoading } = useApi(
    () => payrollService.getDeductions()
  );
  const { data: taxesData, loading: taxesLoading } = useApi(
    () => payrollService.getTaxes()
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
      showToast('✅ Payroll report generated!', 'success');
    }, 1500);
  };

  const handleExport = (format: string) => {
    showToast(`📊 Exporting as ${format.toUpperCase()}...`, 'info');
  };

  const handlePrint = () => {
    showToast('🖨️ Preparing report for printing...', 'info');
  };

  // Safe data handling - ensure arrays
  const payrollRuns = Array.isArray(payrollData) ? payrollData : [];
  const allowances = Array.isArray(allowancesData) ? allowancesData : [];
  const deductions = Array.isArray(deductionsData) ? deductionsData : [];
  const taxes = Array.isArray(taxesData) ? taxesData : [];

  // Safe reduce with fallback
  const safeReduce = (arr: any[], key: string) => {
    return arr.reduce((acc: number, item: any) => acc + (item?.[key] || 0), 0);
  };

  const summaryStats = {
    totalGrossPay: safeReduce(payrollRuns, 'totalGrossPay'),
    totalNetPay: safeReduce(payrollRuns, 'totalNetPay'),
    totalDeductions: safeReduce(deductions, 'value'),
    totalAllowances: safeReduce(allowances, 'value'),
    totalTaxes: safeReduce(taxes, 'rate'),
    totalEmployees: safeReduce(payrollRuns, 'totalEmployees')
  };

  if (payrollLoading || allowancesLoading || deductionsLoading || taxesLoading) {
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
          <h3 className="text-xl font-semibold text-gray-900 mt-4">Failed to Load Payroll Reports</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Payroll Reports</h1>
          <p className="text-gray-500 mt-1">Salary summary, payroll processing, deductions, overtime payments</p>
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Gross Pay</p>
          <p className="text-2xl font-bold text-blue-600">
            {summaryStats.totalGrossPay > 0 ? `$${(summaryStats.totalGrossPay / 1000).toFixed(0)}K` : '--'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Net Pay</p>
          <p className="text-2xl font-bold text-green-600">
            {summaryStats.totalNetPay > 0 ? `$${(summaryStats.totalNetPay / 1000).toFixed(0)}K` : '--'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Deductions</p>
          <p className="text-2xl font-bold text-red-600">
            {summaryStats.totalDeductions > 0 ? `$${(summaryStats.totalDeductions / 1000).toFixed(0)}K` : '--'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Allowances</p>
          <p className="text-2xl font-bold text-purple-600">
            {summaryStats.totalAllowances > 0 ? `$${(summaryStats.totalAllowances / 1000).toFixed(0)}K` : '--'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Payroll Runs</h3>
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
              </tr>
            </thead>
            <tbody>
              {payrollRuns.slice(0, 10).map((run: any, index: number) => (
                <tr key={run.id || index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{run.name || '--'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {run.periodStart || '--'} - {run.periodEnd || '--'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{run.totalEmployees || '--'}</td>
                  <td className="px-4 py-3 text-center text-sm text-blue-600">
                    {run.totalGrossPay ? `$${(run.totalGrossPay / 1000).toFixed(0)}K` : '--'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-green-600">
                    {run.totalNetPay ? `$${(run.totalNetPay / 1000).toFixed(0)}K` : '--'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      run.status === 'approved' ? 'bg-green-100 text-green-700' :
                      run.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      run.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {run.status || '--'}
                    </span>
                  </td>
                </tr>
              ))}
              {payrollRuns.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No payroll records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
