"use client";

interface Brief {
  client_name: string;
  generated_at: string;
  summary: string;
  key_facts: string[];
  talking_points: string[];
  complexity_map: {
    wealth_tier: string;
    entities_count: number;
    jurisdictions: string[];
    active_risks: string[];
  };
}

interface IntelBriefCardProps {
  brief: Brief;
}

/**
 * Compact card showing key facts and talking points — suitable for
 * mobile views and dashboard summaries.
 */
export default function IntelBriefCard({ brief }: IntelBriefCardProps) {
  return (
    <div className="bg-chamber-900 border border-chamber-700 rounded-xl p-5 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">{brief.client_name}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">
          {brief.complexity_map.wealth_tier}
        </span>
      </div>

      {/* Key facts — show top 3 */}
      <div className="mb-3">
        <p className="text-chamber-500 text-xs uppercase mb-1">Key Facts</p>
        <ul className="space-y-1">
          {brief.key_facts.slice(0, 3).map((f, i) => (
            <li key={i} className="text-chamber-300 text-sm flex items-start gap-2">
              <span className="text-gold-400">•</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Talking points — show top 2 */}
      <div>
        <p className="text-chamber-500 text-xs uppercase mb-1">Talking Points</p>
        <ol className="space-y-1">
          {brief.talking_points.slice(0, 2).map((tp, i) => (
            <li key={i} className="text-chamber-300 text-sm flex items-start gap-2">
              <span className="text-gold-400 font-semibold">{i + 1}.</span>
              {tp}
            </li>
          ))}
        </ol>
      </div>

      <p className="text-chamber-600 text-xs mt-3">
        Generated {new Date(brief.generated_at).toLocaleDateString()}
      </p>
    </div>
  );
}
