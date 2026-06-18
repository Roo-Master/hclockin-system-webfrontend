import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Building2, RefreshCw, ArrowLeft, Loader2, Edit, Trash2, 
  Users, UserPlus, UserMinus, AlertCircle, Search, Download,
  Eye
} from 'lucide-react';
import { useApi } from '../../../../hooks/hr-hooks/useApi';
import { employeeService } from '../../../../services/hr-services/employeeService';

// Toast Component
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

export default function Departments() {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real API call - no mock data
  const { data: departments, loading, error, refetch } = useApi(
    () => employeeService.getDepartments()
  );

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Department Actions
  const handleViewDepartment = (department: any) => {
    console.log('Viewing department:', department);
    router.push(`/employees/departments/${department.id}`);
  };

  const handleEditDepartment = (department: any) => {
    console.log('Editing department:', department);
    showToast(`✏️ Editing ${department.name}`, 'info');
  };

  const handleDeleteDepartment = async (department: any) => {
    if (confirm(`Delete department "${department.name}"?`)) {
      try {
        await employeeService.deleteDepartment(department.id);
        await refetch();
        showToast(`✅ ${department.name} deleted!`, 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete department', 'error');
      }
    }
  };

  const handleTransferEmployee = (department: any) => {
    console.log('Transfer employee from:', department);
    showToast(`🔄 Transfer employee from ${department.name}`, 'info');
    router.push(`/employees/transfer?department=${department.id}`);
  };

  const handleRecruit = (department: any) => {
    console.log('Starting recruitment for:', department);
    const vacancies = (department.requiredStaff || 0) - (department.currentStaff || 0);
    if (vacancies <= 0) {
      showToast(`✅ ${department.name} is fully staffed!`, 'success');
      return;
    }
    showToast(`📋 Starting recruitment for ${department.name} (${vacancies} vacancies)`, 'info');
    router.push(`/recruitment?department=${department.id}&vacancies=${vacancies}`);
  };

  const handleRefresh = async () => {
    await refetch();
    showToast('✅ Departments refreshed!', 'success');
  };

  const handleExport = () => {
    showToast('📊 Exporting department data...', 'info');
  };

  // Filter departments based on search
  const filteredDepartments = departments?.filter((dept: any) =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Statistics - Calculate from real data
  const totalStaff = departments?.reduce((acc: number, dept: any) => acc + (dept.currentStaff || 0), 0) || 0;
  const totalVacancies = departments?.reduce((acc: number, dept: any) => acc + ((dept.requiredStaff || 0) - (dept.currentStaff || 0)), 0) || 0;
  const understaffedCount = departments?.filter((d: any) => (d.currentStaff || 0) < (d.requiredStaff || 0)).length || 0;

  if (loading && !departments) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="ml-3 text-gray-500">Loading departments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-xl border border-gray-200 p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900 mt-4">Failed to Load Departments</h3>
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <button onClick={() => router.push('/employees')} className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 mb-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Employees
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-500">Manage department staffing, positions, and recruitment</p>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments?.length || '--'}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{totalStaff || '--'}</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Vacancies</p>
              <p className={`text-2xl font-bold ${totalVacancies > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {totalVacancies || '--'}
              </p>
            </div>
            <UserPlus className={`w-8 h-8 ${totalVacancies > 0 ? 'text-red-400' : 'text-green-400'}`} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Understaffed</p>
              <p className="text-2xl font-bold text-yellow-600">{understaffedCount || '--'}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search departments by name or code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 text-gray-900 rounded-lg pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-blue-500" 
          />
        </div>
      </div>

      {/* Department Cards */}
      {filteredDepartments.length === 0 && !loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Departments Found</h3>
          <p className="text-gray-500">Departments will appear here once they are created in the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDepartments.map((dept: any) => {
            const currentStaff = dept.currentStaff || 0;
            const requiredStaff = dept.requiredStaff || 0;
            const vacancies = requiredStaff - currentStaff;
            const isFullyStaffed = currentStaff >= requiredStaff;
            const isUnderstaffed = currentStaff < requiredStaff && currentStaff >= requiredStaff * 0.7;
            const isCritical = currentStaff < requiredStaff * 0.7;

            return (
              <div key={dept.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                {/* Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{dept.name || '--'}</h3>
                        <p className="text-sm text-gray-500">{dept.code || '--'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditDepartment(dept)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit Department">
                        <Edit className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                      </button>
                      <button onClick={() => handleDeleteDepartment(dept)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete Department">
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{currentStaff || '--'}</p>
                      <p className="text-xs text-gray-500">Current Staff</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{requiredStaff || '--'}</p>
                      <p className="text-xs text-gray-500">Required Staff</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className={`text-2xl font-bold ${vacancies > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {vacancies || '--'}
                      </p>
                      <p className="text-xs text-gray-500">Vacancies</p>
                    </div>
                  </div>

                  {/* Staffing Status */}
                  <div className={`px-3 py-2 rounded-lg text-sm font-medium text-center ${
                    isFullyStaffed ? 'bg-green-100 text-green-700' :
                    isUnderstaffed ? 'bg-yellow-100 text-yellow-700' :
                    isCritical ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {isFullyStaffed ? '✅ Fully Staffed' : 
                     isUnderstaffed ? '⚠️ Understaffed' : 
                     isCritical ? '🔴 Critically Understaffed' :
                     '--'}
                  </div>

                  {/* Manager */}
                  {dept.managerName && (
                    <div className="mt-3 text-sm text-gray-500">
                      Manager: <span className="text-gray-700">{dept.managerName}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <button 
                      onClick={() => handleViewDepartment(dept)}
                      className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button 
                      onClick={() => handleTransferEmployee(dept)}
                      className="flex-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      <UserMinus className="w-3.5 h-3.5" /> Transfer
                    </button>
                    <button 
                      onClick={() => handleRecruit(dept)}
                      className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Recruit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
