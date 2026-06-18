'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Mary Kamau',
    email: 'm.kamau@knh.go.ke',
    phone: '+254 712 345 678',
    employeeId: 'KNH-2241',
    department: 'ICU',
    position: 'Staff Nurse',
    joinDate: 'Mar 2022',
    emergencyContact: 'John Kamau · +254 723 456 789',
  });

  const [formData, setFormData] = useState(profile);

  function handleSave() {
    setProfile(formData);
    setEditMode(false);
  }

  function handleCancel() {
    setFormData(profile);
    setEditMode(false);
  }

  return (
    <DashboardLayout title="My Profile">
      <div className="flex flex-col gap-5">

        <div className="grid grid-cols-[1fr_300px] gap-5">

          {/* Main profile form */}
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
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-border rounded-badge px-3 py-2" />
                </div>
                <div>
                  <label className="text-label text-secondary block mb-1.5">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-border rounded-badge px-3 py-2" />
                </div>
                <div>
                  <label className="text-label text-secondary block mb-1.5">Phone number</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border border-border rounded-badge px-3 py-2" />
                </div>
                <div>
                  <label className="text-label text-secondary block mb-1.5">Emergency contact</label>
                  <input type="text" value={formData.emergencyContact} onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})} className="w-full border border-border rounded-badge px-3 py-2" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} className="px-4 py-2 bg-success text-white rounded-badge">Save changes</button>
                  <button onClick={handleCancel} className="px-4 py-2 border border-border rounded-badge">Cancel</button>
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
                    <span className="text-label font-medium text-primary">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats card */}
          <div className="bg-surface border border-border rounded-card p-5 text-center">
            <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center text-success text-2xl font-semibold mx-auto mb-3">
              MK
            </div>
            <h3 className="text-body font-bold text-primary">Mary Kamau</h3>
            <p className="text-label text-secondary">Staff Nurse · ICU</p>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-secondary">Attendance rate</span>
                <span className="text-success font-medium">94%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Leave balance</span>
                <span className="text-primary font-medium">9 days</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}