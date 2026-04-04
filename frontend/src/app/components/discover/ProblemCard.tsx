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
      <span className="text-[10px] text-gray-500 w-[80px] text-right">
        {label}
      </span>
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
      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${
            tierColors[problem.tier] || 'bg-gray-800 text-gray-400'
          }`}
        >
          {problem.tier}
        </span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${
            lifecycleColors[problem.lifecycle] || 'bg-gray-800 text-gray-400'
          }`}
        >
          {problem.lifecycle}
        </span>
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
