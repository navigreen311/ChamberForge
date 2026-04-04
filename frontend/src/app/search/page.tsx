'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

/* ── Inline Data ─────────────────────────────────────────────────── */

interface Problem     { id: string; type: 'problem';      title: string; categories: string[]; urgency: 'Critical'|'High'|'Medium'|'Low'; lifecycle: string }
interface Offer       { id: string; type: 'offer';        name: string; client: string; status: 'Active'|'Draft'|'Paused'; monthly: string }
interface Client      { id: string; type: 'client';       name: string; company: string; tier: 'Platinum'|'Gold'|'Silver'; health: number }
interface Playbook    { id: string; type: 'playbook';     name: string; target: string; priceRange: string }
interface Deliverable { id: string; type: 'deliverable';  name: string; client: string; status: 'In Progress'|'Review'|'Complete'; due: string }
interface Evidence    { id: string; type: 'evidence';     claim: string; source: string; credibility: 'High'|'Medium'|'Low' }
interface Partner     { id: string; type: 'partner';      name: string; specialty: string; jurisdiction: string }

type SearchItem = Problem | Offer | Client | Playbook | Deliverable | Evidence | Partner;

const ALL_DATA: SearchItem[] = [
  // Problems (3)
  { id: 'p1', type: 'problem', title: 'Cross-border coordination delays', categories: ['Operations', 'Compliance'], urgency: 'Critical', lifecycle: 'Active' },
  { id: 'p2', type: 'problem', title: 'Team coordination breakdown in M&A pipeline', categories: ['Deal Flow', 'HR'], urgency: 'High', lifecycle: 'Investigating' },
  { id: 'p3', type: 'problem', title: 'Coordination of multi-jurisdiction filings', categories: ['Legal', 'Tax'], urgency: 'Medium', lifecycle: 'Monitoring' },
  // Offers (2)
  { id: 'o1', type: 'offer', name: 'Strategic Coordination Package', client: 'Meridian Holdings', status: 'Active', monthly: '$24,500' },
  { id: 'o2', type: 'offer', name: 'Coordination & Compliance Suite', client: 'Atlas Partners', status: 'Draft', monthly: '$18,000' },
  // Clients (2)
  { id: 'c1', type: 'client', name: 'Victoria Chen', company: 'Coordination Capital LLC', tier: 'Platinum', health: 94 },
  { id: 'c2', type: 'client', name: 'Marcus Webb', company: 'Global Coordination Group', tier: 'Gold', health: 78 },
  // Playbooks (1)
  { id: 'pb1', type: 'playbook', name: 'HNW Coordination Playbook', target: 'Ultra-HNW families', priceRange: '$15K - $50K/mo' },
  // Deliverables (1)
  { id: 'd1', type: 'deliverable', name: 'Q2 Coordination Report', client: 'Meridian Holdings', status: 'In Progress', due: '2026-04-18' },
  // Evidence (2)
  { id: 'e1', type: 'evidence', claim: 'Improved coordination reduced operational costs by 34% across multi-family offices', source: 'Deloitte Private Wealth 2025', credibility: 'High' },
  { id: 'e2', type: 'evidence', claim: 'Lack of coordination cited as top pain point by 68% of HNW clients', source: 'Capgemini World Wealth Report', credibility: 'High' },
  // Partners (1)
  { id: 'pt1', type: 'partner', name: 'Hargrove & Associates', specialty: 'Cross-border coordination', jurisdiction: 'UK / Cayman Islands' },
];

const TYPE_LABELS: Record<string, string> = {
  problem: 'Problems', offer: 'Offers', client: 'Clients',
  playbook: 'Playbooks', deliverable: 'Deliverables', evidence: 'Evidence', partner: 'Partners',
};
const TYPE_COLORS: Record<string, string> = {
  problem: 'bg-red-500/20 text-red-400 border-red-500/30',
  offer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  client: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  playbook: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  deliverable: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  evidence: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  partner: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};
const ROUTES: Record<string, string> = {
  problem: '/discover', offer: '/offers', client: '/clients',
  playbook: '/playbooks', deliverable: '/deliver', evidence: '/qualify', partner: '/sell',
};

function matchesQuery(item: SearchItem, q: string): boolean {
  const low = q.toLowerCase();
  return JSON.stringify(item).toLowerCase().includes(low);
}

/* ── Pills / Badges ──────────────────────────────────────────────── */

function UrgencyDot({ u }: { u: string }) {
  const c = u === 'Critical' ? 'bg-red-500' : u === 'High' ? 'bg-orange-500' : u === 'Medium' ? 'bg-yellow-500' : 'bg-green-500';
  return <span className="flex items-center gap-1.5 text-xs text-zinc-400"><span className={`w-2 h-2 rounded-full ${c}`} />{u}</span>;
}

