'use client';

interface EvidenceItem {
  type: string;
  source: string;
  claim: string;
  credibility: number;
  isStale: boolean;
  date: string;
}

interface EvidenceChainDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  problemTitle: string;
  evidence: EvidenceItem[];
}

const typeBadgeColors: Record<string, string> = {
  survey: 'bg-blue-900/30 text-blue-400',
  interview: 'bg-purple-900/30 text-purple-400',
  market: 'bg-emerald-900/30 text-emerald-400',
  regulatory: 'bg-amber-900/30 text-amber-400',
};

export default function EvidenceChainDrawer({
  isOpen,
  onClose,
  problemTitle,
  evidence,
}: EvidenceChainDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
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
              <h2 className="text-sm font-semibold text-white">
                Evidence Chain
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {problemTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Evidence list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {evidence.map((item, i) => (
              <div
                key={i}
                className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      typeBadgeColors[item.type] || 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {item.source}
                  </span>
                  {item.isStale && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-400">
                      Stale
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {item.claim}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">Credibility</span>
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.min(item.credibility, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {item.credibility}
                  </span>
                </div>
                <span className="text-[10px] text-gray-600">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
