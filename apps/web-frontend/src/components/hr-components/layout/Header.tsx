'use client';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const [user, setUser] = useState({ name: 'Admin User' });
  const [notifications] = useState<any[]>([]);
  const [unreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      setLoading(true);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.reload();
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Welcome back, {user.name}</h2>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              aria-label="Notifications"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1.5 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>
                <div className="p-8 text-center text-gray-500">
                  <span className="text-4xl block mb-2">🔕</span>
                  <p className="font-medium">No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Help
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Logging out...
              </>
            ) : (
              'Logout'
            )}
          </button>
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Help & Support</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                aria-label="Close help"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">📚 Quick Start Guide</h3>
                <ul className="text-sm text-blue-700 space-y-1.5">
                  <li>• <strong>Dashboard</strong> - View HR summary and quick actions</li>
                  <li>• <strong>Employees</strong> - Manage employee records</li>
                  <li>• <strong>Attendance</strong> - Track daily attendance</li>
                  <li>• <strong>Leave</strong> - Handle leave requests</li>
                  <li>• <strong>Shifts</strong> - Monitor shift schedules</li>
                  <li>• <strong>Payroll</strong> - Process payroll and generate payslips</li>
                  <li>• <strong>Reports</strong> - Generate HR reports</li>
                  <li>• <strong>Settings</strong> - Configure your preferences</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="font-semibold text-green-800 mb-2">📞 Need Help?</h3>
                <p className="text-sm text-green-700">
                  Contact support at <strong className="text-green-800">support@citycare.com</strong>
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Call us at <strong className="text-green-800">+254 712 345 678</strong>
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-semibold text-purple-800 mb-2">💡 Quick Tips</h3>
                <ul className="text-sm text-purple-700 space-y-1.5">
                  <li>• Use the <strong>notification bell</strong> to stay updated</li>
                  <li>• <strong>Quick action</strong> buttons for common tasks</li>
                  <li>• Generate <strong>reports</strong> for data analysis</li>
                  <li>• Customize your <strong>preferences</strong> in settings</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="font-semibold text-red-800 mb-2">🐛 Report a Problem</h3>
                <p className="text-sm text-red-700">
                  Found a bug or issue? Report it to the IT team.
                </p>
                <button
                  onClick={() => {
                    window.location.href = 'mailto:it-support@citycare.com?subject=HR Portal Issue';
                    setShowHelpModal(false);
                  }}
                  className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Report Issue
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
