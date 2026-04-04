'use client';

import { useState } from 'react';
import {
  ArrowLeft, Shield, Copy, Trash2, Eye, Monitor, Smartphone,
  Globe, Key, Lock, FileText, Filter, CheckCircle, XCircle,
} from 'lucide-react';
import Link from 'next/link';

/* ── Inline data ────────────────────────────────────────────────── */

interface Session { id: string; device: string; icon: 'desktop' | 'mobile' | 'web'; ip: string; location: string; current: boolean; lastSeen: string; }
interface ApiKey { id: string; name: string; prefix: string; created: string; lastUsed: string; }
interface AuditEntry { id: string; timestamp: string; actor: string; actionType: string; resource: string; ip: string; }
interface NDARecord { id: string; signer: string; signedAt: string; documentName: string; status: 'signed' | 'pending' | 'expired'; }

const SESSIONS: Session[] = [
  { id: '1', device: 'Chrome on MacBook Pro',  icon: 'desktop',  ip: '192.168.1.42',  location: 'San Francisco, US', current: true,  lastSeen: 'Now' },
  { id: '2', device: 'Safari on iPhone 15',     icon: 'mobile',   ip: '10.0.0.87',     location: 'San Francisco, US', current: false, lastSeen: '4 hours ago' },
  { id: '3', device: 'Firefox on Windows 11',   icon: 'web',      ip: '203.0.113.55',  location: 'London, UK',        current: false, lastSeen: '2 days ago' },
];

const API_KEYS: ApiKey[] = [
  { id: '1', name: 'Production API',  prefix: 'cf_prod_****a3f8', created: '2025-12-01', lastUsed: '2 hours ago' },
  { id: '2', name: 'Staging Webhook', prefix: 'cf_stg_****9c12',  created: '2026-01-15', lastUsed: '5 days ago' },
];

const AUDIT_LOG: AuditEntry[] = [
  { id: '1', timestamp: '2026-04-03 14:32:01', actor: 'Ivan',  actionType: 'auth.login',          resource: 'Session',       ip: '192.168.1.42' },
  { id: '2', timestamp: '2026-04-03 13:15:44', actor: 'Sarah', actionType: 'member.role_change',   resource: 'Alex (Operator)', ip: '10.0.0.22' },
  { id: '3', timestamp: '2026-04-03 11:02:18', actor: 'Ivan',  actionType: 'api_key.create',       resource: 'Production API', ip: '192.168.1.42' },
  { id: '4', timestamp: '2026-04-02 22:45:00', actor: 'Alex',  actionType: 'chamber.update',       resource: 'Risk Model v3', ip: '172.16.0.5' },
  { id: '5', timestamp: '2026-04-02 18:10:33', actor: 'Sarah', actionType: 'member.invite',        resource: 'jamie@chamberforge.io', ip: '10.0.0.22' },
  { id: '6', timestamp: '2026-04-02 09:30:12', actor: 'Ivan',  actionType: 'security.2fa_enable',  resource: 'Account',       ip: '192.168.1.42' },
  { id: '7', timestamp: '2026-04-01 16:55:07', actor: 'Jamie', actionType: 'report.export',        resource: 'Q1 Summary',    ip: '203.0.113.55' },
  { id: '8', timestamp: '2026-04-01 10:00:00', actor: 'Ivan',  actionType: 'workspace.settings',   resource: 'SSO Config',    ip: '192.168.1.42' },
];

const NDA_RECORDS: NDARecord[] = [
  { id: '1', signer: 'Sarah', signedAt: '2026-01-10', documentName: 'Mutual NDA - ChamberForge',     status: 'signed' },
  { id: '2', signer: 'Alex',  signedAt: '2026-02-05', documentName: 'Data Processing Agreement',      status: 'signed' },
  { id: '3', signer: 'Jamie', signedAt: '',            documentName: 'Viewer Confidentiality Pledge',  status: 'pending' },
];

const ACTION_TYPES = ['All Types', 'auth.login', 'member.role_change', 'api_key.create', 'chamber.update', 'member.invite', 'security.2fa_enable', 'report.export', 'workspace.settings'];
const ACTORS = ['All Actors', 'Ivan', 'Sarah', 'Alex', 'Jamie'];

const sessionIcon = (t: Session['icon']) => {
  if (t === 'desktop') return <Monitor className="h-5 w-5" />;
  if (t === 'mobile') return <Smartphone className="h-5 w-5" />;
  return <Globe className="h-5 w-5" />;
};

