import Layout from '@/components/hr-components/layout/Layout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// API service placeholders - replace with actual API calls
const dashboardAPI = {
  getStats: async () => {
    // Replace with: return await axios.get('/api/dashboard/stats')
    return {
      totalEmployees: 0,
      presentToday: 0,
      absentToday: 0,
      lateEmployees: 0,
      pendingLeaveRequests: 0,
      payrollStatus: 0
    };
  },
  getRecentActivities: async () => {
    // Replace with: return await axios.get('/api/dashboard/recent-activities')
    return [];
  }
};

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateEmployees: 0,
    pendingLeaveRequests: 0,
    payrollStatus: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivities()
      ]);
      setStats(statsData);
      setRecentActivities(activitiesData);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <Layout onRefresh={handleRefresh}>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onRefresh={handleRefresh}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">HR Dashboard</h1>
          <div className="flex items-center gap-2">
            {refreshing && (
              <span className="text-sm text-blue-500">Refreshing...</span>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Total Employees</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Present Today</p>
            <p className="text-2xl font-bold text-green-600">{stats.presentToday}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Absent Today</p>
            <p className="text-2xl font-bold text-red-600">{stats.absentToday}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">Late Employees</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.lateEmployees}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-sm text-gray-500">Pending Leave Requests</p>
            <p className="text-2xl font-bold text-purple-600">{stats.pendingLeaveRequests}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <p className="text-sm text-gray-500">Payroll Status</p>
            <p className="text-2xl font-bold text-indigo-600">${stats.payrollStatus.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium text-gray-700 mb-2">Attendance Trends</h3>
            <div className="h-32 flex items-center justify-center text-gray-400 border-2 border-dashed rounded">
              <div className="text-center">
                <p className="font-medium">No Data</p>
                <p className="text-sm">Connect to API</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium text-gray-700 mb-2">Leave Trends</h3>
            <div className="h-32 flex items-center justify-center text-gray-400 border-2 border-dashed rounded">
              <div className="text-center">
                <p className="font-medium">No Data</p>
                <p className="text-sm">Connect to API</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium text-gray-700 mb-2">Overtime Trends</h3>
            <div className="h-32 flex items-center justify-center text-gray-400 border-2 border-dashed rounded">
              <div className="text-center">
                <p className="font-medium">No Data</p>
                <p className="text-sm">Connect to API</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <button 
            onClick={() => router.push('/employees')}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Employee
          </button>
          <button 
            onClick={() => router.push('/leave')}
            className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Approve Leave
          </button>
          <button 
            onClick={() => router.push('/attendance')}
            className="bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            View Attendance
          </button>
          <button 
            onClick={() => router.push('/payroll')}
            className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Generate Payroll
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium text-gray-700 mb-4">Recent Activities</h3>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent activities
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity: any, idx) => (
                <div key={idx} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium text-gray-800">{activity.action}</p>
                    <p className="text-sm text-gray-500">by {activity.user}</p>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
