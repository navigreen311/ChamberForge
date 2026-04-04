'use client'

import { useEffect, useState } from 'react'

interface Opportunity {
  rank: number
  problem: string
  tier: 'UHNW' | 'HNW'
  lifecycle: 'Emerging' | 'Accelerating' | 'Proven' | 'Saturated'
  offer: string | null
  probability: number
  impact: number
  composite: number
  stage: 'validate' | 'build' | 'review' | 'close'
}

const lifecycleStyles: Record<string, string> = {
  Emerging: 'bg-blue-900/50 text-blue-400',
  Accelerating: 'bg-emerald-900/50 text-emerald-400',
  Proven: 'bg-purple-900/50 text-purple-400',
  Saturated: 'bg-gray-800 text-gray-400',
}

const stageLabels: Record<string, string> = {
  validate: 'Validate problem',
  build: 'Build offer',
  review: 'Schedule review',
  close: 'Close deal',
}

export default function OpportunityRanker() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])

  useEffect(() => {
    fetch('/api/opportunities/ranked')
      .then((res) => res.json())
      .then(setOpportunities)
      .catch(console.error)
  }, [])

  return (
    <div>
      <h2 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
        OPPORTUNITY PIPELINE
      </h2>
      <div className="w-full bg-[#111827] rounded-lg border border-[#1e2a3a] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0D1117]">
              {['#', 'Problem', 'Tier', 'Lifecycle', 'Offer', 'Probability', 'Impact', 'Score', 'Action'].map(
                (col) => (
                  <th
                    key={col}
                    className="text-[10px] uppercase tracking-wider text-gray-500 px-4 py-3 text-left font-medium"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => (
              <tr
                key={opp.rank}
                className="border-t border-[#1e2a3a] hover:bg-[#1e2a3a]/50 transition"
              >
                <td className="px-4 py-3 text-gray-500 text-sm">{opp.rank}</td>
                <td className="px-4 py-3 text-white text-sm font-medium">{opp.problem}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      opp.tier === 'UHNW'
                        ? 'border-[#C9A84C] text-[#C9A84C]'
                        : 'border-blue-400 text-blue-400'
                    }`}
                  >
                    {opp.tier}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${lifecycleStyles[opp.lifecycle]}`}
                  >
                    {opp.lifecycle}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {opp.offer ? (
                    <span className="text-gray-300">{opp.offer}</span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{opp.probability}%</span>
                    <div className="w-12 h-1 bg-gray-700 rounded">
                      <div
                        className="h-1 bg-[#C9A84C] rounded"
                        style={{ width: `${opp.probability}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-sm ${
                      opp.impact > 8
                        ? 'text-red-400'
                        : opp.impact >= 6
                        ? 'text-amber-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {opp.impact}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-[#C9A84C]">
                  {opp.composite}
                </td>
                <td className="px-4 py-3">
                  <button className="text-[11px] text-[#C9A84C] hover:underline cursor-pointer">
                    {stageLabels[opp.stage]}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