function Pill({ label, variant }: { label: string; variant: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400', draft: 'bg-zinc-600/40 text-zinc-400',
    paused: 'bg-amber-500/20 text-amber-400', progress: 'bg-blue-500/20 text-blue-400',
    review: 'bg-purple-500/20 text-purple-400', complete: 'bg-emerald-500/20 text-emerald-400',
    lifecycle: 'bg-indigo-500/20 text-indigo-400',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[variant] || 'bg-zinc-700 text-zinc-400'}`}>{label}</span>;
}

function TierBadge({ tier }: { tier: string }) {
  const c = tier === 'Platinum' ? 'text-violet-400 bg-violet-500/20' : tier === 'Gold' ? 'text-yellow-400 bg-yellow-500/20' : 'text-zinc-400 bg-zinc-600/30';
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${c}`}>{tier}</span>;
}

function HealthBar({ value }: { value: number }) {
  const c = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-zinc-700 rounded-full overflow-hidden"><div className={`h-full rounded-full ${c}`} style={{ width: `${value}%` }} /></div>
      <span className="text-xs text-zinc-400">{value}%</span>
    </div>
  );
}

function CredBadge({ level }: { level: string }) {
  const c = level === 'High' ? 'text-emerald-400' : level === 'Medium' ? 'text-yellow-400' : 'text-red-400';
  return <span className={`text-xs font-medium ${c}`}>{level} credibility</span>;
}

/* ── Quick View Modal ────────────────────────────────────────────── */

