'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/api/v1/profile/', { name, email });
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to update profile.';
      setMessage({ type: 'error', text: detail });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwMessage(null);
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPwSaving(true);
    try {
      await api.put('/api/v1/profile/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwMessage({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to change password.';
      setPwMessage({ type: 'error', text: detail });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-chamber-950 p-8 max-w-2xl mx-auto">
      <Link href="/settings" className="inline-flex items-center gap-2 text-chamber-400 hover:text-white mb-6 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Profile Settings</h1>

      {/* Profile form */}
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Personal Information</h2>

        {message && (
          <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-chamber-400 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-white focus:border-gold-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-chamber-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-white focus:border-gold-400 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 font-semibold text-chamber-950 hover:bg-gold-300 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>

        {pwMessage && (
          <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${pwMessage.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
            {pwMessage.text}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm text-chamber-400 mb-1">Current Password</label>
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 pr-10 text-white focus:border-gold-400 focus:outline-none"
            />
            <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-8 text-chamber-400 hover:text-white">
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-sm text-chamber-400 mb-1">New Password</label>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 pr-10 text-white focus:border-gold-400 focus:outline-none"
            />
            <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-8 text-chamber-400 hover:text-white">
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div>
            <label className="block text-sm text-chamber-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-white focus:border-gold-400 focus:outline-none"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={pwSaving || !currentPassword || !newPassword}
            className="inline-flex items-center gap-2 rounded-lg border border-chamber-600 px-4 py-2 text-chamber-300 hover:border-gold-400 hover:text-white transition disabled:opacity-50"
          >
            {pwSaving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
