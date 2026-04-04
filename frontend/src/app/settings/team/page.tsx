'use client';

import { useState } from 'react';
import {
  ArrowLeft, UserPlus, Edit3, ShieldOff, Trash2,
  X, Send, Users, CheckCircle, XCircle,
} from 'lucide-react';
import Link from 'next/link';

/* ── Inline data ────────────────────────────────────────────────── */

const ROLES = ['owner', 'admin', 'operator', 'viewer'] as const;
type Role = (typeof ROLES)[number];

const roleBadge: Record<Role, string> = {
  owner: 'bg-gold-400/20 text-gold-400',
  admin: 'bg-blue-400/20 text-blue-400',
  operator: 'bg-green-400/20 text-green-400',
  viewer: 'bg-chamber-600/30 text-chamber-300',
};

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'suspended';
  lastActive: string;
  avatar: string;
}

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Ivan',  email: 'ivan@chamberforge.io',  role: 'owner',    status: 'active',    lastActive: '2 min ago',   avatar: 'I' },
  { id: '2', name: 'Sarah', email: 'sarah@chamberforge.io', role: 'admin',    status: 'active',    lastActive: '1 hour ago',  avatar: 'S' },
  { id: '3', name: 'Alex',  email: 'alex@chamberforge.io',  role: 'operator', status: 'active',    lastActive: '3 hours ago', avatar: 'A' },
  { id: '4', name: 'Jamie', email: 'jamie@chamberforge.io', role: 'viewer',   status: 'suspended', lastActive: '2 days ago',  avatar: 'J' },
];

const PERMISSIONS: { label: string; owner: boolean; admin: boolean; operator: boolean; viewer: boolean }[] = [
  { label: 'Manage billing & plan',       owner: true,  admin: false, operator: false, viewer: false },
  { label: 'Invite / remove members',     owner: true,  admin: true,  operator: false, viewer: false },
  { label: 'Change member roles',         owner: true,  admin: true,  operator: false, viewer: false },
  { label: 'Create & edit chambers',      owner: true,  admin: true,  operator: true,  viewer: false },
  { label: 'Run simulations',             owner: true,  admin: true,  operator: true,  viewer: false },
  { label: 'View reports & dashboards',   owner: true,  admin: true,  operator: true,  viewer: true  },
  { label: 'Export data',                 owner: true,  admin: true,  operator: false, viewer: false },
];

const MAX_SEATS = 5;

/* ── Component ──────────────────────────────────────────────────── */

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('operator');
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleSuspendToggle = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === 'active' ? 'suspended' : 'active' } as Member : m,
      ),
    );
    flash('Member status updated.');
  };

  const handleRemove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    flash('Member removed.');
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    flash(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setShowInvite(false);
  };

  const seatPct = Math.round((members.length / MAX_SEATS) * 100);

  return (
    <div className="min-h-screen bg-chamber-950 p-8 max-w-5xl mx-auto">
      <Link href="/settings" className="inline-flex items-center gap-2 text-chamber-400 hover:text-white mb-6 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2"><Users className="h-6 w-6" /> Team Management</h1>
        <button onClick={() => setShowInvite(true)} className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 font-semibold text-chamber-950 hover:bg-gold-300 transition">
          <UserPlus className="h-4 w-4" /> Invite Member
        </button>
      </div>

      {toast && <div className="mb-4 rounded-lg bg-green-900/30 px-4 py-2 text-sm text-green-400">{toast}</div>}

      {/* Seat bar */}
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-4 mb-6">
        <div className="flex justify-between text-sm mb-2"><span className="text-chamber-300">Seats used</span><span className="text-white font-medium">{members.length} of {MAX_SEATS}</span></div>
        <div className="h-2 rounded-full bg-chamber-800 overflow-hidden">
          <div className="h-full rounded-full bg-gold-400 transition-all" style={{ width: `${seatPct}%` }} />
        </div>
      </div>

      {/* Members table */}
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden mb-8">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              {['Member', 'Role', 'Status', 'Last Active', 'Actions'].map((h) => (
                <th key={h} className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                <td className="px-5 py-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-chamber-700 flex items-center justify-center text-white font-bold text-sm">{m.avatar}</div>
                  <div><div className="text-white font-medium">{m.name}</div><div className="text-chamber-400 text-xs">{m.email}</div></div>
                </td>
                <td className="px-5 py-4"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadge[m.role]}`}>{m.role}</span></td>
                <td className="px-5 py-4">
                  {m.status === 'active'
                    ? <span className="inline-flex items-center gap-1 text-xs text-green-400"><CheckCircle className="h-3.5 w-3.5" /> Active</span>
                    : <span className="inline-flex items-center gap-1 text-xs text-red-400"><XCircle className="h-3.5 w-3.5" /> Suspended</span>}
                </td>
                <td className="px-5 py-4 text-chamber-400 text-sm">{m.lastActive}</td>
                <td className="px-5 py-4">
                  {m.role !== 'owner' && (
                    <div className="flex items-center gap-2">
                      <button className="text-chamber-400 hover:text-white transition" title="Edit"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => handleSuspendToggle(m.id)} className="text-yellow-400 hover:text-yellow-300 transition" title={m.status === 'active' ? 'Suspend' : 'Reactivate'}><ShieldOff className="h-4 w-4" /></button>
                      <button onClick={() => handleRemove(m.id)} className="text-red-400 hover:text-red-300 transition" title="Remove"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role permissions matrix */}
      <h2 className="text-lg font-display font-semibold text-white mb-3">Role Permissions</h2>
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-chamber-800">
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Permission</th>
              {ROLES.map((r) => (
                <th key={r} className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider text-center capitalize">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((p) => (
              <tr key={p.label} className="border-b border-chamber-800/50">
                <td className="px-5 py-3 text-chamber-300">{p.label}</td>
                {ROLES.map((r) => (
                  <td key={r} className="px-5 py-3 text-center">
                    {p[r] ? <CheckCircle className="h-4 w-4 text-green-400 mx-auto" /> : <XCircle className="h-4 w-4 text-chamber-700 mx-auto" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-chamber-900 border border-chamber-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-semibold text-white">Invite Team Member</h3>
              <button onClick={() => setShowInvite(false)} className="text-chamber-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <label className="block text-sm text-chamber-400 mb-1">Email address</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-white mb-4 focus:border-gold-400 focus:outline-none"
            />
            <label className="block text-sm text-chamber-400 mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Role)}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-white mb-6 focus:border-gold-400 focus:outline-none"
            >
              {ROLES.filter((r) => r !== 'owner').map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={handleInvite}
              disabled={!inviteEmail}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-2.5 font-semibold text-chamber-950 hover:bg-gold-300 transition disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Send Invitation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
