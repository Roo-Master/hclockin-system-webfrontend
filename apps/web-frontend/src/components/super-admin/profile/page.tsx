'use client';

import { useState } from 'react';
import { superAdminApi } from '@/lib/(super-admin)/super-admin/api';

const TABS = ['Account', 'Security', 'Activity'] as const;
type Tab = typeof TABS[number];

const ACTIVITY = [
  { action: 'Logged in', time: '2 minutes ago', icon: '🔐' },
  { action: 'Suspended tenant Acme Corp', time: '1 hour ago', icon: '🏥' },
  { action: 'Updated feature flags for TechCo', time: '3 hours ago', icon: '🚩' },
  { action: 'Created new tenant MediCare', time: 'Yesterday, 14:32', icon: '➕' },
  { action: 'Exported billing report', time: 'Yesterday, 11:05', icon: '📄' },
  { action: 'Reactivated tenant HealthPlus', time: '2 days ago', icon: '✅' },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Account');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: 'Super Admin',
    email: 'super_admin@chronos.com',
    timezone: 'Africa/Nairobi',
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800)); // TODO: wire to API
    setIsSaving(false);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-full bg-gray-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Header card */}
        <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
          {/* Accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />
          <div className="flex items-center gap-5 px-6 py-6">
            <div className="relative flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold shadow-lg">
                SA
              </div>
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-gray-900 bg-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold truncate">{form.name}</h1>
                <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-400">
                  Super Admin
                </span>
              </div>
              <p className="mt-0.5 text-sm text-gray-400">{form.email}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-gray-500">Last login</p>
              <p className="text-sm text-gray-300">2 minutes ago</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 border-t border-gray-800">
            {[
              { label: 'Tenants managed', value: '24' },
              { label: 'Actions today', value: '7' },
              { label: 'Days active', value: '142' },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-4 text-center">
                <p className="text-xl font-semibold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-800">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'border-b-2 border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Account tab */}
        {activeTab === 'Account' && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 divide-y divide-gray-800">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-sm font-medium text-white">Account details</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-md border border-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-md px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
                  >
                    {isSaving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              )}
            </div>

            {saved && (
              <div className="mx-6 my-2 rounded-md bg-green-500/10 border border-green-800 px-4 py-2 text-xs text-green-400">
                ✓ Changes saved successfully
              </div>
            )}

            {[
              { label: 'Full name', key: 'name', type: 'text' },
              { label: 'Email address', key: 'email', type: 'email' },
              { label: 'Timezone', key: 'timezone', type: 'text' },
            ].map(({ label, key, type }) => (
              <div key={key} className="flex items-center justify-between px-6 py-4">
                <label className="text-xs text-gray-500 w-32 flex-shrink-0">{label}</label>
                {isEditing ? (
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="flex-1 text-sm text-gray-200">{form[key as keyof typeof form]}</p>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between px-6 py-4">
              <label className="text-xs text-gray-500 w-32 flex-shrink-0">Role</label>
              <p className="flex-1 text-sm text-gray-200">Super Administrator</p>
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <label className="text-xs text-gray-500 w-32 flex-shrink-0">Access level</label>
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                Full system access
              </span>
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <label className="text-xs text-gray-500 w-32 flex-shrink-0">Status</label>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Active
              </span>
            </div>
          </div>
        )}

        {/* Security tab */}
        {activeTab === 'Security' && (
          <div className="space-y-3">
            {[
              {
                title: 'Password',
                description: 'Last changed 30 days ago',
                action: 'Change password',
                danger: false,
              },
              {
                title: 'Two-factor authentication',
                description: 'Add an extra layer of security to your account',
                action: 'Enable 2FA',
                danger: false,
              },
              {
                title: 'Active sessions',
                description: '1 active session — this device',
                action: 'Revoke all sessions',
                danger: true,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 px-6 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
                </div>
                <button
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    item.danger
                      ? 'border-red-800 text-red-400 hover:border-red-600 hover:text-red-300'
                      : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Activity tab */}
        {activeTab === 'Activity' && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 divide-y divide-gray-800">
            <div className="px-6 py-4">
              <h2 className="text-sm font-medium text-white">Recent activity</h2>
            </div>
            {ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                <span className="text-base">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200">{item.action}</p>
                </div>
                <p className="flex-shrink-0 text-xs text-gray-500">{item.time}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
