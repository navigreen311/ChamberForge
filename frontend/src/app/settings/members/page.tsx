'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface Member {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLES = ['admin', 'advisor', 'analyst', 'operator', 'viewer'] as const;

const roleBadgeColor: Record<string, string> = {
  admin: 'bg-gold-400/20 text-gold-400',
  advisor: 'bg-blue-400/20 text-blue-400',
  analyst: 'bg-purple-400/20 text-purple-400',
  operator: 'bg-green-400/20 text-green-400',
  viewer: 'bg-chamber-600/30 text-chamber-300',
};

export default function MembersSettingsPage() {
  const { isAdmin, user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('operator');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const { data } = await api.get<Member[]>('/api/v1/workspace-settings/members');
      setMembers(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    setMessage(null);
    try {
      await api.post('/api/v1/workspace-settings/members/invite', {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail('');
      setMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}` });
      fetchMembers();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to invite member.';
      setMessage({ type: 'error', text: detail });
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setMessage(null);
    try {
      await api.put(`/api/v1/workspace-settings/members/${memberId}/role`, { role: newRole });
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      );
      setMessage({ type: 'success', text: 'Role updated.' });
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to update role.';
      setMessage({ type: 'error', text: detail });
    }
  };

  const handleRemove = async (memberId: string) => {
    setMessage(null);
    try {
      await api.delete(`/api/v1/workspace-settings/members/${memberId}`);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setConfirmDelete(null);
      setMessage({ type: 'success', text: 'Member removed.' });
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to remove member.';
      setMessage({ type: 'error', text: detail });
    }
  };

  return (
    <div className="min-h-screen bg-chamber-950 p-8 max-w-4xl mx-auto">
      <Link href="/settings" className="inline-flex items-center gap-2 text-chamber-400 hover:text-white mb-6 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Team Members</h1>

      {message && (
        <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Invite form */}
      {isAdmin && (
        <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-4 mb-6 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-chamber-400 mb-1">Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-white focus:border-gold-400 focus:outline-none"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm text-chamber-400 mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-white focus:border-gold-400 focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail}
            className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 font-semibold text-chamber-950 hover:bg-gold-300 transition disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {inviting ? 'Inviting...' : 'Invite'}
          </button>
        </div>
      )}

      {/* Members table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-chamber-800" />
          ))}
        </div>
      ) : (
        <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-chamber-800">
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Joined</th>
                {isAdmin && (
                  <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                  <td className="px-5 py-4 text-white font-medium">{m.name}</td>
                  <td className="px-5 py-4 text-chamber-300">{m.email}</td>
                  <td className="px-5 py-4">
                    {isAdmin && m.id !== user?.id ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="rounded border border-chamber-700 bg-chamber-800 px-2 py-1 text-sm text-white focus:border-gold-400 focus:outline-none"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={clsx('inline-block rounded-full px-2 py-0.5 text-xs font-medium', roleBadgeColor[m.role] || roleBadgeColor.viewer)}>
                        {m.role}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-chamber-400 text-sm">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-4">
                      {m.id !== user?.id && (
                        <>
                          {confirmDelete === m.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRemove(m.id)}
                                className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="text-xs text-chamber-400 hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(m.id)}
                              className="text-red-400 hover:text-red-300 transition"
                              title="Remove member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && (
            <p className="py-8 text-center text-chamber-500">No members found.</p>
          )}
        </div>
      )}
    </div>
  );
}
