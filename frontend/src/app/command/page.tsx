'use client';

import { useState, useRef, useEffect } from 'react';

// ─── Inline Data ────────────────────────────────────────────────────────────

interface Evidence {
  source: string;
  score: number;
  summary: string;
}

interface PipelineItem {
  client: string;
  offer: string;
  compositeScore: number;
  stage: string;
}

interface ActionCard {
  title: string;
  confidence: number;
  description: string;
}

interface ActionHistoryEntry {
  action: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'in-progress';
}

type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'action-card'; card: ActionCard }
  | { type: 'evidence'; items: Evidence[] }
  | { type: 'pipeline'; items: PipelineItem[] };

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: MessageContent;
  feedback?: 'up' | 'down' | null;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    role: 'user',
    content: { type: 'text', text: 'What should I prioritize today?' },
  },
  {
    id: 'm2',
    role: 'ai',
    content: {
      type: 'action-card',
      card: {
        title: 'Activate Family Cyber Command for Wellington Trust',
        confidence: 94,
        description:
          'Wellington Trust has experienced 3 phishing attempts this quarter. Their current coverage gap in cyber liability exposes $12M in unprotected assets. Immediate activation recommended.',
      },
    },
  },
  {
    id: 'm3',
    role: 'user',
    content: { type: 'text', text: 'Show me the evidence for this' },
  },
  {
    id: 'm4',
    role: 'ai',
    content: {
      type: 'evidence',
      items: [
        {
          source: 'FBI IC3 Annual Report 2025',
          score: 9.2,
          summary:
            'HNW families are 4.7x more likely to be targeted by sophisticated phishing. Average loss per incident: $1.2M.',
        },
        {
          source: 'Deloitte Private Wealth Cyber Survey',
          score: 8.7,
          summary:
            '68% of family offices report at least one cyber incident in the past 12 months. Only 23% have dedicated cyber coverage.',
        },
        {
          source: 'Wellington Trust — Client Incident Log',
          score: 10.0,
          summary:
            '3 confirmed phishing attempts in Q1 2026. CEO email compromised on Jan 14. No financial loss but reputational risk flagged.',
        },
      ],
    },
  },
  {
    id: 'm5',
    role: 'user',
    content: { type: 'text', text: 'What about my pipeline?' },
  },
  {
    id: 'm6',
    role: 'ai',
    content: {
      type: 'pipeline',
      items: [
        {
          client: 'Wellington Trust',
          offer: 'Family Cyber Command',
          compositeScore: 94,
          stage: 'Ready to Present',
        },
        {
          client: 'Nakamura Holdings',
          offer: 'Cross-Border Estate Shield',
          compositeScore: 87,
          stage: 'Evidence Gathering',
        },
        {
          client: 'Albright Foundation',
          offer: 'Art Collection Vault',
          compositeScore: 79,
          stage: 'Discovery',
        },
      ],
    },
  },
];

const QUICK_ACTIONS = [
  'What should I do next?',
  'Analyze pipeline',
  'Find opportunities',
  'Check SLA status',
];

const ACTIVE_CLIENTS = [
  { name: 'Wellington Trust', aum: '$142M', status: 'active' as const },
  { name: 'Nakamura Holdings', aum: '$89M', status: 'active' as const },
  { name: 'Albright Foundation', aum: '$210M', status: 'review' as const },
];

const RECENT_OFFERS = [
  { name: 'Family Cyber Command', client: 'Wellington Trust', value: '$285K' },
  { name: 'Cross-Border Estate Shield', client: 'Nakamura Holdings', value: '$410K' },
];

const WEALTH_EVENTS = [
  { event: 'Wellington Trust Q2 review', date: 'Apr 4', type: 'meeting' as const },
  { event: 'Nakamura tax filing deadline', date: 'Apr 5', type: 'deadline' as const },
  { event: 'Albright art acquisition closing', date: 'Apr 7', type: 'transaction' as const },
];

const PENDING_ACTIONS = [
  'Finalize Wellington cyber proposal',
  'Schedule Nakamura estate review',
  'Update Albright collection appraisal',
  'Submit Q1 compliance report',
];

const ACTION_HISTORY: ActionHistoryEntry[] = [
  { action: 'Sent Nakamura Holdings risk assessment', timestamp: '2026-04-03 09:14 AM', status: 'completed' },
  { action: 'Generated Wellington Trust cyber brief', timestamp: '2026-04-02 04:32 PM', status: 'completed' },
  { action: 'Flagged Albright SLA breach risk', timestamp: '2026-04-02 11:05 AM', status: 'in-progress' },
];

// ─── Helper Components ──────────────────────────────────────────────────────

function CredibilityBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 9 ? 'bg-emerald-500' : score >= 8 ? 'bg-gold-400' : 'bg-chamber-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-chamber-800">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-chamber-300">{score.toFixed(1)}</span>
    </div>
  );
}

function FeedbackButtons({
  feedback,
  onFeedback,
}: {
  feedback: 'up' | 'down' | null | undefined;
  onFeedback: (v: 'up' | 'down') => void;
}) {
  return (
    <div className="mt-2 flex gap-1">
      <button
        onClick={() => onFeedback('up')}
        className={`rounded p-1 text-xs transition-colors ${
          feedback === 'up'
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'text-chamber-500 hover:bg-chamber-800 hover:text-chamber-300'
        }`}
        aria-label="Thumbs up"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
      </button>
      <button
        onClick={() => onFeedback('down')}
        className={`rounded p-1 text-xs transition-colors ${
          feedback === 'down'
            ? 'bg-red-500/20 text-red-400'
            : 'text-chamber-500 hover:bg-chamber-800 hover:text-chamber-300'
        }`}
        aria-label="Thumbs down"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-180" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
      </button>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? 'text-emerald-400 bg-emerald-500/10' : score >= 80 ? 'text-gold-400 bg-gold-500/10' : 'text-chamber-300 bg-chamber-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${color}`}>
      {score}
    </span>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function CommandPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleFeedback = (id: string, value: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, feedback: m.feedback === value ? null : value } : m))
    );
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: { type: 'text', text },
    };
    const aiMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'ai',
      content: {
        type: 'text',
        text: 'I\'m analyzing your request. In a live environment, this would connect to the ChamberForge AI engine for real-time recommendations.',
      },
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  // ─── Renderers ──────────────────────────────────────────────────────────

  const renderContent = (msg: Message) => {
    const { content } = msg;

    if (content.type === 'text') {
      return <p className="text-sm leading-relaxed">{content.text}</p>;
    }

    if (content.type === 'action-card') {
      const { card } = content;
      return (
        <div className="rounded-lg border border-gold-500/30 bg-gold-500/5 p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h4 className="text-sm font-semibold text-gold-400">{card.title}</h4>
            <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-400">
              {card.confidence}% confidence
            </span>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-chamber-300">{card.description}</p>
          <div className="flex gap-2">
            <button className="rounded-md bg-gold-500 px-3 py-1.5 text-xs font-semibold text-chamber-950 transition-colors hover:bg-gold-400">
              Execute
            </button>
            <button className="rounded-md border border-chamber-600 px-3 py-1.5 text-xs font-semibold text-chamber-300 transition-colors hover:border-chamber-400 hover:text-chamber-100">
              Dismiss
            </button>
          </div>
        </div>
      );
    }

    if (content.type === 'evidence') {
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-chamber-400">
            Supporting Evidence
          </p>
          {content.items.map((ev, i) => (
            <div key={i} className="rounded-lg border border-chamber-700 bg-chamber-900/50 p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded bg-chamber-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-chamber-300">
                  Source
                </span>
                <span className="text-xs font-semibold text-chamber-100">{ev.source}</span>
              </div>
              <CredibilityBar score={ev.score} />
              <p className="mt-2 text-xs leading-relaxed text-chamber-300">{ev.summary}</p>
            </div>
          ))}
        </div>
      );
    }

    if (content.type === 'pipeline') {
      return (
        <div className="overflow-hidden rounded-lg border border-chamber-700">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-chamber-700 bg-chamber-800/60">
                <th className="px-3 py-2 font-semibold text-chamber-300">Client</th>
                <th className="px-3 py-2 font-semibold text-chamber-300">Offer</th>
                <th className="px-3 py-2 font-semibold text-chamber-300">Score</th>
                <th className="px-3 py-2 font-semibold text-chamber-300">Stage</th>
              </tr>
            </thead>
            <tbody>
              {content.items.map((item, i) => (
                <tr key={i} className="border-b border-chamber-800 last:border-0 hover:bg-chamber-800/40">
                  <td className="px-3 py-2 font-medium text-chamber-100">{item.client}</td>
                  <td className="px-3 py-2 text-chamber-300">{item.offer}</td>
                  <td className="px-3 py-2">
                    <ScoreBadge score={item.compositeScore} />
                  </td>
                  <td className="px-3 py-2 text-chamber-400">{item.stage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  // ─── Layout ─────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-chamber-950 text-chamber-100">
      {/* ── Left: Chat (70%) ──────────────────────────────────────────── */}
      <div className="flex w-[70%] flex-col border-r border-chamber-800">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-chamber-800 px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/15">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gold-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide">Command AI Console</h1>
            <p className="text-xs text-chamber-400">Your strategic advisor for HNW client management</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-emerald-400">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-chamber-800 text-chamber-100'
                    : 'border border-chamber-800 bg-chamber-900/60 text-chamber-200'
                }`}
              >
                {renderContent(msg)}
                {msg.role === 'ai' && (
                  <FeedbackButtons
                    feedback={msg.feedback ?? null}
                    onFeedback={(v) => handleFeedback(msg.id, v)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 overflow-x-auto px-6 pb-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => handleQuickAction(action)}
              className="shrink-0 rounded-full border border-chamber-700 bg-chamber-900 px-3 py-1.5 text-xs text-chamber-300 transition-colors hover:border-gold-500/40 hover:text-gold-400"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-chamber-800 px-6 py-4">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask your AI advisor..."
              rows={2}
              className="flex-1 resize-none rounded-lg border border-chamber-700 bg-chamber-900 px-4 py-2.5 text-sm text-chamber-100 placeholder-chamber-500 outline-none transition-colors focus:border-gold-500/50"
            />
            <button
              onClick={handleSend}
              className="self-end rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-chamber-950 transition-colors hover:bg-gold-400 disabled:opacity-40"
              disabled={!input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: Context Panel (30%) ────────────────────────────────── */}
      <div className="flex w-[30%] flex-col overflow-y-auto bg-chamber-950">
        <div className="border-b border-chamber-800 px-5 py-4">
          <h2 className="text-sm font-bold tracking-wide">Context Panel</h2>
          <p className="text-xs text-chamber-500">Live intelligence feed</p>
        </div>

        <div className="flex-1 space-y-5 px-5 py-4">
          {/* Active Clients */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-chamber-400">
                Active Clients
              </h3>
              <span className="rounded-full bg-chamber-800 px-1.5 py-0.5 text-[10px] font-bold text-chamber-300">
                {ACTIVE_CLIENTS.length}
              </span>
            </div>
            <div className="space-y-2">
              {ACTIVE_CLIENTS.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between rounded-lg border border-chamber-800 bg-chamber-900/40 px-3 py-2"
                >
                  <div>
                    <p className="text-xs font-medium text-chamber-100">{c.name}</p>
                    <p className="text-[10px] text-chamber-500">{c.aum} AUM</p>
                  </div>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      c.status === 'active' ? 'bg-emerald-500' : 'bg-gold-400'
                    }`}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Recent Offers */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-chamber-400">
                Recent Offers
              </h3>
              <span className="rounded-full bg-chamber-800 px-1.5 py-0.5 text-[10px] font-bold text-chamber-300">
                {RECENT_OFFERS.length}
              </span>
            </div>
            <div className="space-y-2">
              {RECENT_OFFERS.map((o) => (
                <div
                  key={o.name}
                  className="rounded-lg border border-chamber-800 bg-chamber-900/40 px-3 py-2"
                >
                  <p className="text-xs font-medium text-chamber-100">{o.name}</p>
                  <p className="text-[10px] text-chamber-500">
                    {o.client} &middot; {o.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Wealth Events */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-chamber-400">
                Wealth Events This Week
              </h3>
              <span className="rounded-full bg-chamber-800 px-1.5 py-0.5 text-[10px] font-bold text-chamber-300">
                {WEALTH_EVENTS.length}
              </span>
            </div>
            <div className="space-y-2">
              {WEALTH_EVENTS.map((ev) => (
                <div
                  key={ev.event}
                  className="flex items-center gap-2 rounded-lg border border-chamber-800 bg-chamber-900/40 px-3 py-2"
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      ev.type === 'meeting'
                        ? 'bg-blue-400'
                        : ev.type === 'deadline'
                          ? 'bg-red-400'
                          : 'bg-gold-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-chamber-100">{ev.event}</p>
                    <p className="text-[10px] text-chamber-500">{ev.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pending Actions */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-chamber-400">
                Pending Actions
              </h3>
              <span className="rounded-full bg-chamber-800 px-1.5 py-0.5 text-[10px] font-bold text-chamber-300">
                {PENDING_ACTIONS.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {PENDING_ACTIONS.map((a, i) => (
                <div key={i} className="flex items-center gap-2 px-1 py-1">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                  <p className="text-xs text-chamber-300">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Action History */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-chamber-400">
              Action History
            </h3>
            <div className="space-y-2">
              {ACTION_HISTORY.map((a, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-chamber-800 bg-chamber-900/40 px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-chamber-200">{a.action}</p>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        a.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : a.status === 'in-progress'
                            ? 'bg-gold-500/15 text-gold-400'
                            : 'bg-chamber-700 text-chamber-400'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-chamber-500">{a.timestamp}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
