'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { ArrowLeft, AlertTriangle, Download, LogOut, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function DangerZonePage() {
  const { logout, user } = useAuth();
  const [deleteStep, setDeleteStep] = useState(0); // 0=idle, 1=first, 2=second, 3=final
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportData = async () => {
    setExporting(true);
    setMessage(null);
    try {
      const { data } = await api.get('/api/v1/exports/account', { responseType: 'blob' });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chamberforge-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Data export downloaded.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to export data. Try again later.' });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') return;
    setDeleting(true);
    try {
      await api.delete('/api/v1/profile/');
      logout();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete account.' });
      setDeleting(false);
    }
  };

  const handleLeaveWorkspace = async () => {
    setMessage(null);
    try {
      await api.delete('/api/v1/profile/');
      logout();
    } catch {
      setMessage({ type: 'error', text: 'Failed to leave workspace.' });
    }
  };

  return (
    <div className="min-h-screen bg-chamber-950 p-8 max-w-2xl mx-auto">
      <Link href="/settings" className="inline-flex items-center gap-2 text-chamber-400 hover:text-white mb-6 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>
      <h1 className="text-2xl font-display font-bold text-red-400 mb-2">Danger Zone</h1>
      <p className="text-chamber-400 mb-6">These actions are irreversible. Please proceed with caution.</p>

      {message && (
        <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Export Data */}
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900/30 text-blue-400">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Export All Data</h3>
            <p className="text-sm text-chamber-400 mb-3">
              Download a JSON file containing all your profile data, workspace configuration, and activity history.
            </p>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="rounded-lg border border-chamber-600 px-4 py-2 text-sm text-chamber-300 hover:border-blue-400 hover:text-white transition disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Download Export'}
            </button>
          </div>
        </div>
      </div>

      {/* Leave Workspace */}
      <div className="bg-chamber-900 rounded-xl border border-yellow-800/50 p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-900/30 text-yellow-400">
            <LogOut className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Leave Workspace</h3>
            <p className="text-sm text-chamber-400 mb-3">
              Remove yourself from the current workspace. You will lose access to all workspace data.
            </p>
            <button
              onClick={handleLeaveWorkspace}
              className="rounded-lg border border-yellow-700 px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-900/20 transition"
            >
              Leave Workspace
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="bg-chamber-900 rounded-xl border border-red-800/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-900/30 text-red-400">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-400 mb-1">Delete Account</h3>
            <p className="text-sm text-chamber-400 mb-3">
              Permanently deactivate your account. This action cannot be undone.
            </p>

            {deleteStep === 0 && (
              <button
                onClick={() => setDeleteStep(1)}
                className="rounded-lg border border-red-700 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition"
              >
                I want to delete my account
              </button>
            )}

            {deleteStep === 1 && (
              <div className="space-y-3">
                <div className="rounded-lg bg-red-900/20 border border-red-800 p-3">
                  <p className="text-sm text-red-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Are you sure? All your data will be lost.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteStep(2)}
                    className="rounded-lg bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-600 transition"
                  >
                    Yes, I am sure
                  </button>
                  <button
                    onClick={() => setDeleteStep(0)}
                    className="text-sm text-chamber-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="space-y-3">
                <div className="rounded-lg bg-red-900/20 border border-red-800 p-3">
                  <p className="text-sm text-red-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Final confirmation: type <strong>DELETE MY ACCOUNT</strong> to proceed.
                  </p>
                </div>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full rounded-lg border border-red-700 bg-chamber-800 px-4 py-2 text-white focus:border-red-400 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Permanently Delete Account'}
                  </button>
                  <button
                    onClick={() => {
                      setDeleteStep(0);
                      setDeleteConfirmText('');
                    }}
                    className="text-sm text-chamber-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
