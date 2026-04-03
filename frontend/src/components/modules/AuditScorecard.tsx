"use client";

interface Dimension {
  name: string;
  status: "PASS" | "WARN" | "FAIL";
  score: number;
  findings: string[];
  recommendations: string[];
}

interface AuditResult {
  overall_status: "PASS" | "WARN" | "FAIL";
  score: number;
  dimensions: Dimension[];
}

interface AuditScorecardProps {
  result: AuditResult;
}

const STATUS_CONFIG = {
  PASS: { color: "text-green-400", bg: "bg-green-500", barBg: "bg-green-900/30", border: "border-green-800" },
  WARN: { color: "text-amber-400", bg: "bg-amber-500", barBg: "bg-amber-900/30", border: "border-amber-800" },
  FAIL: { color: "text-red-400", bg: "bg-red-500", barBg: "bg-red-900/30", border: "border-red-800" },
};

const DIMENSION_LABELS: Record<string, string> = {
  compliance_check: "Compliance",
  delivery_fragility: "Delivery Fragility",
  margin_stress: "Margin Stress",
  competitive_vulnerability: "Competitive Vulnerability",
  reputation_risk: "Reputation Risk",
};

export default function AuditScorecard({ result }: AuditScorecardProps) {
  const overallConfig = STATUS_CONFIG[result.overall_status];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-chamber-900 border border-chamber-700 rounded-xl p-6 text-center">
        <p className="text-chamber-400 text-sm mb-2">Overall Audit Score</p>
        <div className="flex items-center justify-center gap-4">
          <span className={`text-5xl font-bold ${overallConfig.color}`}>
            {result.score}
          </span>
          <span
            className={`px-4 py-2 rounded-lg text-lg font-bold ${overallConfig.barBg} ${overallConfig.color} border ${overallConfig.border}`}
          >
            {result.overall_status}
          </span>
        </div>
      </div>

      {/* Dimension Cards */}
      <div className="space-y-4">
        {result.dimensions.map((dim) => {
          const config = STATUS_CONFIG[dim.status];
          return (
            <div
              key={dim.name}
              className={`bg-chamber-900 border rounded-xl p-5 ${config.border}`}
            >
              {/* Header with score bar */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold">
                    {DIMENSION_LABELS[dim.name] || dim.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${config.barBg} ${config.color}`}
                  >
                    {dim.status}
                  </span>
                </div>
                <span className={`text-2xl font-bold ${config.color}`}>
                  {dim.score}
                </span>
              </div>

              {/* Score bar */}
              <div className="w-full bg-chamber-800 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all ${config.bg}`}
                  style={{ width: `${Math.min(dim.score, 100)}%` }}
                />
              </div>

              {/* Findings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-chamber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Findings
                  </h4>
                  <ul className="space-y-1">
                    {dim.findings.map((f, i) => (
                      <li
                        key={i}
                        className="text-chamber-300 text-sm flex items-start gap-2"
                      >
                        <span className={`mt-1 ${config.color}`}>&#9679;</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-chamber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Recommendations
                  </h4>
                  <ul className="space-y-1">
                    {dim.recommendations.map((r, i) => (
                      <li
                        key={i}
                        className="text-chamber-300 text-sm flex items-start gap-2"
                      >
                        <span className="text-blue-400 mt-1">&#9656;</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
