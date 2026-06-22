import React from 'react';

export const MrrChart: React.FC<{ data?: any; isLoading?: boolean }> = ({ 
  data, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Monthly Recurring Revenue
      </h3>
      <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 rounded">
        <div className="text-center">
          <p className="text-sm">MRR Chart</p>
          <p className="text-xs mt-1">Connect your chart library (e.g., Recharts, Chart.js)</p>
        </div>
      </div>
    </div>
  );
};

export const TenantStatusBreakdown: React.FC<{ data?: any; isLoading?: boolean }> = ({ 
  data, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Tenant Status Breakdown
      </h3>
      <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 rounded">
        <div className="text-center">
          <p className="text-sm">Status Breakdown Chart</p>
          <p className="text-xs mt-1">Connect your chart library (e.g., Recharts, Chart.js)</p>
        </div>
      </div>
    </div>
  );
};