const actionBadge: Record<string, string> = {
  'auth.login': 'bg-blue-400/20 text-blue-400',
  'member.role_change': 'bg-purple-400/20 text-purple-400',
  'api_key.create': 'bg-gold-400/20 text-gold-400',
  'chamber.update': 'bg-green-400/20 text-green-400',
  'member.invite': 'bg-teal-400/20 text-teal-400',
  'security.2fa_enable': 'bg-orange-400/20 text-orange-400',
  'report.export': 'bg-pink-400/20 text-pink-400',
  'workspace.settings': 'bg-chamber-600/30 text-chamber-300',
};

const ndaStatusColor: Record<string, string> = {
  signed: 'text-green-400',
  pending: 'text-yellow-400',
  expired: 'text-red-400',
};

/* ── Component ──────────────────────────────────────────────────── */

export default function SecuritySettingsPage() {
  const [tab, setTab] = useState<'security' | 'audit'>('security');
  const [twoFA, setTwoFA] = useState(true);
  const [sessions, setSessions] = useState(SESSIONS);
  const [apiKeys, setApiKeys] = useState(API_KEYS);
  const [toast, setToast] = useState<string | null>(null);

  // Audit filters
  const [filterActor, setFilterActor] = useState('All Actors');
  const [filterType, setFilterType] = useState('All Types');
  const [filterDate, setFilterDate] = useState('');

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const revokeSession = (id: string) => { setSessions((s) => s.filter((x) => x.id !== id)); flash('Session revoked.'); };
  const copyKey = (prefix: string) => { navigator.clipboard?.writeText(prefix); flash('API key copied to clipboard.'); };
  const revokeKey = (id: string) => { setApiKeys((k) => k.filter((x) => x.id !== id)); flash('API key revoked.'); };

  const filteredLog = AUDIT_LOG.filter((e) => {
    if (filterActor !== 'All Actors' && e.actor !== filterActor) return false;
    if (filterType !== 'All Types' && e.actionType !== filterType) return false;
    if (filterDate && !e.timestamp.startsWith(filterDate)) return false;
    return true;
  });

  const tabs = [
    { key: 'security' as const, label: 'Security Settings', icon: <Shield className="h-4 w-4" /> },
    { key: 'audit' as const, label: 'Audit Log', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-chamber-950 p-8 max-w-5xl mx-auto">
      <Link href="/settings" className="inline-flex items-center gap-2 text-chamber-400 hover:text-white mb-6 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>

      <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2 mb-6"><Lock className="h-6 w-6" /> Security &amp; Audit</h1>

      {toast && <div className="mb-4 rounded-lg bg-green-900/30 px-4 py-2 text-sm text-green-400">{toast}</div>}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-chamber-900 rounded-lg p-1 border border-chamber-800 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === t.key ? 'bg-chamber-800 text-white' : 'text-chamber-400 hover:text-white'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── SECURITY TAB ──────────────────────────────────────── */}
      {tab === 'security' && (
        <div className="space-y-6">
          {/* 2FA */}
          <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Two-Factor Authentication</h2>
                <p className="text-sm text-chamber-400">Add an extra layer of security to your account.</p>
              </div>
              <button
                onClick={() => { setTwoFA(!twoFA); flash(twoFA ? '2FA disabled.' : '2FA enabled.'); }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${twoFA ? 'bg-green-500' : 'bg-chamber-700'}`}
              >
                <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${twoFA ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {twoFA && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-chamber-800 border border-chamber-700">
                <div className="h-32 w-32 rounded-lg bg-chamber-700 flex items-center justify-center text-chamber-500 text-xs text-center border border-dashed border-chamber-600">QR Code<br/>Placeholder</div>
                <div className="text-sm text-chamber-300">
                  <p className="mb-2">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.).</p>
                  <p className="text-chamber-500 font-mono text-xs">Manual key: CHAM-B3RF-0RG3-S3CR</p>
                </div>
              </div>
            )}
          </div>

          {/* Active Sessions */}
          <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Active Sessions</h2>
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-chamber-800 border border-chamber-700">
                  <div className="flex items-center gap-3">
                    <div className="text-chamber-400">{sessionIcon(s.icon)}</div>
                    <div>
                      <div className="text-white text-sm font-medium flex items-center gap-2">
                        {s.device}
                        {s.current && <span className="text-[10px] rounded-full bg-green-500/20 text-green-400 px-2 py-0.5">Current</span>}
                      </div>
                      <div className="text-xs text-chamber-400">{s.ip} &middot; {s.location} &middot; {s.lastSeen}</div>
                    </div>
                  </div>
                  {!s.current && (
                    <button onClick={() => revokeSession(s.id)} className="text-red-400 hover:text-red-300 text-xs font-medium transition">Revoke</button>
                  )}
                </div>
              ))}
              {sessions.length === 0 && <p className="text-center text-chamber-500 py-4">No active sessions.</p>}
            </div>
          </div>

          {/* API Keys */}
          <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Key className="h-5 w-5" /> API Keys</h2>
            <div className="space-y-3">
              {apiKeys.map((k) => (
                <div key={k.id} className="flex items-center justify-between p-3 rounded-lg bg-chamber-800 border border-chamber-700">
                  <div>
                    <div className="text-white text-sm font-medium">{k.name}</div>
                    <div className="text-xs text-chamber-400 font-mono">{k.prefix}</div>
                    <div className="text-xs text-chamber-500">Created {k.created} &middot; Last used {k.lastUsed}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyKey(k.prefix)} className="text-chamber-400 hover:text-white transition" title="Copy"><Copy className="h-4 w-4" /></button>
                    <button onClick={() => revokeKey(k.id)} className="text-red-400 hover:text-red-300 transition" title="Revoke"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              {apiKeys.length === 0 && <p className="text-center text-chamber-500 py-4">No API keys.</p>}
            </div>
          </div>

          {/* SSO Placeholder */}
          <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-5">
            <h2 className="text-lg font-semibold text-white mb-2">Single Sign-On (SSO)</h2>
            <p className="text-sm text-chamber-400 mb-4">Configure SAML or OIDC-based SSO for your workspace.</p>
            <div className="rounded-lg border border-dashed border-chamber-700 bg-chamber-800/50 p-8 text-center text-chamber-500 text-sm">
              SSO configuration coming soon. Contact support to enable for your workspace.
            </div>
          </div>
        </div>
      )}

      {/* ── AUDIT LOG TAB ─────────────────────────────────────── */}
      {tab === 'audit' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-4 flex flex-wrap items-end gap-3">
            <Filter className="h-4 w-4 text-chamber-400 self-center" />
            <div>
              <label className="block text-xs text-chamber-400 mb-1">Actor</label>
              <select value={filterActor} onChange={(e) => setFilterActor(e.target.value)} className="rounded-lg border border-chamber-700 bg-chamber-800 px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none">
                {ACTORS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-chamber-400 mb-1">Action Type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-lg border border-chamber-700 bg-chamber-800 px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none">
                {ACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-chamber-400 mb-1">Date</label>
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-lg border border-chamber-700 bg-chamber-800 px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none" />
            </div>
          </div>

          {/* Audit table */}
          <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-chamber-800">
                  {['Timestamp', 'Actor', 'Action Type', 'Resource', 'IP Address', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLog.map((e) => (
                  <tr key={e.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                    <td className="px-5 py-3 text-chamber-300 font-mono text-xs whitespace-nowrap">{e.timestamp}</td>
                    <td className="px-5 py-3 text-white">{e.actor}</td>
                    <td className="px-5 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${actionBadge[e.actionType] || 'bg-chamber-600/30 text-chamber-300'}`}>{e.actionType}</span></td>
                    <td className="px-5 py-3 text-chamber-300">{e.resource}</td>
                    <td className="px-5 py-3 text-chamber-400 font-mono text-xs">{e.ip}</td>
                    <td className="px-5 py-3"><button className="text-gold-400 hover:text-gold-300 text-xs font-medium transition flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> View</button></td>
                  </tr>
                ))}
                {filteredLog.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-chamber-500">No entries match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Consent Ledger */}
          <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FileText className="h-5 w-5" /> Consent Ledger</h2>
            <div className="space-y-3">
              {NDA_RECORDS.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-chamber-800 border border-chamber-700">
                  <div>
                    <div className="text-white text-sm font-medium">{r.documentName}</div>
                    <div className="text-xs text-chamber-400">Signer: {r.signer}{r.signedAt ? ` \u00B7 Signed: ${r.signedAt}` : ''}</div>
                  </div>
                  <span className={`text-xs font-medium capitalize ${ndaStatusColor[r.status]}`}>
                    {r.status === 'signed' && <CheckCircle className="h-3.5 w-3.5 inline mr-1" />}
                    {r.status === 'pending' && <XCircle className="h-3.5 w-3.5 inline mr-1" />}
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
