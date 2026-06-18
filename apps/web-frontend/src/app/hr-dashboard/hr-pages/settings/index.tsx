import Layout from '@/components/hr-components/layout/Layout';
import { useState, useEffect } from 'react';

// API service placeholders - replace with actual API calls
const settingsAPI = {
  // Profile Settings
  getProfile: async () => {
    // Replace with: return await axios.get('/api/settings/profile')
    return {
      name: '',
      email: '',
      phone: '',
      profilePicture: '',
      role: 'HR Manager'
    };
  },
  updateProfile: async (data: any) => {
    // Replace with: return await axios.put('/api/settings/profile', data)
    return { success: true };
  },
  uploadProfilePicture: async (file: File) => {
    // Replace with: 
    // const formData = new FormData();
    // formData.append('profilePicture', file);
    // return await axios.post('/api/settings/profile/picture', formData)
    return { success: true, url: '/profile.jpg' };
  },
  
  // Security Settings
  changePassword: async (data: any) => {
    // Replace with: return await axios.post('/api/settings/change-password', data)
    return { success: true };
  },
  getTwoFactorStatus: async () => {
    // Replace with: return await axios.get('/api/settings/2fa/status')
    return { enabled: false, phone: '' };
  },
  enableTwoFactor: async (phone: string) => {
    // Replace with: return await axios.post('/api/settings/2fa/enable', { phone })
    return { success: true, qrCode: '' };
  },
  disableTwoFactor: async () => {
    // Replace with: return await axios.post('/api/settings/2fa/disable')
    return { success: true };
  },
  verifyTwoFactor: async (code: string) => {
    // Replace with: return await axios.post('/api/settings/2fa/verify', { code })
    return { success: true };
  },
  
  // Notification Settings
  getNotifications: async () => {
    // Replace with: return await axios.get('/api/settings/notifications')
    return {
      leaveAlerts: true,
      attendanceAlerts: true,
      payrollAlerts: false
    };
  },
  updateNotifications: async (data: any) => {
    // Replace with: return await axios.put('/api/settings/notifications', data)
    return { success: true };
  },
  
  // Preferences
  getPreferences: async () => {
    // Replace with: return await axios.get('/api/settings/preferences')
    return {
      theme: 'light',
      language: 'en',
      timeZone: 'Africa/Nairobi'
    };
  },
  updatePreferences: async (data: any) => {
    // Replace with: return await axios.put('/api/settings/preferences', data)
    return { success: true };
  },
  
  // Audit Logs
  getAuditLogs: async () => {
    // Replace with: return await axios.get('/api/settings/audit-logs')
    return {
      activities: [],
      loginHistory: []
    };
  },
  getRecentActivities: async () => {
    // Replace with: return await axios.get('/api/settings/recent-activities')
    return [];
  },
  getLoginHistory: async () => {
    // Replace with: return await axios.get('/api/settings/login-history')
    return [];
  }
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState<any>({});
  const [notificationsData, setNotificationsData] = useState<any>({});
  const [preferencesData, setPreferencesData] = useState<any>({});
  const [auditData, setAuditData] = useState<any>({ activities: [], loginHistory: [] });
  const [twoFactorData, setTwoFactorData] = useState<any>({ enabled: false, phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [profile, notifications, preferences, audit, twoFactor] = await Promise.all([
        settingsAPI.getProfile(),
        settingsAPI.getNotifications(),
        settingsAPI.getPreferences(),
        settingsAPI.getAuditLogs(),
        settingsAPI.getTwoFactorStatus()
      ]);
      setProfileData(profile);
      setNotificationsData(notifications);
      setPreferencesData(preferences);
      setAuditData(audit);
      setTwoFactorData(twoFactor);
      setError('');
    } catch (err) {
      setError('Failed to load settings');
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

  // Profile Handlers
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsAPI.updateProfile(profileData);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      showError('Failed to update profile');
    }
  };

  const handleUploadProfilePicture = async (file: File) => {
    try {
      const result = await settingsAPI.uploadProfilePicture(file);
      setProfileData({ ...profileData, profilePicture: result.url });
      showSuccess('Profile picture updated!');
    } catch (err) {
      showError('Failed to upload profile picture');
    }
  };

  // Security Handlers
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const currentPassword = (form.querySelector('#currentPassword') as HTMLInputElement).value;
    const newPassword = (form.querySelector('#newPassword') as HTMLInputElement).value;
    const confirmPassword = (form.querySelector('#confirmPassword') as HTMLInputElement).value;

    if (newPassword !== confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    try {
      await settingsAPI.changePassword({ currentPassword, newPassword });
      showSuccess('Password changed successfully!');
      (form.querySelector('#currentPassword') as HTMLInputElement).value = '';
      (form.querySelector('#newPassword') as HTMLInputElement).value = '';
      (form.querySelector('#confirmPassword') as HTMLInputElement).value = '';
    } catch (err) {
      showError('Failed to change password');
    }
  };

  const handleEnableTwoFactor = async () => {
    if (!twoFactorData.phone) {
      showError('Please enter your phone number');
      return;
    }
    try {
      await settingsAPI.enableTwoFactor(twoFactorData.phone);
      showSuccess('Two-factor authentication enabled!');
      setTwoFactorData({ ...twoFactorData, enabled: true });
    } catch (err) {
      showError('Failed to enable 2FA');
    }
  };

  const handleDisableTwoFactor = async () => {
    if (confirm('Are you sure you want to disable two-factor authentication?')) {
      try {
        await settingsAPI.disableTwoFactor();
        showSuccess('Two-factor authentication disabled!');
        setTwoFactorData({ ...twoFactorData, enabled: false });
      } catch (err) {
        showError('Failed to disable 2FA');
      }
    }
  };

  // Notification Handlers
  const handleUpdateNotifications = async (key: string, value: boolean) => {
    try {
      const updated = { ...notificationsData, [key]: value };
      await settingsAPI.updateNotifications(updated);
      setNotificationsData(updated);
      showSuccess('Notification settings updated!');
    } catch (err) {
      showError('Failed to update notifications');
    }
  };

  // Preferences Handlers
  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsAPI.updatePreferences(preferencesData);
      showSuccess('Preferences updated successfully!');
      // Apply theme immediately
      if (preferencesData.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (err) {
      showError('Failed to update preferences');
    }
  };

  // Audit Log Handlers
  const handleRefreshAudit = async () => {
    try {
      const [activities, loginHistory] = await Promise.all([
        settingsAPI.getRecentActivities(),
        settingsAPI.getLoginHistory()
      ]);
      setAuditData({ activities, loginHistory });
      showSuccess('Audit logs refreshed!');
    } catch (err) {
      showError('Failed to refresh audit logs');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
        
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
            {['profile', 'security', 'notifications', 'preferences', 'audit'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize
                  ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'audit' ? 'Audit Logs' : tab}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'profile' && (
          <ProfileSettings 
            data={profileData}
            onChange={(field: string, value: any) => setProfileData({...profileData, [field]: value})}
            onSave={handleUpdateProfile}
            onUploadPicture={handleUploadProfilePicture}
          />
        )}
        {activeTab === 'security' && (
          <SecuritySettings 
            twoFactorData={twoFactorData}
            setTwoFactorData={setTwoFactorData}
            onEnable2FA={handleEnableTwoFactor}
            onDisable2FA={handleDisableTwoFactor}
            onChangePassword={handleChangePassword}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationSettings 
            data={notificationsData}
            onToggle={handleUpdateNotifications}
          />
        )}
        {activeTab === 'preferences' && (
          <PreferencesSettings 
            data={preferencesData}
            onChange={(field: string, value: any) => setPreferencesData({...preferencesData, [field]: value})}
            onSave={handleUpdatePreferences}
          />
        )}
        {activeTab === 'audit' && (
          <AuditLogs 
            data={auditData}
            onRefresh={handleRefreshAudit}
          />
        )}
      </div>
    </Layout>
  );
}

function ProfileSettings({ data, onChange, onSave, onUploadPicture }: any) {
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadPicture(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Profile Settings</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={onSave}>
        <div className="flex items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
              {data.profilePicture ? (
                <img src={data.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <span className="text-gray-400">👤</span>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                📷
              </label>
            )}
          </div>
          <div className="ml-4">
            <p className="font-medium text-gray-800">{data.name || 'HR Manager'}</p>
            <p className="text-sm text-gray-500">{data.role || 'HR Manager'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500
                ${!isEditing ? 'bg-gray-50' : ''}`}
              value={data.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500
                ${!isEditing ? 'bg-gray-50' : ''}`}
              value={data.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500
                ${!isEditing ? 'bg-gray-50' : ''}`}
              value={data.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        {isEditing && (
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        )}
      </form>
    </div>
  );
}

function SecuritySettings({ twoFactorData, setTwoFactorData, onEnable2FA, onDisable2FA, onChangePassword }: any) {
  const [show2FAModal, setShow2FAModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h2>
        <form onSubmit={onChangePassword}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Two-Factor Authentication</h2>
          <span className={`px-3 py-1 rounded text-sm font-medium
            ${twoFactorData.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {twoFactorData.enabled ? '✅ Enabled' : '❌ Disabled'}
          </span>
        </div>

        {!twoFactorData.enabled ? (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number for 2FA"
                value={twoFactorData.phone || ''}
                onChange={(e) => setTwoFactorData({...twoFactorData, phone: e.target.value})}
              />
            </div>
            <button
              onClick={onEnable2FA}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Enable 2FA
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">Two-factor authentication is enabled for {twoFactorData.phone}</p>
            <button
              onClick={onDisable2FA}
              className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Disable 2FA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationSettings({ data, onToggle }: any) {
  const notifications = [
    { key: 'leaveAlerts', label: 'Leave Request Alerts', description: 'Get notified when leave requests are submitted' },
    { key: 'attendanceAlerts', label: 'Attendance Alerts', description: 'Get notified about attendance issues' },
    { key: 'payrollAlerts', label: 'Payroll Alerts', description: 'Get notified about payroll processing' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h2>
      <div className="space-y-4">
        {notifications.map((notif) => (
          <div key={notif.key} className="flex justify-between items-center border-b pb-4">
            <div>
              <p className="font-medium text-gray-700">{notif.label}</p>
              <p className="text-sm text-gray-500">{notif.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={data[notif.key] || false}
                onChange={(e) => onToggle(notif.key, e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreferencesSettings({ data, onChange, onSave }: any) {
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'sw', label: 'Swahili' },
    { value: 'fr', label: 'French' }
  ];

  const timeZones = [
    'Africa/Nairobi (UTC+3)',
    'UTC',
    'America/New_York (UTC-5)',
    'Europe/London (UTC+0)',
    'Asia/Dubai (UTC+4)'
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h2>
      <form onSubmit={onSave}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={data.theme || 'light'}
              onChange={(e) => onChange('theme', e.target.value)}
            >
              <option value="light">☀️ Light</option>
              <option value="dark">🌙 Dark</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={data.language || 'en'}
              onChange={(e) => onChange('language', e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={data.timeZone || 'Africa/Nairobi (UTC+3)'}
              onChange={(e) => onChange('timeZone', e.target.value)}
            >
              {timeZones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Preferences
        </button>
      </form>
    </div>
  );
}

function AuditLogs({ data, onRefresh }: any) {
  const [auditTab, setAuditTab] = useState('activities');

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Audit Logs</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setAuditTab('activities')}
            className={`py-2 px-1 border-b-2 font-medium text-sm
              ${auditTab === 'activities' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            Recent HR Activities
          </button>
          <button
            onClick={() => setAuditTab('login')}
            className={`py-2 px-1 border-b-2 font-medium text-sm
              ${auditTab === 'login' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            Login History
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {auditTab === 'activities' && (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.activities?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No recent activities found
                    </td>
                  </tr>
                ) : (
                  data.activities?.map((activity: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm text-gray-900">{activity.action}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{activity.user}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{getTimeAgo(activity.timestamp)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{activity.ip || '--'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">Total Activities: {data.activities?.length || 0}</p>
            </div>
          </>
        )}

        {auditTab === 'login' && (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.loginHistory?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No login history found
                    </td>
                  </tr>
                ) : (
                  data.loginHistory?.map((login: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm text-gray-900">{login.user}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(login.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{login.ip}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium
                          ${login.status === 'Success' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {login.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">Total Logins: {data.loginHistory?.length || 0}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
