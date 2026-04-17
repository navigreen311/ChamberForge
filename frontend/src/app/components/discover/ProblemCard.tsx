'use client';

interface ProblemData {
  title: string;
  compositeScore: number;
  tier: string;
  lifecycle: string;
  credibility: number;
  urgency: number;
  wtp: number;
  wtpRange: string;
  citations: number;
  timestamp: string;
  painCategory?: string;
}

interface ProblemCardProps {
  problem: ProblemData;
  onViewEvidence?: () => void;
}

const tierColors: Record<string, string> = {
  UHNW: 'bg-[#C9A84C]/20 text-[#C9A84C]',
  HNW: 'bg-purple-900/30 text-purple-400',
  Affluent: 'bg-blue-900/30 text-blue-400',
  'Mass Affluent': 'bg-gray-800 text-gray-400',
};

const lifecycleColors: Record<string, string> = {
  Emerging: 'bg-blue-900/30 text-blue-400',
  Accelerating: 'bg-emerald-900/30 text-emerald-400',
  Proven: 'bg-purple-900/30 text-purple-400',
  Saturated: 'bg-gray-800 text-gray-400',
  Declining: 'bg-red-900/30 text-red-400',
};

const painCategoryColors: Record<string, string> = {
  Security: 'bg-red-900/30 text-red-400',
  Coordination: 'bg-blue-900/30 text-blue-400',
  Privacy: 'bg-purple-900/30 text-purple-400',
  Governance: 'bg-amber-900/30 text-amber-400',
  Medical: 'bg-emerald-900/30 text-emerald-400',
  Travel: 'bg-cyan-900/30 text-cyan-400',
};

const lifecycleTooltips: Record<string, string> = {
  Emerging:
    'This problem is newly appearing — fewer than 3 years of strong evidence. Early movers win premium positioning and face little competition. High risk, high reward.',
  Accelerating:
    'Growing fast right now — evidence volume and urgency scores increasing month over month. The best time to build an offer. Competition still manageable.',
  Proven:
    'Well-established problem with a clear market. Multiple providers exist but the UHNW market is large enough for specialists. Easier client conversations, more established pricing.',
  Saturated:
    'Many providers competing. Requires strong differentiation or niche specialization to win. Price pressure is higher. Consider a sub-niche angle.',
  Declining:
    'Problem losing urgency due to regulatory changes, technology, or market saturation. Exercise caution — short retainer windows likely.',
};

const tierTooltips: Record<string, string> = {
  UHNW:
    'Ultra High Net Worth — clients with $30M+ in investable assets. Typically family offices, dynastic wealth, or recent liquidity events. Highest willingness to pay, expect white-glove service.',
  HNW:
    'High Net Worth — clients with $1M-$30M in investable assets. Often successful professionals, business owners, or pre-exit founders. Strong willingness to pay for specialized expertise.',
  Affluent:
    'Affluent — clients with $250K-$1M in investable assets. Price-sensitive relative to HNW/UHNW; offers typically productized rather than custom.',
  'Mass Affluent':
    'Mass Affluent — clients with $100K-$250K in investable assets. Highest price sensitivity; scale through digital delivery.',
};

const painCategoryTooltips: Record<string, string> = {
  Security:
    'Cyber threats, physical security, AI impersonation, fraud prevention, household surveillance risks',
  Coordination:
    'Managing complex multi-entity households, vendors, staff, properties, travel, and schedules',
  Privacy:
    'Digital footprint reduction, data broker removal, personal information exposure, identity protection',
  Governance:
    'Succession planning, family governance, trust structures, next-gen wealth education',
  Medical:
    'Concierge health navigation, specialist access, international medical coordination, health records',
  Travel:
    'High-risk destination preparation, logistics, security briefings, medical evacuation planning',
};

function BadgeWithTooltip({
  label,
  colorClass,
  title,
  body,
}: {
  label: string;
  colorClass: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative group">
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold cursor-help ${colorClass}`}
      >
        {label}
      </span>
      <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#111827] border border-[#1e2a3a] rounded-lg p-3 text-[10px] text-[#8892a4] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-xl">
        <div className="font-semibold text-[#e2e8f0] mb-1">{title}</div>
        {body}
        <div className="absolute top-full left-4 border-4 border-transparent border-t-[#1e2a3a]"></div>
      </div>
    </div>
  );
}

function EvidenceBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 w-[80px] text-right">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-400 w-6 text-right">{value}</span>
    </div>
  );
}

export default function ProblemCard({ problem, onViewEvidence }: ProblemCardProps) {
  const tierColor = tierColors[problem.tier] || 'bg-gray-800 text-gray-400';
  const lifecycleColor =
    lifecycleColors[problem.lifecycle] || 'bg-gray-800 text-gray-400';
  const tierTip =
    tierTooltips[problem.tier] ||
    'Client tier describes the asset bracket of the target buyer. Pricing and delivery model typically scale with tier.';
  const lifecycleTip =
    lifecycleTooltips[problem.lifecycle] ||
    'Lifecycle indicates where this problem sits on the adoption curve.';

  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4 space-y-3 hover:border-[#2a3a4a] transition-colors">
      {/* Title + Score */}
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium text-white leading-snug flex-1 pr-3">
          {problem.title}
        </h3>
        <span className="text-lg font-semibold text-[#C9A84C] shrink-0">
          {problem.compositeScore}
        </span>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <BadgeWithTooltip
          label={problem.tier}
          colorClass={tierColor}
          title={problem.tier}
          body={tierTip}
        />
        <BadgeWithTooltip
          label={problem.lifecycle}
          colorClass={lifecycleColor}
          title={problem.lifecycle}
          body={lifecycleTip}
        />
        {problem.painCategory && (
          <BadgeWithTooltip
            label={problem.painCategory}
            colorClass={
              painCategoryColors[problem.painCategory] || 'bg-gray-800 text-gray-400'
            }
            title={problem.painCategory}
            body={
              painCategoryTooltips[problem.painCategory] ||
              'Pain category groups problems by the operational area they affect.'
            }
          />
        )}
      </div>

      {/* Evidence Bars */}
      <div className="space-y-1.5">
        <EvidenceBar label="Credibility" value={problem.credibility} color="bg-blue-500" />
        <EvidenceBar label="Urgency" value={problem.urgency} color="bg-amber-500" />
        <EvidenceBar label="WTP" value={problem.wtp} color="bg-emerald-500" />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-[10px] text-gray-500">
        <span>WTP: {problem.wtpRange}</span>
        <span>{problem.citations} citations</span>
        <span>{problem.timestamp}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onViewEvidence}
          className="text-[11px] text-[#C9A84C] hover:text-[#d4b65c] transition-colors"
        >
          View Evidence
        </button>
        <button className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
          Compare
        </button>
        <button className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
          Track
        </button>
      </div>
    </div>
  );
}
