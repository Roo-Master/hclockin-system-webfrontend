import React from 'react';
import NotificationBell from '../../../components/hr-components/layout/NotificationBell';

export default function TestNotification() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Notification Bell Test</h1>
        <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
          <NotificationBell />
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Click the bell icon above to see notifications
        </p>
      </div>
    </div>
  );
}
