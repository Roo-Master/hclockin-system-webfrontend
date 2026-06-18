'use client';

import { useEffect, useState } from 'react';

type AdminProfile = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  role: string;
  initials: string;
  joinedAt: string;
  lastLoginAt: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [form, setForm] = useState({ name: '', email: '', bio: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/profile', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load profile');

      const data = await res.json();
      setProfile(data.profile);
      setForm({
        name: data.profile.name ?? '',
        email: data.profile.email ?? '',
        bio: data.profile.bio ?? '',
      });
    } catch {
      setError('Could not load profile. Try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to save profile');

      const data = await res.json();
      setProfile(data.profile);
      setStatusMessage('Profile updated.');
    } catch {
      setError('Could not save changes. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-gray-950 px-6 py-8 text-white">
        <div className="mx-auto max-w-2xl text-sm text-gray-400">Loading profile…</div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-full bg-gray-950 px-6 py-8 text-white">
        <div className="mx-auto max-w-2xl rounded-md border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-gray-400">View and update your account details.</p>

        <div className="mt-6 flex items-center gap-4 rounded-md border border-gray-800 bg-gray-900 px-4 py-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold">
            {profile?.initials}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{profile?.name}</p>
            <span className="mt-1 inline-block rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
              {profile?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-md border border-gray-800 bg-gray-900 px-4 py-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
            {statusMessage && <span className="text-sm text-green-400">{statusMessage}</span>}
            {error && profile && <span className="text-sm text-red-400">{error}</span>}
          </div>
        </form>

        <div className="mt-6 rounded-md border border-gray-800 bg-gray-900 px-4 py-4 text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-400">Joined</span>
            <span className="text-gray-200">
              {profile && new Date(profile.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-400">Last login</span>
            <span className="text-gray-200">
              {profile && new Date(profile.lastLoginAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}