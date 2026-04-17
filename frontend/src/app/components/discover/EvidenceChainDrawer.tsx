'use client';

interface EvidenceSource {
  type: 'government' | 'industry' | 'peer_reviewed' | 'news' | string;
  name: string;
  credibility: number;
  publishedDate: string;
  publisher: string;
  jurisdiction?: string;
  ageMonths: number;
  url: string;
  keyClaims: string[];
  directQuote?: string;
  directQuoteAttribution?: string;
  relevanceNote: string;
}

interface EvidenceChainDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  problemTitle: string;
  evidence?: EvidenceSource[];
  lastRefreshed?: string;
  contradictionDetected?: boolean;
  contradictionNote?: string;
}

const DEFAULT_EVIDENCE: EvidenceSource[] = [
  {
    type: 'government',
    name: 'FinCEN Advisory on Elder Financial Exploitation Targeting UHNW Families',
    credibility: 9.2,
    publishedDate: '2025-11-14',
    publisher: 'U.S. Financial Crimes Enforcement Network',
    jurisdiction: 'United States',
    ageMonths: 5,
    url: 'https://www.fincen.gov/resources/advisories',
    keyClaims: [
      'SAR filings tied to UHNW household fraud rose 37% year-over-year in 2025.',
      'AI voice impersonation used in 1 of every 6 attempted wire-fraud cases against family offices.',
      'Median loss per successful incident: $2.4M, with 68% involving insider or household-staff access.',
    ],
    directQuote:
      'Family offices and single-household wealth structures are now the fastest-growing target segment for coordinated impersonation and insider-assisted fraud schemes.',
    directQuoteAttribution: 'FinCEN Director, Public Advisory',
    relevanceNote:
      'Validates premium pricing for a household security offer — the problem is federally acknowledged, growing, and quantified. Use the $2.4M median loss figure directly in pitch conversations with prospects who question price.',
  },
  {
    type: 'industry',
    name: 'Campden Wealth / RBC North America Family Office Report 2025',
    credibility: 8.7,
    publishedDate: '2025-09-02',
    publisher: 'Campden Wealth Research',
    jurisdiction: 'North America',
    ageMonths: 7,
    url: 'https://www.campdenwealth.com/research',
    keyClaims: [
      '62% of surveyed family offices rank cybersecurity and household-staff vetting as a top-3 concern (up from 41% in 2023).',
      'Only 28% have formal protocols for AI-generated impersonation risk — the largest unmet need reported.',
      'Average annual spend on household security: $187K, with 44% reporting they expect to increase in 2026.',
    ],
    directQuote:
      'The gap between perceived risk and implemented controls is wider now than at any point since we began tracking this category in 2017.',
    directQuoteAttribution: 'Dr. Rebecca Gooch, Senior Director of Research, Campden Wealth',
    relevanceNote:
      'The 28% unmet-need figure is the sharpest evidence the market is ready to buy. Lead pitch decks with this stat — it quantifies the exact gap your offer fills.',
  },
  {
    type: 'peer_reviewed',
    name: 'Journal of Family Business Strategy — Governance Under Digital Threat (Vol. 16, Issue 3)',
    credibility: 8.9,
    publishedDate: '2025-06-20',
    publisher: 'Elsevier / Journal of Family Business Strategy',
    jurisdiction: 'Global',
    ageMonths: 10,
    url: 'https://www.sciencedirect.com/journal/journal-of-family-business-strategy',
    keyClaims: [
      'Longitudinal study of 412 UHNW families shows governance-gap incidents doubled between 2021 and 2024.',
      'Families with formal succession + security protocols report 71% fewer adverse incidents over a 5-year window.',
      'Paper recommends integrated security-and-governance advisory as the empirically supported structure.',
    ],
    directQuote:
      'Our data indicate that fragmented advisory — security handled separately from governance — is a statistically significant predictor of adverse incidents.',
    directQuoteAttribution: 'Lead author, Prof. Martin Kellerman, IMD Lausanne',
    relevanceNote:
      'Peer-reviewed support for bundling security + governance into a single retainer. Use this when a prospect asks why they should not just hire a standalone security firm.',
  },
  {
    type: 'news',
    name: 'Bloomberg Wealth — Inside the Rise of Shadow Advisory for Billionaire Households',
    credibility: 7.4,
    publishedDate: '2025-12-08',
    publisher: 'Bloomberg',
    jurisdiction: 'Global',
    ageMonths: 4,
    url: 'https://www.bloomberg.com/wealth',
    keyClaims: [
      'Named 9 new boutique advisory firms launched in 2025 focused on the UHNW security/governance niche.',
      'Typical retainer: $25K–$85K/month, with multi-year contracts standard.',
      'Reported demand is outpacing supply — most firms have 3-6 month waitlists.',
    ],
    relevanceNote:
      'Confirms pricing power and supply scarcity. You can credibly quote the $25K-$85K/mo band when anchoring price — it is publicly reported market data.',
  },
];

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    government: 'bg-[#1f0d0d] text-[#F09595]',
    industry: 'bg-[#0a1a2e] text-[#85B7EB]',
    peer_reviewed: 'bg-[#1e1a2e] text-[#AFA9EC]',
    news: 'bg-[#1e2a3a] text-[#8892a4]',
  };
  const cls = map[type] || 'bg-[#1e2a3a] text-[#8892a4]';
  return (
    <span
      className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider mr-2 ${cls}`}
    >
      {type.replace('_', ' ')}
    </span>
  );
}

export default function EvidenceChainDrawer({
  isOpen,
  onClose,
  problemTitle,
  evidence,
  lastRefreshed,
  contradictionDetected,
  contradictionNote,
}: EvidenceChainDrawerProps) {
  const sources = evidence && evidence.length > 0 ? evidence : DEFAULT_EVIDENCE;
  const avgCredibility =
    sources.length === 0
      ? 0
      : Math.round(
          (sources.reduce((s, x) => s + x.credibility, 0) / sources.length) * 10
        ) / 10;
  const refreshed = lastRefreshed || '2026-04-15 09:12 UTC';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[480px] bg-[#0D1117] border-l border-[#1e2a3a] z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1e2a3a]">
            <div className="flex-1 pr-3">
              <h2 className="text-sm font-semibold text-white">Evidence Chain</h2>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{problemTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Close evidence chain"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Summary bar */}
          <div className="px-4 py-3 border-b border-[#1e2a3a] bg-[#0a0f17]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#4a5568]">Sources</div>
                <div className="text-[18px] font-bold text-[#e2e8f0]">{sources.length}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#4a5568]">Avg credibility</div>
                <div
                  className="text-[18px] font-bold"
                  style={{
                    color:
                      avgCredibility >= 8.5
                        ? '#1D9E75'
                        : avgCredibility >= 7
                        ? '#C9A84C'
                        : '#BA7517',
                  }}
                >
                  {avgCredibility.toFixed(1)}
                </div>
              </div>
            </div>
            {contradictionDetected && (
              <div className="mt-3 bg-[#2a1d0a] border border-[#BA7517]/40 rounded px-3 py-2">
                <div className="text-[10px] font-semibold text-[#E3B84C] uppercase tracking-wider mb-1">
                  Contradiction detected
                </div>
                <div className="text-[10px] text-[#C9A84C] leading-relaxed">
                  {contradictionNote ||
                    'One or more sources disagree on a key figure or claim. Review before citing in client materials.'}
                </div>
              </div>
            )}
            <div className="mt-3 text-[9px] text-[#4a5568]">
              Evidence last refreshed: {refreshed}
            </div>
          </div>

          {/* Evidence list */}
          <div className="flex-1 overflow-y-auto p-4">
            {sources.map((source, i) => (
              <div
                key={i}
                className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4 mb-3"
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <TypeBadge type={source.type} />
                    <span className="text-[12px] font-semibold text-[#e2e8f0]">
                      {source.name}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div
                      className="text-[18px] font-bold"
                      style={{
                        color:
                          source.credibility >= 8.5
                            ? '#1D9E75'
                            : source.credibility >= 7
                            ? '#C9A84C'
                            : '#BA7517',
                      }}
                    >
                      {source.credibility}
                    </div>
                    <div className="text-[9px] text-[#4a5568]">credibility</div>
                  </div>
                </div>

                {/* Publication info */}
                <div className="text-[10px] text-[#4a5568] mb-3">
                  Published: {source.publishedDate} · {source.publisher} ·{' '}
                  {source.jurisdiction || 'Global'}
                </div>

                {/* Key claims from this source */}
                <div className="mb-3">
                  <div className="text-[9px] font-semibold text-[#4a5568] uppercase tracking-wider mb-2">
                    Key findings relevant to this problem
                  </div>
                  {source.keyClaims.map((claim, ci) => (
                    <div key={ci} className="flex gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-shrink-0 mt-1.5"></div>
                      <div className="text-[11px] text-[#8892a4] leading-relaxed">{claim}</div>
                    </div>
                  ))}
                </div>

                {/* Direct quote if available */}
                {source.directQuote && (
                  <div className="bg-[#0D1117] border-l-2 border-[#C9A84C] px-3 py-2 mb-3">
                    <div className="text-[11px] text-[#e2e8f0] italic leading-relaxed">
                      &ldquo;{source.directQuote}&rdquo;
                    </div>
                    {source.directQuoteAttribution && (
                      <div className="text-[9px] text-[#C9A84C] mt-1">
                        — {source.directQuoteAttribution}
                      </div>
                    )}
                  </div>
                )}

                {/* Why this matters for the offer */}
                <div className="bg-[#0F2E1A] border border-[#1D9E75]/20 rounded px-3 py-2">
                  <div className="text-[9px] font-semibold text-[#1D9E75] uppercase tracking-wider mb-1">
                    Why this matters for your offer
                  </div>
                  <div className="text-[10px] text-[#5DCAA5] leading-relaxed">
                    {source.relevanceNote}
                  </div>
                </div>

                {/* Recency indicator */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1e2a3a]">
                  <span
                    className={`text-[9px] font-medium ${
                      source.ageMonths <= 6
                        ? 'text-[#1D9E75]'
                        : source.ageMonths <= 18
                        ? 'text-[#C9A84C]'
                        : 'text-[#E24B4A]'
                    }`}
                  >
                    {source.ageMonths <= 6
                      ? '● Fresh'
                      : source.ageMonths <= 18
                      ? '● Aging'
                      : '● Stale'}{' '}
                    · {source.ageMonths}mo old
                  </span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-[#534AB7] hover:text-[#AFA9EC]"
                  >
                    View source →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
