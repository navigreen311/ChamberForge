"use client";

import { useRouter } from "next/navigation";

interface Opportunity {
  problem_id?: string;
  problem_name: string;
  offer_name: string;
  probability: number;
  impact_score: number;
  weighted_score: number;
  recommended_action: string;
}

function ScoreBadge({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? value / max : 0;
  const color =
    pct >= 0.7
      ? "text-green-400"
      : pct >= 0.4
        ? "text-yellow-400"
        : "text-red-400";

  return <span className={`font-semibold ${color}`}>{value.toFixed(1)}</span>;
}

export default function OpportunityRanker({
  opportunities,
}: {
  opportunities: Opportunity[];
}) {
  const router = useRouter();

  if (opportunities.length === 0) {
    return (
      <div className="rounded-xl border border-chamber-700 bg-chamber-900 p-4 text-center text-chamber-400">
        No opportunities ranked yet
      </div>
    );
  }

  const handleRowClick = (opp: Opportunity) => {
    if (opp.problem_id) {
      router.push(`/discover/${opp.problem_id}`);
    }
  };

  return (
    <div className="rounded-xl border border-chamber-700 bg-chamber-900 overflow-hidden">
      <h3 className="px-4 py-3 text-sm font-semibold uppercase tracking-wider text-chamber-400 border-b border-chamber-700">
        Opportunity Ranker
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-chamber-700 text-xs uppercase text-chamber-400">
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Problem</th>
              <th className="px-4 py-2 text-left">Offer</th>
              <th className="px-4 py-2 text-right">Prob.</th>
              <th className="px-4 py-2 text-right">Impact</th>
              <th className="px-4 py-2 text-right">Score</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp, i) => (
              <tr
                key={opp.problem_id ?? i}
                onClick={() => handleRowClick(opp)}
                className={`border-b border-chamber-800 hover:bg-chamber-800/50 transition ${opp.problem_id ? "cursor-pointer" : ""}`}
              >
                <td className="px-4 py-2 text-chamber-400">{i + 1}</td>
                <td className="px-4 py-2 text-white">{opp.problem_name}</td>
                <td className="px-4 py-2 text-chamber-200">{opp.offer_name}</td>
                <td className="px-4 py-2 text-right text-chamber-300">
                  {(opp.probability * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-2 text-right">
                  <ScoreBadge value={opp.impact_score} max={10} />
                </td>
                <td className="px-4 py-2 text-right">
                  <ScoreBadge value={opp.weighted_score} max={10} />
                </td>
                <td className="px-4 py-2">
                  <button className="rounded bg-gold-500/20 px-2.5 py-1 text-xs font-semibold text-gold-300 hover:bg-gold-500/30 transition">
                    {opp.recommended_action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
