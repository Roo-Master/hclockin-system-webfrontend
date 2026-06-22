'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/user-components/layout/DashboardLayout';
import { useMyProfile } from '@/hooks/user-hooks/useGeneralUser';
import { updateMyProfile } from '@/app/api/user-api/userService';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  position: string;
  joinDate: string;
  emergencyContact: string;
}

const emptyProfile: ProfileForm = {
  name: '',
  email: '',
  phone: '',
  employeeId: '',
  department: '',
  position: '',
  joinDate: '',
  emergencyContact: '',
};

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [formData, setFormData] = useState<ProfileForm>(emptyProfile);
  const [saving, setSaving] = useState(false);

  const { data: profileData, loading, refetch } = useMyProfile();

  useEffect(() => {
    if (profileData) {
      const p = (profileData as { data?: Record<string, unknown> }).data ?? profileData;
      const record = p as Record<string, unknown>;
      const next: ProfileForm = {
        name: String(record.fullName ?? record.name ?? ''),
        email: String(record.email ?? ''),
        phone: String(record.phone ?? ''),
        employeeId: String(record.employeeId ?? ''),
        department: String((record.department as { name?: string })?.name ?? record.department ?? ''),
        position: String(record.position ?? record.jobTitle ?? ''),
        joinDate: record.joinDate ? new Date(String(record.joinDate)).toDateString() : '',
        emergencyContact: String(record.emergencyContact ?? ''),
      };
      setProfile(next);
      setFormData(next);
    }
  }, [profileData]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateMyProfile({
        name: formData.name,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
      });
      setProfile(formData);
      setEditMode(false);
      refetch();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Update failed';
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFormData(profile);
    setEditMode(false);
  }

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <DashboardLayout title="My Profile">
      <div className="flex flex-col gap-5">
        {loading && <p className="text-label text-secondary">Loading profile...</p>}

        <div className="grid grid-cols-[1fr_300px] gap-5">
          <div className="bg-surface border border-border rounded-card p-5">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-heading text-primary">Personal information</h2>
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="text-label text-success hover:underline">
                  Edit profile →
                </button>
              )}
            </div>

            {editMode ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-label text-secondary block mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-border rounded-badge px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-label text-secondary block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="w-full border border-border rounded-badge px-3 py-2 bg-page"
                  />
                </div>
                <div>
                  <label className="text-label text-secondary block mb-1.5">Phone number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-border rounded-badge px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-label text-secondary block mb-1.5">Emergency contact</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full border border-border rounded-badge px-3 py-2"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-success text-white rounded-badge disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button onClick={handleCancel} className="px-4 py-2 border border-border rounded-badge">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                {[
                  { label: 'Full name', value: profile.name },
                  { label: 'Employee ID', value: profile.employeeId },
                  { label: 'Email', value: profile.email },
                  { label: 'Phone number', value: profile.phone },
                  { label: 'Department', value: profile.department },
                  { label: 'Position', value: profile.position },
                  { label: 'Join date', value: profile.joinDate },
                  { label: 'Emergency contact', value: profile.emergencyContact },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-3 border-b border-border last:border-0">
                    <span className="text-label text-secondary">{item.label}</span>
                    <span className="text-label font-medium text-primary">{item.value || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-card p-5 text-center">
            <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center text-success text-2xl font-semibold mx-auto mb-3">
              {initials}
            </div>
            <h3 className="text-body font-bold text-primary">{profile.name || 'User'}</h3>
            <p className="text-label text-secondary">
              {profile.position || '—'} · {profile.department || '—'}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