function QuickView({ item, onClose }: { item: SearchItem; onClose: () => void }) {
  const router = useRouter();
  const route = `${ROUTES[item.type]}/${item.id}`;

  const details: [string, string][] = (() => {
    switch (item.type) {
      case 'problem':     return [['Title', item.title], ['Categories', item.categories.join(', ')], ['Urgency', item.urgency], ['Lifecycle', item.lifecycle]];
      case 'offer':       return [['Name', item.name], ['Client', item.client], ['Status', item.status], ['Monthly', item.monthly]];
      case 'client':      return [['Name', item.name], ['Company', item.company], ['Tier', item.tier], ['Health', `${item.health}%`]];
      case 'playbook':    return [['Name', item.name], ['Target', item.target], ['Price Range', item.priceRange]];
      case 'deliverable': return [['Name', item.name], ['Client', item.client], ['Status', item.status], ['Due', item.due]];
      case 'evidence':    return [['Claim', item.claim], ['Source', item.source], ['Credibility', item.credibility]];
      case 'partner':     return [['Name', item.name], ['Specialty', item.specialty], ['Jurisdiction', item.jurisdiction]];
      default:            return [];
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg mx-4 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide ${TYPE_COLORS[item.type]}`}>{TYPE_LABELS[item.type]?.replace(/s$/, '')}</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition text-xl leading-none">&times;</button>
        </div>
        <dl className="space-y-3">
          {details.map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="text-xs uppercase tracking-wide text-zinc-500 w-28 shrink-0 pt-0.5">{k}</dt>
              <dd className="text-sm text-zinc-200">{v}</dd>
            </div>
          ))}
        </dl>
        <button onClick={() => router.push(route)} className="mt-6 w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold text-sm transition">
          Go to full page &rarr;
        </button>
      </div>
    </div>
  );
}

/* ── Result Card ─────────────────────────────────────────────────── */

function ResultCard({ item, onQuickView }: { item: SearchItem; onQuickView: () => void }) {
  const router = useRouter();
  const route = `${ROUTES[item.type]}/${item.id}`;

  return (
    <div className="group bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 transition cursor-pointer flex items-start justify-between gap-3" onClick={() => router.push(route)}>
      <div className="flex-1 min-w-0">
        {item.type === 'problem' && (
          <>
            <p className="text-white font-semibold truncate">{item.title}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {item.categories.map(c => <span key={c} className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">{c}</span>)}
              <UrgencyDot u={item.urgency} />
              <Pill label={item.lifecycle} variant="lifecycle" />
            </div>
          </>
        )}
        {item.type === 'offer' && (
          <>
            <p className="text-white font-semibold truncate">{item.name}</p>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-400">
              <span>{item.client}</span>
              <Pill label={item.status} variant={item.status.toLowerCase()} />
              <span className="text-emerald-400 font-medium">{item.monthly}/mo</span>
            </div>
          </>
        )}
        {item.type === 'client' && (
          <>
            <p className="text-white font-semibold">{item.name}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-sm text-zinc-400">{item.company}</span>
              <TierBadge tier={item.tier} />
              <HealthBar value={item.health} />
            </div>
          </>
        )}
        {item.type === 'playbook' && (
          <>
            <p className="text-white font-semibold">{item.name}</p>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-400">
              <span>Target: {item.target}</span>
              <span className="text-amber-400 font-medium">{item.priceRange}</span>
            </div>
          </>
        )}
        {item.type === 'deliverable' && (
          <>
            <p className="text-white font-semibold">{item.name}</p>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-400">
              <span>{item.client}</span>
              <Pill label={item.status} variant={item.status === 'In Progress' ? 'progress' : item.status === 'Review' ? 'review' : 'complete'} />
              <span>Due {item.due}</span>
            </div>
          </>
        )}
        {item.type === 'evidence' && (
          <>
            <p className="text-white font-semibold line-clamp-2">&ldquo;{item.claim}&rdquo;</p>
            <div className="flex items-center gap-3 mt-1.5 text-sm">
              <span className="text-zinc-400">{item.source}</span>
              <CredBadge level={item.credibility} />
            </div>
          </>
        )}
        {item.type === 'partner' && (
          <>
            <p className="text-white font-semibold">{item.name}</p>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-400">
              <span>{item.specialty}</span>
              <span className="text-cyan-400">{item.jurisdiction}</span>
            </div>
          </>
        )}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onQuickView(); }}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:border-zinc-500"
      >
        Quick view
      </button>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────── */

const ALL_TYPES = Object.keys(TYPE_LABELS);

export default function SearchPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('coordination');
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(new Set(ALL_TYPES));
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [preview, setPreview] = useState<SearchItem | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    return ALL_DATA.filter(item => enabledTypes.has(item.type) && matchesQuery(item, query));
  }, [query, enabledTypes]);

  const grouped = useMemo(() => {
    const map: Record<string, SearchItem[]> = {};
    for (const item of filtered) {
      (map[item.type] ??= []).push(item);
    }
    return map;
  }, [filtered]);

  const toggleType = (t: string) => {
    setEnabledTypes(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of filtered) counts[item.type] = (counts[item.type] || 0) + 1;
    return counts;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search across all entities..."
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-xl pl-12 pr-5 py-4 text-lg text-white placeholder-zinc-500 outline-none transition"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition text-sm">Clear</button>
            )}
          </div>
          {query.trim() && (
            <p className="mt-3 text-sm text-zinc-400">
              <span className="text-white font-semibold">{filtered.length} results</span> for &ldquo;{query}&rdquo;
              {Object.keys(categoryCounts).length > 0 && (
                <span className="ml-2 text-zinc-500">
                  ({Object.entries(categoryCounts).map(([t, n], i) => (
                    <span key={t}>{i > 0 && ', '}{n} {TYPE_LABELS[t]}</span>
                  ))})
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex gap-6 p-6">
        {/* Sidebar Filters */}
        <aside className="w-56 shrink-0 space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">Type</h3>
            <div className="space-y-1.5">
              {ALL_TYPES.map(t => (
                <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enabledTypes.has(t)}
                    onChange={() => toggleType(t)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm text-zinc-300 group-hover:text-white transition flex-1">{TYPE_LABELS[t]}</span>
                  {categoryCounts[t] && <span className="text-xs text-zinc-600">{categoryCounts[t]}</span>}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">Date Range</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-zinc-500">From</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:border-amber-500 outline-none mt-0.5" />
              </div>
              <div>
                <label className="text-xs text-zinc-500">To</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:border-amber-500 outline-none mt-0.5" />
              </div>
            </div>
          </div>

          {(enabledTypes.size < ALL_TYPES.length || dateFrom || dateTo) && (
            <button
              onClick={() => { setEnabledTypes(new Set(ALL_TYPES)); setDateFrom(''); setDateTo(''); }}
              className="text-xs text-amber-400 hover:text-amber-300 transition"
            >
              Reset filters
            </button>
          )}
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0 space-y-8">
          {!query.trim() && (
            <div className="text-center py-24 text-zinc-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <p className="text-lg">Search across problems, offers, clients, and more</p>
            </div>
          )}

          {query.trim() && filtered.length === 0 && (
            <div className="text-center py-24 text-zinc-500">
              <p className="text-lg">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-sm mt-1">Try a different search term or adjust filters</p>
            </div>
          )}

          {Object.entries(grouped).map(([type, items]) => (
            <section key={type}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide border ${TYPE_COLORS[type]}`}>
                  {TYPE_LABELS[type]}
                </span>
                <span className="text-xs text-zinc-500">{items.length} result{items.length > 1 ? 's' : ''}</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>
              <div className="space-y-2">
                {items.map(item => (
                  <ResultCard key={item.id} item={item} onQuickView={() => setPreview(item)} />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      {/* Quick View Modal */}
      {preview && <QuickView item={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
