'use client';

import { useState, useEffect } from 'react';
import { Button, Alert, Spinner } from '@/components/ui';

const payrollAPI = {
  getDashboard: async () => ({
    status: 'Ready',
    totalMonthly: 0,
    employeesPaid: 0,
    totalEmployees: 0,
    pendingPayments: 0,
    monthlyChange: 0,
    employeeChange: 0,
  }),
  getSalaryManagement: async () => ({
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    netPay: 0,
    records: [],
  }),
  getTaxSettings: async () => ({
    taxRate: 0,
    taxBrackets: [],
    totalTax: 0,
  }),
  getPayrollProcessing: async () => [],
  generatePayroll: async (data: any) => ({ success: true, message: 'Payroll generated successfully' }),
  reviewPayroll: async (id: string) => ({ success: true }),
  approvePayroll: async (id: string) => ({ success: true }),
  getPayslips: async (employeeId?: string, month?: string) => [],
  generatePayslip: async (employeeId: string, month: string) => ({ success: true, url: '/payslip.pdf' }),
  downloadPayslip: async (id: string) => ({ success: true }),
  printPayslip: async (id: string) => ({ success: true }),
  getPayrollHistory: async (month?: string) => [],
  getEmployeePayrollHistory: async (employeeId: string) => [],
  updateSalary: async (employeeId: string, data: any) => ({ success: true }),
  exportPayroll: async (format: string, month: string) => ({ success: true }),
  getPayrollStats: async () => ({ draft: 0, reviewed: 0, approved: 0 }),
};

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<any>({});
  const [salaryData, setSalaryData] = useState<any>({ records: [] });
  const [taxData, setTaxData] = useState<any>({ taxRate: 0, taxBrackets: [], totalTax: 0 });
  const [processingData, setProcessingData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>({});
  const [payslips, setPayslips] = useState<any[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [payrollPeriod, setPayrollPeriod] = useState('');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [employeeHistory, setEmployeeHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [selectedMonth]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dashboard, salary, tax, processing, stats, payslipsData, history] = await Promise.all([
        payrollAPI.getDashboard(),
        payrollAPI.getSalaryManagement(),
        payrollAPI.getTaxSettings(),
        payrollAPI.getPayrollProcessing(),
        payrollAPI.getPayrollStats(),
        payrollAPI.getPayslips('', selectedMonth),
        payrollAPI.getPayrollHistory(selectedMonth),
      ]);
      setDashboardData(dashboard);
      setSalaryData(salary);
      setTaxData(tax);
      setProcessingData(processing);
      setStatsData(stats);
      setPayslips(payslipsData);
      setPayrollHistory(history);
      setError('');
    } catch (err) {
      setError('Failed to load payroll data');
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

  const handleGeneratePayroll = async () => {
    if (!payrollPeriod) { showError('Please select a payroll period'); return; }
    if (confirm(`Generate payroll for ${payrollPeriod}?`)) {
      try {
        await payrollAPI.generatePayroll({ period: payrollPeriod });
        showSuccess('Payroll generated successfully!');
        fetchAllData();
        setShowModal(false);
        setPayrollPeriod('');
      } catch { showError('Failed to generate payroll'); }
    }
  };

  const handleReviewPayroll = async (id: string) => {
    if (confirm('Review this payroll?')) {
      try {
        await payrollAPI.reviewPayroll(id);
        showSuccess('Payroll reviewed successfully!');
        fetchAllData();
      } catch { showError('Failed to review payroll'); }
    }
  };

  const handleApprovePayroll = async (id: string) => {
    if (confirm('Approve this payroll?')) {
      try {
        await payrollAPI.approvePayroll(id);
        showSuccess('Payroll approved successfully!');
        fetchAllData();
      } catch { showError('Failed to approve payroll'); }
    }
  };

  const handleGeneratePayslip = async () => {
    if (!selectedEmployee) { showError('Please enter an employee ID'); return; }
    try {
      await payrollAPI.generatePayslip(selectedEmployee, selectedMonth);
      showSuccess('Payslip generated successfully!');
      fetchAllData();
      setShowModal(false);
      setSelectedEmployee('');
    } catch { showError('Failed to generate payslip'); }
  };

  const handleDownloadPayslip = async (id: string) => {
    try {
      await payrollAPI.downloadPayslip(id);
      showSuccess('Payslip download started!');
    } catch { showError('Failed to download payslip'); }
  };

  const handlePrintPayslip = async (id: string) => {
    try {
      await payrollAPI.printPayslip(id);
      showSuccess('Printing payslip...');
    } catch { showError('Failed to print payslip'); }
  };

  const handleExport = async (format: string) => {
    try {
      await payrollAPI.exportPayroll(format, selectedMonth);
      showSuccess(`${format.toUpperCase()} export initiated!`);
    } catch { showError('Failed to export payroll'); }
  };

  const handleSearchEmployeeHistory = async () => {
    if (!searchEmployee) { showError('Please enter an employee ID'); return; }
    try {
      const data = await payrollAPI.getEmployeePayrollHistory(searchEmployee);
      setEmployeeHistory(data);
      if (data.length === 0) showSuccess('No records found for this employee');
    } catch { showError('Failed to fetch employee records'); }
  };

  const handleUpdateSalary = async (employeeId: string, data: any) => {
    try {
      await payrollAPI.updateSalary(employeeId, data);
      showSuccess('Salary updated successfully!');
      fetchAllData();
    } catch { showError('Failed to update salary'); }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
          {success}
        </div>
      )}
      {error && <Alert type="error" message={error} onRetry={fetchAllData} />}

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {['dashboard', 'salary', 'processing', 'payslips', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'dashboard' ? 'Payroll Dashboard'
                : tab === 'salary' ? 'Salary Management'
                : tab === 'processing' ? 'Payroll Processing'
                : tab === 'payslips' ? 'Payslips'
                : 'Payroll History'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'dashboard' && (
        <PayrollDashboard
          data={dashboardData}
          onRefresh={fetchAllData}
          onExport={handleExport}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      )}
      {activeTab === 'salary' && (
        <SalaryManagement
          data={salaryData}
          taxData={taxData}
          onRefresh={fetchAllData}
          onUpdate={handleUpdateSalary}
        />
      )}
      {activeTab === 'processing' && (
        <PayrollProcessing
          data={processingData}
          stats={statsData}
          onGenerate={() => { setModalType('generate'); setShowModal(true); }}
          onReview={handleReviewPayroll}
          onApprove={handleApprovePayroll}
          onRefresh={fetchAllData}
        />
      )}
      {activeTab === 'payslips' && (
        <Payslips
          data={payslips}
          onGenerate={() => { setModalType('payslip'); setShowModal(true); }}
          onDownload={handleDownloadPayslip}
          onPrint={handlePrintPayslip}
          onRefresh={fetchAllData}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      )}
      {activeTab === 'history' && (
        <PayrollHistory
          data={payrollHistory}
          employeeHistory={employeeHistory}
          onSearchEmployee={handleSearchEmployeeHistory}
          searchEmployee={searchEmployee}
          setSearchEmployee={setSearchEmployee}
          onRefresh={fetchAllData}
          onExport={handleExport}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {modalType === 'generate' ? 'Generate Payroll' : 'Generate Payslip'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setPayrollPeriod(''); setSelectedEmployee(''); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {modalType === 'generate' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Period *</label>
                  <input
                    type="month"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={payrollPeriod}
                    onChange={(e) => setPayrollPeriod(e.target.value)}
                  />
                </div>
              )}
              {modalType === 'payslip' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter employee ID"
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <input
                      type="month"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => { setShowModal(false); setPayrollPeriod(''); setSelectedEmployee(''); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={modalType === 'generate' ? handleGeneratePayroll : handleGeneratePayslip}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {modalType === 'generate' ? 'Generate Payroll' : 'Generate Payslip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PayrollDashboard({ data, onRefresh, onExport, selectedMonth, onMonthChange }: any) {
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Payroll Dashboard</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="month"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
          />
          <Button variant="secondary" size="sm" onClick={onRefresh}>Refresh</Button>
          <Button variant="secondary" size="sm" onClick={() => onExport('pdf')}>PDF</Button>
          <Button variant="secondary" size="sm" onClick={() => onExport('excel')}>Excel</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Payroll Status</p>
          <p className="text-2xl font-bold text-blue-600">{data.status || 'Ready'}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total Monthly Payroll</p>
          <p className="text-2xl font-bold text-green-600">KES {data.totalMonthly?.toLocaleString() || 0}</p>
          <p className="text-xs text-green-600">{data.monthlyChange || 0}% vs last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Employees Paid</p>
          <p className="text-2xl font-bold text-purple-600">{data.employeesPaid || 0}</p>
          <p className="text-xs text-gray-500">of {data.totalEmployees || 0} total</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Pending Payments</p>
          <p className="text-2xl font-bold text-yellow-600">{data.pendingPayments || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium text-gray-700 mb-4">Monthly Payroll Summary</h3>
        <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
          <div className="text-center">
            <p className="font-medium">Payroll Chart</p>
            <p className="text-sm">Visual representation of payroll data</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalaryManagement({ data, taxData, onRefresh, onUpdate }: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    setEditData({ basicSalary: record.basicSalary || 0, allowances: record.allowances || 0, deductions: record.deductions || 0 });
  };

  const handleSave = async (id: string) => {
    await onUpdate(id, editData);
    setEditingId(null);
  };

  const calculateNetPay = (basic: number, allowances: number, deductions: number) => {
    const taxAmount = (basic + allowances) * ((taxData.taxRate || 0) / 100);
    return basic + allowances - deductions - taxAmount;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Salary Management</h2>
        <Button variant="secondary" size="sm" onClick={onRefresh}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Basic Salary</p>
          <p className="text-2xl font-bold text-gray-800">KES {data.basicSalary?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Allowances</p>
          <p className="text-2xl font-bold text-green-600">KES {data.allowances?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Deductions</p>
          <p className="text-2xl font-bold text-red-600">KES {data.deductions?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Tax Rate</p>
          <p className="text-2xl font-bold text-purple-600">{taxData.taxRate || 0}%</p>
          <p className="text-xs text-gray-500">Total Tax: KES {taxData.totalTax?.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Employee', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.records?.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No salary records found</td></tr>
              ) : (
                data.records?.map((record: any) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.employee}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {editingId === record.id
                        ? <input type="number" className="border rounded px-2 py-1 w-24" value={editData.basicSalary} onChange={(e) => setEditData({ ...editData, basicSalary: parseFloat(e.target.value) || 0 })} />
                        : `KES ${record.basicSalary?.toLocaleString() || 0}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {editingId === record.id
                        ? <input type="number" className="border rounded px-2 py-1 w-24" value={editData.allowances} onChange={(e) => setEditData({ ...editData, allowances: parseFloat(e.target.value) || 0 })} />
                        : `KES ${record.allowances?.toLocaleString() || 0}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {editingId === record.id
                        ? <input type="number" className="border rounded px-2 py-1 w-24" value={editData.deductions} onChange={(e) => setEditData({ ...editData, deductions: parseFloat(e.target.value) || 0 })} />
                        : `KES ${record.deductions?.toLocaleString() || 0}`}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      KES {calculateNetPay(record.basicSalary || 0, record.allowances || 0, record.deductions || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      {editingId === record.id ? (
                        <>
                          <button onClick={() => handleSave(record.id)} className="text-green-600 hover:text-green-800">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-800">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800">Edit</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t">
          <p className="text-sm text-gray-600">Total Employees: {data.records?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}

function PayrollProcessing({ data, stats, onGenerate, onReview, onApprove, onRefresh }: any) {
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Payroll Processing</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={onGenerate}>Generate Payroll</Button>
          <Button variant="secondary" size="sm" onClick={onRefresh}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.draft || 0}</p>
        </div>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-gray-600">Reviewed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.reviewed || 0}</p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Payroll ID', 'Period', 'Employees', 'Total', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No payroll records found. Click "Generate Payroll" to start.</td></tr>
              ) : (
                data?.map((record: any) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{record.period}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{record.employees}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">KES {record.total?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium
                        ${record.status === 'Draft' ? 'bg-yellow-100 text-yellow-800'
                          : record.status === 'Reviewed' ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      {record.status === 'Draft' && <button onClick={() => onReview(record.id)} className="text-blue-600 hover:text-blue-800">Review</button>}
                      {record.status === 'Reviewed' && <button onClick={() => onApprove(record.id)} className="text-green-600 hover:text-green-800">Approve</button>}
                      {record.status === 'Approved' && <span className="text-gray-400">Completed</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t">
          <p className="text-sm text-gray-600">Total: {data?.length || 0} payroll records</p>
        </div>
      </div>
    </div>
  );
}

function Payslips({ data, onGenerate, onDownload, onPrint, onRefresh, selectedMonth, onMonthChange }: any) {
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Payslips</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="month"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
          />
          <Button variant="primary" size="sm" onClick={onGenerate}>Generate Payslip</Button>
          <Button variant="secondary" size="sm" onClick={onRefresh}>Refresh</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Employee', 'Month', 'Net Pay', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No payslips found for {selectedMonth}. Click "Generate Payslip" to create one.</td></tr>
              ) : (
                data?.map((payslip: any) => (
                  <tr key={payslip.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{payslip.employee}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{payslip.month}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">KES {payslip.netPay?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium
                        ${payslip.status === 'Generated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {payslip.status || 'Generated'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button onClick={() => onDownload(payslip.id)} className="text-blue-600 hover:text-blue-800">Download</button>
                      <button onClick={() => onPrint(payslip.id)} className="text-green-600 hover:text-green-800">Print</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t">
          <p className="text-sm text-gray-600">Total Payslips: {data?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}

function PayrollHistory({ data, employeeHistory, onSearchEmployee, searchEmployee, setSearchEmployee, onRefresh, onExport, selectedMonth, onMonthChange }: any) {
  const [historyTab, setHistoryTab] = useState('monthly');

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Payroll History</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="month"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
          />
          <Button variant="secondary" size="sm" onClick={onRefresh}>Refresh</Button>
          <Button variant="secondary" size="sm" onClick={() => onExport('pdf')}>PDF</Button>
          <Button variant="secondary" size="sm" onClick={() => onExport('excel')}>Excel</Button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['monthly', 'employee'].map((t) => (
            <button
              key={t}
              onClick={() => setHistoryTab(t)}
              className={`py-2 px-1 border-b-2 font-medium text-sm
                ${historyTab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
            >
              {t === 'monthly' ? 'Monthly Payroll Records' : 'Employee Payroll Records'}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {historyTab === 'monthly' && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Month', 'Total Employees', 'Total Payroll', 'Status', 'Action'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No payroll history found for {selectedMonth}</td></tr>
                  ) : (
                    data?.map((record: any) => (
                      <tr key={record.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.month}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{record.employees}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">KES {record.total?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium
                            ${record.status === 'Approved' ? 'bg-green-100 text-green-800'
                              : record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button onClick={() => alert(`Viewing ${record.month} payroll details`)} className="text-blue-600 hover:text-blue-800">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">Total Records: {data?.length || 0}</p>
            </div>
          </>
        )}

        {historyTab === 'employee' && (
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter Employee ID"
                className="px-4 py-2 border border-gray-300 rounded-lg flex-1 min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSearchEmployee()}
              />
              <Button variant="primary" size="sm" onClick={onSearchEmployee}>Search</Button>
            </div>

            {employeeHistory?.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Enter an employee ID and click Search to view their payroll history</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Month', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay', 'Status'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employeeHistory?.map((record: any) => (
                      <tr key={record.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.month}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">KES {record.basicSalary?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">KES {record.allowances?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">KES {record.deductions?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600">KES {record.netPay?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium
                            ${record.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {record.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}