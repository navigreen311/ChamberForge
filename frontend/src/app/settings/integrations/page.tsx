'use client';

import { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Inline Data                                                       */
/* ------------------------------------------------------------------ */

interface Module {
  name: string;
  enabled: boolean;
}

interface Integration {
  id: string;
  name: string;
  initial: string;
  color: string;
  connected: boolean;
  lastSync: string | null;
  modules: Module[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'voiceforge',
    name: 'VoiceForge',
    initial: 'V',
    color: '#6366F1',
    connected: true,
    lastSync: '2026-04-03T08:12:00Z',
    modules: [
      { name: 'Speech-to-Text', enabled: true },
      { name: 'Text-to-Speech', enabled: true },
      { name: 'Voice Cloning', enabled: false },
      { name: 'Accent Adaptation', enabled: true },
      { name: 'Real-time Transcription', enabled: true },
      { name: 'Voice Analytics', enabled: false },
    ],
  },
  {
    id: 'visionaudioforge',
    name: 'VisionAudioForge',
    initial: 'VA',
    color: '#EC4899',
    connected: true,
    lastSync: '2026-04-03T07:45:00Z',
    modules: [
      { name: 'Image Classification', enabled: true },
      { name: 'Object Detection', enabled: true },
      { name: 'Audio Spectral Analysis', enabled: true },
      { name: 'Motion Detection', enabled: false },
      { name: 'Cross-Modal Retrieval', enabled: true },
      { name: 'Multimodal Fusion', enabled: true },
      { name: 'Optical Flow', enabled: false },
      { name: 'Scene Understanding', enabled: true },
    ],
  },
  { id: 'gcal', name: 'Google Calendar', initial: 'G', color: '#4285F4', connected: false, lastSync: null, modules: [] },
  { id: 'gmail', name: 'Gmail / Outlook', initial: 'M', color: '#EA4335', connected: false, lastSync: null, modules: [] },
  { id: 'gdrive', name: 'Google Drive / Box', initial: 'D', color: '#34A853', connected: false, lastSync: null, modules: [] },
  { id: 'salesforce', name: 'Salesforce CRM', initial: 'S', color: '#00A1E0', connected: false, lastSync: null, modules: [] },
  { id: 'stripe', name: 'Stripe', initial: 'St', color: '#635BFF', connected: true, lastSync: '2026-04-02T22:00:00Z', modules: [] },
  { id: 'elastic', name: 'Elasticsearch', initial: 'E', color: '#FEC514', connected: true, lastSync: '2026-04-03T06:30:00Z', modules: [] },
  { id: 'pusher', name: 'Pusher', initial: 'P', color: '#300D4F', connected: true, lastSync: '2026-04-03T09:00:00Z', modules: [] },
  { id: 'aws', name: 'AWS S3', initial: 'A', color: '#FF9900', connected: true, lastSync: '2026-04-03T05:15:00Z', modules: [] },
  { id: 'anthropic', name: 'Anthropic API', initial: 'An', color: '#C9A84C', connected: true, lastSync: '2026-04-03T09:10:00Z', modules: [] },
];

function formatSync(iso: string | null): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ------------------------------------------------------------------ */
/*  Connection Modal                                                  */
/* ------------------------------------------------------------------ */

function ConnectionModal({
  integration,
  onClose,
}: {
  integration: Integration;
  onClose: () => void;
}) {
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'failure'>('idle');

  const handleTest = () => {
    setTesting(true);
    setResult('idle');
    setTimeout(() => {
      setTesting(false);
      setResult(apiKey.length >= 8 ? 'success' : 'failure');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[#1e2a3a] bg-[#111827] p-6 shadow-2xl">
        <h2 className="mb-1 text-lg font-semibold text-white">
          Connect to {integration.name}
        </h2>
        <p className="mb-5 text-sm text-gray-400">
          Enter your API key to establish a connection.
        </p>

        <label className="mb-1 block text-xs font-medium text-gray-400">
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => { setApiKey(e.target.value); setResult('idle'); }}
          placeholder="sk-••••••••••••••••"
          className="mb-4 w-full rounded-lg border border-[#1e2a3a] bg-[#0D1117] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]"
        />

        {result === 'success' && (
          <div className="mb-4 rounded-lg border border-green-700 bg-green-900/30 px-3 py-2 text-sm text-green-400">
            Connection successful — ready to activate.
          </div>
        )}
        {result === 'failure' && (
          <div className="mb-4 rounded-lg border border-red-700 bg-red-900/30 px-3 py-2 text-sm text-red-400">
            Connection failed — check your API key and try again.
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTest}
            disabled={!apiKey || testing}
            className="rounded-lg border border-[#C9A84C] bg-[#C9A84C]/10 px-4 py-2 text-sm font-medium text-[#C9A84C] transition-colors hover:bg-[#C9A84C]/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Integration Card                                                  */
/* ------------------------------------------------------------------ */

function IntegrationCard({
  item,
  onConnect,
}: {
  item: Integration;
  onConnect: (i: Integration) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasModules = item.modules.length > 0;
  const enabledCount = item.modules.filter((m) => m.enabled).length;

  return (
    <div className="flex flex-col rounded-xl border border-[#1e2a3a] bg-[#111827] p-5 transition-colors hover:border-[#C9A84C]/40">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: item.color }}
          >
            {item.initial}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{item.name}</h3>
            <p className="text-xs text-gray-500">
              Last sync: {formatSync(item.lastSync)}
            </p>
          </div>
        </div>

        {/* Status dot */}
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              item.connected ? 'bg-green-500' : 'bg-gray-600'
            }`}
          />
          {item.connected ? 'Connected' : 'Not connected'}
        </span>
      </div>

      {/* Modules count */}
      {hasModules && (
        <p className="mb-3 text-xs text-gray-400">
          {enabledCount}/{item.modules.length} modules enabled
        </p>
      )}

      {/* Expandable module list */}
      {hasModules && (
        <div className="mb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="mb-2 text-xs font-medium text-[#C9A84C] hover:underline"
          >
            {expanded ? '▾ Hide modules' : '▸ Show modules'}
          </button>
          {expanded && (
            <ul className="space-y-1 rounded-lg border border-[#1e2a3a] bg-[#0D1117] p-3">
              {item.modules.map((m) => (
                <li key={m.name} className="flex items-center gap-2 text-xs">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      m.enabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                  <span className={m.enabled ? 'text-gray-300' : 'text-gray-500'}>
                    {m.name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Actions — pushed to bottom */}
      <div className="mt-auto flex items-center gap-2 pt-2">
        {item.connected ? (
          <>
            <button className="flex-1 rounded-lg border border-red-800 bg-red-900/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/40">
              Disconnect
            </button>
            <button className="flex-1 rounded-lg border border-[#1e2a3a] bg-[#0D1117] px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-[#C9A84C]/50 hover:text-white">
              Configure
            </button>
          </>
        ) : (
          <button
            onClick={() => onConnect(item)}
            className="w-full rounded-lg border border-[#C9A84C] bg-[#C9A84C]/10 px-3 py-2 text-xs font-medium text-[#C9A84C] transition-colors hover:bg-[#C9A84C]/20"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function IntegrationsPage() {
  const [modalTarget, setModalTarget] = useState<Integration | null>(null);

  const connected = INTEGRATIONS.filter((i) => i.connected);
  const notConnected = INTEGRATIONS.filter((i) => !i.connected);

  return (
    <div className="min-h-screen bg-[#0D1117] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-[#C9A84C]">Integration</span> Hub
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage external services and platform connections.
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-8 flex gap-6 rounded-xl border border-[#1e2a3a] bg-[#111827] px-6 py-4">
          <div>
            <p className="text-2xl font-bold text-[#C9A84C]">{connected.length}</p>
            <p className="text-xs text-gray-400">Connected</p>
          </div>
          <div className="w-px bg-[#1e2a3a]" />
          <div>
            <p className="text-2xl font-bold text-white">{notConnected.length}</p>
            <p className="text-xs text-gray-400">Available</p>
          </div>
          <div className="w-px bg-[#1e2a3a]" />
          <div>
            <p className="text-2xl font-bold text-white">{INTEGRATIONS.length}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
        </div>

        {/* Connected */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Connected Integrations
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connected.map((item) => (
              <IntegrationCard
                key={item.id}
                item={item}
                onConnect={setModalTarget}
              />
            ))}
          </div>
        </section>

        {/* Available */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Available Integrations
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notConnected.map((item) => (
              <IntegrationCard
                key={item.id}
                item={item}
                onConnect={setModalTarget}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Connection Modal */}
      {modalTarget && (
        <ConnectionModal
          integration={modalTarget}
          onClose={() => setModalTarget(null)}
        />
      )}
    </div>
  );
}
