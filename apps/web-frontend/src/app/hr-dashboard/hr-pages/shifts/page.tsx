"use client";
import { useState, useEffect } from 'react';

// API service placeholders - replace with actual API calls
const shiftAPI = {
  getSchedule: async (view: string, date?: string) => {
    // Replace with: return await axios.get('/api/shifts/schedule', { params: { view, date } })
    return [];
  },
  getCoverage: async () => {
    // Replace with: return await axios.get('/api/shifts/coverage')
    return {
      total: 0,
      departments: [],
      understaffed: 0,
      fullyStaffed: 0
    };
  },
  getReports: async () => {
    // Replace with: return await axios.get('/api/shifts/reports')
    return {
      totalShifts: 0,
      staffOnDuty: 0,
      morning: 0,
      evening: 0,
      night: 0,
      coverageRate: 0
    };
  },
  exportSchedule: async (format: string, view: string) => {
    // Replace with: return await axios.get(`/api/shifts/export/${format}`, { params: { view } })
    return { success: true };
  }
};

export default function Shifts() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [coverageData, setCoverageData] = useState<any>({ departments: [] });
  const [reportsData, setReportsData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scheduleView, setScheduleView] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [scheduleView, selectedDate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [schedule, coverage, reports] = await Promise.all([
        shiftAPI.getSchedule(scheduleView, selectedDate),
        shiftAPI.getCoverage(),
        shiftAPI.getReports()
      ]);
      setScheduleData(schedule);
      setCoverageData(coverage);
      setReportsData(reports);
      setError('');
    } catch (err) {
      setError('Failed to load shift data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleExport = async (format: string) => {
    try {
      await shiftAPI.exportSchedule(format, scheduleView);
      showSuccess(`${format.toUpperCase()} export initiated successfully!`);
    } catch (err) {
      setError('Failed to export schedule');
    }
  };

  if (loading && !refreshing) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading shift data...</div>
        </div>
    );
  }

  return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Shift Monitoring</h1>
          {refreshing && (
            <span className="text-sm text-blue-500">Refreshing...</span>
          )}
        </div>
        
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
              onClick={() => setActiveTab('schedule')}
              className={`py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'schedule' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Shift Schedule
            </button>
            <button
              onClick={() => setActiveTab('coverage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'coverage' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Coverage Monitoring
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'reports' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Reports
            </button>
          </nav>
        </div>

        {activeTab === 'schedule' && (
          <ShiftSchedule 
            data={scheduleData}
            view={scheduleView}
            onViewChange={setScheduleView}
            date={selectedDate}
            onDateChange={setSelectedDate}
            onRefresh={handleRefresh}
            onExport={handleExport}
          />
        )}
        {activeTab === 'coverage' && (
          <CoverageMonitoring 
            data={coverageData}
            onRefresh={handleRefresh}
          />
        )}
        {activeTab === 'reports' && (
          <ShiftReports 
            data={reportsData}
            onRefresh={handleRefresh}
            onExport={handleExport}
          />
        )}
      </div>
  );
}

function ShiftSchedule({ data, view, onViewChange, date, onDateChange, onRefresh, onExport }: any) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => onViewChange('daily')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${view === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Daily
          </button>
          <button
            onClick={() => onViewChange('weekly')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${view === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Weekly
          </button>
          <button
            onClick={() => onViewChange('monthly')}
            className={`px-4 py-2 rounded-lg font-medium text-sm
              ${view === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Monthly
          </button>
        </div>
        <div className="flex gap-2 items-center">
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
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {formatDate(date)}
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No shift schedule found for this {view} view
                </td>
              </tr>
            ) : (
              data.map((shift: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-sm text-gray-900">{shift.employee}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{shift.department}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${shift.shift === 'Morning' ? 'bg-yellow-100 text-yellow-800' : 
                        shift.shift === 'Evening' ? 'bg-blue-100 text-blue-800' : 
                        shift.shift === 'Night' ? 'bg-gray-100 text-gray-800' :
                        'bg-purple-100 text-purple-800'}`}>
                      {shift.shift}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{shift.time}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${shift.status === 'On Duty' ? 'bg-green-100 text-green-800' : 
                        shift.status === 'Off Duty' ? 'bg-gray-100 text-gray-800' : 
                        shift.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {shift.status || 'Scheduled'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-6 py-3 bg-gray-50 border-t">
          <p className="text-sm text-gray-600">Total Shifts: {data.length}</p>
        </div>
      </div>
    </div>
  );
}

function CoverageMonitoring({ data, onRefresh }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Coverage Monitoring</h2>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Staff</p>
          <p className="text-2xl font-bold text-gray-800">{data.total || 0}</p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-sm text-gray-600">Fully Staffed Shifts</p>
          <p className="text-2xl font-bold text-green-600">{data.fullyStaffed || 0}</p>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-sm text-gray-600">Understaffed Shifts</p>
          <p className="text-2xl font-bold text-red-600">{data.understaffed || 0}</p>
        </div>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
          <p className="text-sm text-gray-600">Departments Active</p>
          <p className="text-2xl font-bold text-purple-600">{data.departments?.length || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">On Duty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Missing</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coverage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.departments?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No coverage data available
                </td>
              </tr>
            ) : (
              data.departments?.map((dept: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dept.scheduled}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dept.onDuty}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dept.missing || 0}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${dept.coverage >= 90 ? 'bg-green-100 text-green-800' : 
                        dept.coverage >= 75 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {dept.coverage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${dept.coverage >= 90 ? 'bg-green-100 text-green-800' : 
                        dept.coverage >= 75 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {dept.coverage >= 90 ? '✅ Fully Staffed' : 
                       dept.coverage >= 75 ? '⚠️ Partially Staffed' : 
                       '🔴 Understaffed'}
                    </span>
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

function ShiftReports({ data, onRefresh, onExport }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Shift Reports</h2>
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
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Shifts</p>
          <p className="text-2xl font-bold text-gray-800">{data.totalShifts || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Staff on Duty Today</p>
          <p className="text-2xl font-bold text-green-600">{data.staffOnDuty || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Shift Coverage Rate</p>
          <p className="text-2xl font-bold text-purple-600">{data.coverageRate || 0}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Shift Distribution</p>
          <p className="text-xs text-gray-600 mt-1">
            Morning: {data.morning || 0}
          </p>
          <p className="text-xs text-gray-600">
            Evening: {data.evening || 0}
          </p>
          <p className="text-xs text-gray-600">
            Night: {data.night || 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-700">Shift Distribution Chart</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Weekly</button>
            <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Monthly</button>
          </div>
        </div>
        
        <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
          <div className="text-center">
            <p className="font-medium">Shift Distribution Chart</p>
            <p className="text-sm">Visual representation of shift data</p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          <div className="text-center p-2 bg-yellow-50 rounded">
            <p className="text-gray-500">Morning</p>
            <p className="font-bold text-gray-800">{data.morning || 0}</p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <p className="text-gray-500">Evening</p>
            <p className="font-bold text-gray-800">{data.evening || 0}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-gray-500">Night</p>
            <p className="font-bold text-gray-800">{data.night || 0}</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <p className="text-gray-500">Coverage</p>
            <p className="font-bold text-green-600">{data.coverageRate || 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
