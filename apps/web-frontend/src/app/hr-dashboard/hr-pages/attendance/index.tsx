import Layout from '@/components/hr-components/layout/Layout';
import { useState, useEffect } from 'react';

// API service placeholders - replace with actual API calls
const attendanceAPI = {
  getDailyStats: async () => {
    // Replace with: return await axios.get('/api/attendance/daily-stats')
    return {
      present: 0,
      absent: 0,
      late: 0,
      earlyDepartures: 0
    };
  },
  getRecords: async (date?: string) => {
    // Replace with: return await axios.get('/api/attendance/records', { params: { date } })
    return [];
  },
  getCorrections: async () => {
    // Replace with: return await axios.get('/api/attendance/corrections')
    return [];
  },
  approveCorrection: async (id: string) => {
    // Replace with: return await axios.patch(`/api/attendance/corrections/${id}/approve`)
    return { success: true };
  },
  rejectCorrection: async (id: string) => {
    // Replace with: return await axios.patch(`/api/attendance/corrections/${id}/reject`)
    return { success: true };
  },
  getOvertime: async () => {
    // Replace with: return await axios.get('/api/attendance/overtime')
    return { total: 0, pending: 0, approved: 0, records: [] };
  },
  approveOvertime: async (id: string) => {
    // Replace with: return await axios.patch(`/api/attendance/overtime/${id}/approve`)
    return { success: true };
  },
  getRealTimeStatus: async () => {
    // Replace with: return await axios.get('/api/attendance/real-time')
    return { onDuty: 0, total: 0, departments: [] };
  },
  exportRecords: async (format: string, date?: string) => {
    // Replace with: return await axios.get(`/api/attendance/export/${format}`, { params: { date } })
    return { success: true };
  },
  getAttendanceTrends: async () => {
    // Replace with: return await axios.get('/api/attendance/trends')
    return { labels: [], data: [] };
  }
};

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('daily');
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, earlyDepartures: 0 });
  const [records, setRecords] = useState<any[]>([]);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [overtimeData, setOvertimeData] = useState({ total: 0, pending: 0, approved: 0, records: [] });
  const [realTimeData, setRealTimeData] = useState({ onDuty: 0, total: 0, departments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAllData();
  }, [selectedDate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsData, recordsData, correctionsData, overtimeData, realTimeData] = await Promise.all([
        attendanceAPI.getDailyStats(),
        attendanceAPI.getRecords(selectedDate),
        attendanceAPI.getCorrections(),
        attendanceAPI.getOvertime(),
        attendanceAPI.getRealTimeStatus()
      ]);
      setStats(statsData);
      setRecords(recordsData);
      setCorrections(correctionsData);
      setOvertimeData(overtimeData);
      setRealTimeData(realTimeData);
      setError('');
    } catch (err) {
      setError('Failed to load attendance data');
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

  const handleApproveCorrection = async (id: string) => {
    if (confirm('Approve this correction request?')) {
      try {
        await attendanceAPI.approveCorrection(id);
        showSuccess('Correction approved successfully!');
        fetchAllData();
      } catch (err) {
        showError('Failed to approve correction');
      }
    }
  };

  const handleRejectCorrection = async (id: string) => {
    if (confirm('Reject this correction request?')) {
      try {
        await attendanceAPI.rejectCorrection(id);
        showSuccess('Correction rejected successfully!');
        fetchAllData();
      } catch (err) {
        showError('Failed to reject correction');
      }
    }
  };

  const handleApproveOvertime = async (id: string) => {
    if (confirm('Approve this overtime request?')) {
      try {
        await attendanceAPI.approveOvertime(id);
        showSuccess('Overtime approved successfully!');
        fetchAllData();
      } catch (err) {
        showError('Failed to approve overtime');
      }
    }
  };

  const handleExportRecords = async (format: string) => {
    try {
      await attendanceAPI.exportRecords(format, selectedDate);
      showSuccess(`${format.toUpperCase()} export initiated successfully!`);
    } catch (err) {
      showError('Failed to export records');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading attendance data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance</h1>
        
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
            {['daily', 'records', 'corrections', 'overtime', 'monitoring'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize
                  ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'daily' ? 'Daily Attendance' : 
                 tab === 'records' ? 'Attendance Records' :
                 tab === 'corrections' ? 'Corrections' :
                 tab === 'overtime' ? 'Overtime' : 'Monitoring'}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'daily' && (
          <DailyAttendance 
            stats={stats} 
            onRefresh={fetchAllData}
            date={selectedDate}
            onDateChange={setSelectedDate}
            onExport={handleExportRecords}
          />
        )}
        {activeTab === 'records' && (
          <AttendanceRecords 
            records={records}
            date={selectedDate}
            onDateChange={setSelectedDate}
            onExport={handleExportRecords}
            onRefresh={fetchAllData}
          />
        )}
        {activeTab === 'corrections' && (
          <AttendanceCorrections 
            corrections={corrections}
            onApprove={handleApproveCorrection}
            onReject={handleRejectCorrection}
            onRefresh={fetchAllData}
          />
        )}
        {activeTab === 'overtime' && (
          <OvertimeManagement 
            data={overtimeData}
            onApprove={handleApproveOvertime}
            onRefresh={fetchAllData}
          />
        )}
        {activeTab === 'monitoring' && (
          <AttendanceMonitoring 
            data={realTimeData}
            onRefresh={fetchAllData}
          />
        )}
      </div>
    </Layout>
  );
}

function DailyAttendance({ stats, onRefresh, date, onDateChange, onExport }: any) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {formatDate(date)}
        </h2>
        <div className="flex gap-2">
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
          <button 
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-sm text-gray-600">Present Staff</p>
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          <button 
            onClick={() => alert(`Viewing ${stats.present} present staff`)}
            className="text-xs text-green-600 hover:text-green-800 mt-1"
          >
            View details →
          </button>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-sm text-gray-600">Absent Staff</p>
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          <button 
            onClick={() => alert(`Viewing ${stats.absent} absent staff`)}
            className="text-xs text-red-600 hover:text-red-800 mt-1"
          >
            View details →
          </button>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-sm text-gray-600">Late Staff</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
          <button 
            onClick={() => alert(`Viewing ${stats.late} late staff`)}
            className="text-xs text-yellow-600 hover:text-yellow-800 mt-1"
          >
            View details →
          </button>
        </div>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-gray-600">Early Departures</p>
          <p className="text-2xl font-bold text-blue-600">{stats.earlyDepartures}</p>
          <button 
            onClick={() => alert(`Viewing ${stats.earlyDepartures} early departures`)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            View details →
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-700">Attendance Summary</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => onExport('pdf')}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Export PDF
            </button>
            <button 
              onClick={() => onExport('excel')}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Export Excel
            </button>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
          <div className="text-center">
            <p className="font-medium">Attendance Chart</p>
            <p className="text-sm">Visual representation of attendance data</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceRecords({ records, date, onDateChange, onExport, onRefresh }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Attendance Records</h2>
        <div className="flex gap-2">
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
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
          <button 
            onClick={() => onExport('csv')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock In Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock Out Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Working Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No attendance records found for this date
                </td>
              </tr>
            ) : (
              records.map((record: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.employee}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.clockIn || '--'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.clockOut || '--'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.hours || '--'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 
                        record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 
                        record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {record.status || '--'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-6 py-3 bg-gray-50 border-t">
          <p className="text-sm text-gray-600">Total Records: {records.length}</p>
        </div>
      </div>
    </div>
  );
}

function AttendanceCorrections({ corrections, onApprove, onReject, onRefresh }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Attendance Corrections</h2>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {corrections.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No correction requests pending
                </td>
              </tr>
            ) : (
              corrections.map((corr: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-sm text-gray-900">{corr.employee}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {corr.type === 'clockout' ? '🚫 Missing Clock-Out' : '✏️ Incorrect Time Entry'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{corr.date}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${corr.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        corr.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {corr.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {corr.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => onApprove(corr.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => onReject(corr.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {corr.status !== 'Pending' && (
                      <span className="text-sm text-gray-500">No actions available</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-6 py-3 bg-gray-50 border-t">
          <p className="text-sm text-gray-600">Pending: {corrections.filter((c: any) => c.status === 'Pending').length}</p>
        </div>
      </div>
    </div>
  );
}

function OvertimeManagement({ data, onApprove, onRefresh }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Overtime Management</h2>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Overtime Hours</p>
          <p className="text-2xl font-bold text-gray-800">{data.total || 0} hrs</p>
          <button 
            onClick={() => alert(`Total overtime: ${data.total || 0} hours`)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            View details →
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600">{data.pending || 0} hrs</p>
          <button 
            onClick={() => alert(`${data.pending || 0} hours pending approval`)}
            className="text-xs text-yellow-600 hover:text-yellow-800 mt-1"
          >
            Review pending →
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Approved Overtime</p>
          <p className="text-2xl font-bold text-green-600">{data.approved || 0} hrs</p>
          <button 
            onClick={() => alert(`${data.approved || 0} hours approved`)}
            className="text-xs text-green-600 hover:text-green-800 mt-1"
          >
            View approved →
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.records?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No overtime records found
                </td>
              </tr>
            ) : (
              data.records?.map((record: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.employee}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.hours} hrs</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        record.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {record.status === 'Pending' && (
                      <button 
                        onClick={() => onApprove(record.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                    )}
                    {record.status !== 'Pending' && (
                      <span className="text-sm text-gray-500">--</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceMonitoring({ data, onRefresh }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Real-Time Attendance Monitoring</h2>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <h3 className="font-medium text-green-800">Staff Currently On Duty</h3>
          <p className="text-3xl font-bold text-green-600">{data.onDuty || 0}</p>
          <p className="text-sm text-gray-600">of {data.total || 0} total staff</p>
          <button 
            onClick={() => alert(`Currently on duty: ${data.onDuty || 0} staff`)}
            className="text-xs text-green-600 hover:text-green-800 mt-1"
          >
            View all on duty →
          </button>
        </div>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h3 className="font-medium text-blue-800">Departments Active</h3>
          <p className="text-3xl font-bold text-blue-600">{data.departments?.length || 0}</p>
          <p className="text-sm text-gray-600">departments with active staff</p>
          <button 
            onClick={() => alert(`${data.departments?.length || 0} departments active`)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            View all departments →
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">On Duty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Staff</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coverage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.departments?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No real-time data available
                </td>
              </tr>
            ) : (
              data.departments?.map((dept: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dept.onDuty}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dept.total}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${dept.coverage >= 75 ? 'bg-green-100 text-green-800' : 
                        dept.coverage >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {dept.coverage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => alert(`Viewing ${dept.name} department details`)}
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
      </div>
    </div>
  );
}
