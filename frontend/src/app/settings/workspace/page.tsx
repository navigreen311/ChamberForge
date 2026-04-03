'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface WorkspaceSettings {
  id: string;
  name: string;
  slug: string;
  plan: string;
  owner_id: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export default function WorkspaceSettingsPage() {
  const { isAdmin } = useAuth();
  const [ws, setWs] = useState<WorkspaceSettings | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [settingsJson, setSettingsJson] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<WorkspaceSettings>('/api/v1/workspace-settings/')
      .then(({ data }) => {
        setWs(data);
        setName(data.name);
        setSlug(data.slug);
        setSettingsJson(JSON.stringify(data.settings, null, 2));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      let parsedSettings: Record<string, unknown> = {};
      try {
        parsedSettings = JSON.parse(settingsJson);
      } catch {
        setMessage({ type: 'error', text: 'Invalid JSON in settings field.' });
        setSaving(false);
        return;
      }
      const { data } = await api.put<WorkspaceSettings>('/api/v1/workspace-settings/', {
        name,
        slug,
        settings: parsedSettings,
      });
      setWs(data);
      setSlug(data.slug);
      setMessage({ type: 'success', text: 'Workspace settings updated.' });
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to update workspace.';
      setMessage({ type: 'error', text: detail });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-chamber-800 rounded" />
          <div className="h-64 bg-chamber-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8 max-w-2xl mx-auto">
        <Link href="/settings" className="inline-flex items-center gap-2 text-chamber-400 hover:text-white mb-6 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Settings
        </Link>
        <h1 className="text-2xl font-display font-bold text-white mb-4">Workspace Settings</h1>
        <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-8 text-center">
          <p className="text-chamber-400 text-lg">
            Only workspace admins can modify these settings.
          </p>
          <p className="text-chamber-500 mt-2">Contact your workspace admin to make changes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8 max-w-2xl mx-auto">
      <Link href="/settings" className="inline-flex items-center gap-2 text-chamber-400 hover:text-white mb-6 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Workspace Settings</h1>

      <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-6">
        {message && (
          <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-chamber-400 mb-1">Workspace Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-white focus:border-gold-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-chamber-400 mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-white focus:border-gold-400 focus:outline-none"
            />
            <p className="mt-1 text-xs text-chamber-500">
              URL preview: <span className="text-chamber-300">chamberforge.io/{slug}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm text-chamber-400 mb-1">Plan</label>
            <p className="rounded-lg border border-chamber-700 bg-chamber-800/50 px-4 py-2 text-chamber-300 capitalize">
              {ws?.plan ?? 'core'}
            </p>
          </div>

          <div>
            <label className="block text-sm text-chamber-400 mb-1">Settings (JSON)</label>
            <textarea
              value={settingsJson}
              onChange={(e) => setSettingsJson(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 font-mono text-sm text-white focus:border-gold-400 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 font-semibold text-chamber-950 hover:bg-gold-300 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Workspace'}
          </button>
        </div>
      </div>
    </div>
  );
}
