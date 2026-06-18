import Layout from '@/components/hr-components/layout/Layout';
import { useState, useEffect } from 'react';

// API service placeholders - replace with actual API calls
const leaveAPI = {
  getRequests: async (status?: string) => {
    // Replace with: return await axios.get('/api/leave/requests', { params: { status } })
    return [];
  },
  approveLeave: async (id: string) => {
    // Replace with: return await axios.patch(`/api/leave/requests/${id}/approve`)
    return { success: true };
  },
  rejectLeave: async (id: string, reason: string) => {
    // Replace with: return await axios.patch(`/api/leave/requests/${id}/reject`, { reason })
    return { success: true };
  },
  getRecords: async () => {
    // Replace with: return await axios.get('/api/leave/records')
    return { history: [], current: [], upcoming: [] };
  },
  getLeaveHistory: async (employeeId?: string) => {
    // Replace with: return await axios.get('/api/leave/history', { params: { employeeId } })
    return [];
  },
  getCurrentLeave: async () => {
    // Replace with: return await axios.get('/api/leave/current')
    return [];
  },
  getUpcomingLeave: async () => {
    // Replace with: return await axios.get('/api/leave/upcoming')
    return [];
  },
  getLeaveDetails: async (id: string) => {
    // Replace with: return await axios.get(`/api/leave/${id}`)
    return null;
  },
  exportRecords: async (format: string) => {
    // Replace with: return await axios.get(`/api/leave/export/${format}`)
    return { success: true };
  }
};

export default function Leave() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [records, setRecords] = useState({ history: [], current: [], upcoming: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requestStatus, setRequestStatus] = useState('pending');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchAllData();
  }, [requestStatus]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [requestsData, recordsData] = await Promise.all([
        leaveAPI.getRequests(requestStatus),
        leaveAPI.getRecords()
      ]);
      setRequests(requestsData);
      setRecords(recordsData);
      setError('');
    } catch (err) {
      setError('Failed to load leave data');
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

  const handleApproveLeave = async (id: string) => {
    if (confirm('Are you sure you want to approve this leave request?')) {
      try {
        await leaveAPI.approveLeave(id);
        showSuccess('Leave request approved successfully!');
        fetchAllData();
      } catch (err) {
        showError('Failed to approve leave request');
      }
    }
  };

  const handleRejectLeave = async (id: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      try {
        await leaveAPI.rejectLeave(id, reason || 'No reason provided');
        showSuccess('Leave request rejected successfully!');
        fetchAllData();
      } catch (err) {
        showError('Failed to reject leave request');
      }
    }
  };

  const handleExportRecords = async (format: string) => {
    try {
      await leaveAPI.exportRecords(format);
      showSuccess(`${format.toUpperCase()} export initiated successfully!`);
    } catch (err) {
      showError('Failed to export records');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading leave data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Leave Management</h1>
        
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'requests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Leave Requests
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'records' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Leave Records
            </button>
          </nav>
        </div>

        {activeTab === 'requests' && (
          <LeaveRequests 
            requests={requests}
            status={requestStatus}
            onStatusChange={setRequestStatus}
            onApprove={handleApproveLeave}
            onReject={handleRejectLeave}
            onRefresh={fetchAllData}
          />
        )}
        {activeTab === 'records' && (
          <LeaveRecords 
            records={records}
            onExport={handleExportRecords}
            onRefresh={fetchAllData}
          />
        )}
      </div>
    </Layout>
  );
}

function LeaveRequests({ requests, status, onStatusChange, onApprove, onReject, onRefresh }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => onStatusChange('pending')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${status === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => onStatusChange('approved')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${status === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Approved Requests
          </button>
          <button
            onClick={() => onStatusChange('rejected')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${status === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Rejected Requests
          </button>
        </div>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-sm text-gray-600">Pending Requests</p>
          <p className="text-2xl font-bold text-yellow-600">
            {requests.filter((r: any) => r.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-sm text-gray-600">Approved Requests</p>
          <p className="text-2xl font-bold text-green-600">
            {requests.filter((r: any) => r.status === 'Approved').length}
          </p>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-sm text-gray-600">Rejected Requests</p>
          <p className="text-2xl font-bold text-red-600">
            {requests.filter((r: any) => r.status === 'Rejected').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No leave requests found
                </td>
              </tr>
            ) : (
              requests.map((req: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-sm text-gray-900">{req.employee}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{req.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{req.startDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{req.endDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{req.reason || '--'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        req.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {req.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => onApprove(req.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => onReject(req.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {req.status !== 'Pending' && (
                      <span className="text-xs text-gray-500">--</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-6 py-3 bg-gray-50 border-t">
          <p className="text-sm text-gray-600">Total: {requests.length} requests</p>
        </div>
      </div>
    </div>
  );
}

function LeaveRecords({ records, onExport, onRefresh }: any) {
  const [recordTab, setRecordTab] = useState('history');

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Leave Records</h2>
        <div className="flex gap-2">
          <button 
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            🔄 Refresh
          </button>
          <button 
            onClick={() => onExport('pdf')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            PDF
          </button>
          <button 
            onClick={() => onExport('excel')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Excel
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setRecordTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm
              ${recordTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Leave History
          </button>
          <button
            onClick={() => setRecordTab('current')}
            className={`py-2 px-1 border-b-2 font-medium text-sm
              ${recordTab === 'current' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Employees Currently On Leave
          </button>
          <button
            onClick={() => setRecordTab('upcoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm
              ${recordTab === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Upcoming Leaves
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {recordTab === 'history' && (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.history?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No leave history found
                    </td>
                  </tr>
                ) : (
                  records.history?.map((record: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm text-gray-900">{record.employee}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.startDate} → {record.endDate}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium
                          ${record.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                            record.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => alert(`Viewing details for ${record.employee}'s leave`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">Total: {records.history?.length || 0} records</p>
            </div>
          </>
        )}

        {recordTab === 'current' && (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.current?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No employees currently on leave
                    </td>
                  </tr>
                ) : (
                  records.current?.map((record: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm text-gray-900">{record.employee}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.startDate} → {record.endDate}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.daysLeft} days</td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => alert(`Viewing ${record.employee}'s leave details`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">Currently on leave: {records.current?.length || 0}</p>
            </div>
          </>
        )}

        {recordTab === 'upcoming' && (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.upcoming?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No upcoming leaves scheduled
                    </td>
                  </tr>
                ) : (
                  records.upcoming?.map((record: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm text-gray-900">{record.employee}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.startDate}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.days} days</td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          onClick={() => alert(`Viewing ${record.employee}'s upcoming leave`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">Upcoming: {records.upcoming?.length || 0}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
