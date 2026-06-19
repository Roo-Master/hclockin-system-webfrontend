"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, Activity, AlertCircle,
  RefreshCw, Download, ChevronLeft, Calendar,
  Building2, Clock, UserX
} from 'lucide-react';
import { useApi } from '../../../../../hooks/hr-hooks/useApi';
import { attendanceService } from '../../../../../services/hr-services/attendanceService';

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

const AnalyticsCard = ({ title, value, change, icon, color }: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value || '--'}</p>
        {change && (
          <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
  </div>
);

export default function AttendanceAnalytics() {
  const router = useRouter();
  const [period, setPeriod] = useState('month');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  
  const { data: stats, loading, error, refetch } = useApi(
    () => attendanceService.getAttendanceStats()
  );
  
  const { data: trend, loading: trendLoading } = useApi(
    () => attendanceService.getAttendanceTrend(30)
  );

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefresh = async () => {
    await refetch();
    showToast('✅ Analytics refreshed!', 'success');
  };

  const handleExport = () => {
    showToast('📊 Exporting analytics report...', 'info');
  };

  if ((loading || trendLoading) && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-xl border border-gray-200 p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900 mt-4">Failed to Load Analytics</h3>
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
          <button onClick={() => router.push('/attendance')} className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2 mb-2 text-sm">
            <ChevronLeft className="w-4 h-4" /> Back to Attendance
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Analytics</h1>
          <p className="text-gray-500 mt-1">Analyze attendance trends, patterns, and correlations</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button onClick={handleRefresh} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <AnalyticsCard 
          title="Attendance Rate" 
          value={stats?.attendanceRate ? `${stats.attendanceRate}%` : '--'}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          color="bg-green-50"
        />
        <AnalyticsCard 
          title="Absenteeism Rate" 
          value={stats?.absentToday && stats?.totalEmployees ? `${((stats.absentToday / stats.totalEmployees) * 100).toFixed(1)}%` : '--'}
          icon={<UserX className="w-5 h-5 text-red-600" />}
          color="bg-red-50"
        />
        <AnalyticsCard 
          title="Avg Late Arrivals" 
          value={stats?.lateToday || '--'}
          icon={<Clock className="w-5 h-5 text-yellow-600" />}
          color="bg-yellow-50"
        />
        <AnalyticsCard 
          title="Total Overtime (hrs)" 
          value="--"
          icon={<Activity className="w-5 h-5 text-purple-600" />}
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Attendance Trends</h3>
          {trend && trend.length > 0 ? (
            <div className="space-y-4">
              {trend.slice(0, 7).map((day: any, i: number) => {
                const total = day.present + day.absent + day.late + day.onLeave || 1;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 w-20">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 flex gap-1 h-4 rounded overflow-hidden">
                      <div className="bg-green-500 h-full" style={{ width: `${(day.present / total) * 100}%` }} />
                      <div className="bg-yellow-500 h-full" style={{ width: `${(day.onLeave / total) * 100}%` }} />
                      <div className="bg-red-500 h-full" style={{ width: `${(day.absent / total) * 100}%` }} />
                      <div className="bg-orange-500 h-full" style={{ width: `${(day.late / total) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No trend data available</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Department Analysis</h3>
          <p className="text-gray-500 text-center py-8">Department analysis data will appear here</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Absenteeism Analysis</h3>
          <p className="text-gray-500 text-center py-8">Absenteeism analysis data will appear here</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Performance Correlation</h3>
          <p className="text-gray-500 text-center py-8">Performance correlation data will appear here</p>
        </div>
      </div>
    </div>
  );
}
