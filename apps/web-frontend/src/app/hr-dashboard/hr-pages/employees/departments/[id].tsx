import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  ArrowLeft, Users, UserPlus, UserMinus, Clock, CalendarDays,
  FileText, AlertCircle, Loader2, Building2, UserCheck, UserX,
  Briefcase, Award, TrendingUp, Download, RefreshCw,
  Eye, Edit, Trash2, CheckCircle, XCircle
} from 'lucide-react';
import { useApi } from '../../../../../hooks/hr-hooks/useApi';
import { employeeService } from '../../../../../services/hr-services/employeeService';

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

export default function DepartmentDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Real API call - fetch department by ID
  const { data: department, loading, error, refetch } = useApi(
    () => employeeService.getDepartment(id as string),
    { enabled: !!id }
  );

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTransfer = () => {
    showToast('🔄 Opening employee transfer form', 'info');
    router.push(`/employees/transfer?department=${department?.id}`);
  };

  const handleRecruit = () => {
    const vacancies = (department?.requiredStaff || 0) - (department?.currentStaff || 0);
    if (vacancies <= 0) {
      showToast('✅ Department is fully staffed!', 'success');
      return;
    }
    showToast(`📋 Starting recruitment for ${vacancies} positions`, 'info');
    router.push(`/recruitment?department=${department?.id}&vacancies=${vacancies}`);
  };

  const handleExport = () => {
    showToast('📊 Exporting department report...', 'info');
  };

  const handleRefresh = async () => {
    await refetch();
    showToast('✅ Department data refreshed!', 'success');
  };

  if (loading && !department) {
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
          <h3 className="text-xl font-semibold text-gray-900 mt-4">Failed to Load Department</h3>
          <p className="text-gray-500 mt-2">{error.message}</p>
          <button onClick={handleRefresh} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Department Not Found</h3>
          <button onClick={() => router.push('/employees/departments')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Back to Departments
          </button>
        </div>
      </div>
    );
  }

  const currentStaff = department.currentStaff || 0;
  const requiredStaff = department.requiredStaff || 0;
  const vacancies = requiredStaff - currentStaff;
  const isFullyStaffed = currentStaff >= requiredStaff;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <button onClick={() => router.push('/employees/departments')} className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 mb-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Departments
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{department.name || '--'}</h1>
          <p className="text-gray-500">{department.code || '--'} • Manager: {department.managerName || '--'}</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button onClick={handleRefresh} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={handleTransfer} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
            <UserMinus className="w-4 h-4" /> Transfer Employee
          </button>
          <button onClick={handleRecruit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4" /> Start Recruitment
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Current Staff</p>
          <p className="text-2xl font-bold text-gray-900">{currentStaff || '--'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Required Staff</p>
          <p className="text-2xl font-bold text-gray-900">{requiredStaff || '--'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Vacancies</p>
          <p className={`text-2xl font-bold ${vacancies > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {vacancies || '--'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Staff Status</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isFullyStaffed ? 'bg-green-100 text-green-700' :
            vacancies > 0 && vacancies <= requiredStaff * 0.3 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {isFullyStaffed ? 'Fully Staffed' :
             vacancies > 0 && vacancies <= requiredStaff * 0.3 ? 'Understaffed' :
             'Critical'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {['overview', 'staff', 'attendance', 'leave', 'recruitment'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Department Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Positions</h4>
                  {department.positions && department.positions.length > 0 ? (
                    <div className="space-y-2">
                      {department.positions.map((pos: string, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">{pos}</span>
                          <span className="text-sm text-gray-500">Active</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No positions defined</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Quick Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Total Staff</span>
                      <span className="font-medium text-gray-900">{currentStaff}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Required Staff</span>
                      <span className="font-medium text-gray-900">{requiredStaff}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Vacancies</span>
                      <span className={`font-medium ${vacancies > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {vacancies}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Staff Members</h3>
                <button onClick={handleTransfer} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center gap-1">
                  <UserMinus className="w-4 h-4" /> Transfer Staff
                </button>
              </div>
              {department.employees && department.employees.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {department.employees.map((emp: any) => (
                        <tr key={emp.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{emp.name || '--'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{emp.role || '--'}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              emp.status === 'active' ? 'bg-green-100 text-green-700' :
                              emp.status === 'on_leave' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {emp.status || '--'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No staff members assigned</p>
              )}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Attendance Summary</h3>
              {department.attendance ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{department.attendance.present || 0}</p>
                    <p className="text-sm text-gray-500">Present</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{department.attendance.onLeave || 0}</p>
                    <p className="text-sm text-gray-500">On Leave</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{department.attendance.absent || 0}</p>
                    <p className="text-sm text-gray-500">Absent</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{department.attendance.late || 0}</p>
                    <p className="text-sm text-gray-500">Late</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No attendance data available</p>
              )}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                View Full Attendance Report
              </button>
            </div>
          )}

          {/* Leave Tab */}
          {activeTab === 'leave' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Leave Requests</h3>
              {department.leaveRequests && department.leaveRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {department.leaveRequests.map((req: any) => (
                        <tr key={req.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{req.employee || '--'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{req.type || '--'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{req.startDate || '--'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{req.endDate || '--'}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              req.status === 'approved' ? 'bg-green-100 text-green-700' :
                              req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {req.status || '--'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No leave requests</p>
              )}
            </div>
          )}

          {/* Recruitment Tab */}
          {activeTab === 'recruitment' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Recruitment Status</h3>
              {vacancies > 0 ? (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800">
                      <strong>Vacancies:</strong> {vacancies} positions open
                    </p>
                  </div>
                  {department.recruitment?.positions && department.recruitment.positions.length > 0 ? (
                    <div className="space-y-3">
                      {department.recruitment.positions.map((pos: string, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">{pos}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Open</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No positions defined for recruitment</p>
                  )}
                  <button onClick={handleRecruit} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                    Start Recruitment Process
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900">Fully Staffed</h4>
                  <p className="text-gray-500">All positions are filled</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
