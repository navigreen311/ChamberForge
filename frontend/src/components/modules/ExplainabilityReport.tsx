"use client";

interface EvidenceEntry {
  source: string;
  claim: string;
  credibility: number;
  freshness: number;
}

interface ReportData {
  evidence_chain: EvidenceEntry[];
  confidence_score: number;
  recommendation_basis: string;
}

interface ExplainabilityReportProps {
  report: ReportData;
}

/**
 * Evidence chain visualization with confidence score bar.
 * Shows each source's claim, credibility rating, and freshness decay.
 */
export default function ExplainabilityReport({ report }: ExplainabilityReportProps) {
  const confidencePct = Math.round(report.confidence_score * 100);

  const confidenceColor =
    confidencePct >= 70
      ? "bg-emerald-500"
      : confidencePct >= 40
      ? "bg-amber-500"
      : "bg-red-500";

  const confidenceTextColor =
    confidencePct >= 70
      ? "text-emerald-400"
      : confidencePct >= 40
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="space-y-6">
      {/* Confidence Score Bar */}
      <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider">
            Confidence Score
          </h3>
          <span className={`text-2xl font-mono font-bold ${confidenceTextColor}`}>
            {confidencePct}%
          </span>
        </div>
        <div className="w-full bg-chamber-800 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${confidenceColor}`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
        <p className="text-xs text-chamber-500 mt-2">{report.recommendation_basis}</p>
      </div>

      {/* Evidence Chain */}
      <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider mb-4">
          Evidence Chain
        </h3>
        <div className="space-y-4">
          {report.evidence_chain.map((entry, i) => {
            const credPct = Math.round(entry.credibility * 100);
            return (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < report.evidence_chain.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-px bg-chamber-700 -mb-4" />
                )}
                <div className="flex items-start gap-4">
                  {/* Node */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      credPct >= 75
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : credPct >= 50
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white">{entry.source}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-chamber-500">
                          Credibility:{" "}
                          <span
                            className={`font-mono ${
                              credPct >= 75
                                ? "text-emerald-400"
                                : credPct >= 50
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                          >
                            {credPct}%
                          </span>
                        </span>
                        <span className="text-xs text-chamber-500">
                          Decay:{" "}
                          <span className="text-chamber-300 font-mono">
                            {(entry.freshness * 100).toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-chamber-300 mt-1">{entry.claim}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
