'use client';

import { useEffect, useState } from 'react';
import EvidenceDrawer from './EvidenceDrawer';

interface ClientTag {
  id: string;
  name: string;
}

interface EvidenceItem {
  source: string;
  credibility: number;
  claim: string;
  type: 'regulatory' | 'industry_report' | 'internal';
}

interface CommandAIData {
  priority: string;
  confidence: number;
  title: string;
  description: string;
  rationale: string;
  client_tags: ClientTag[];
  estimated_impact: string;
  evidence_chain: EvidenceItem[];
}

export default function CommandAICard() {
  const [data, setData] = useState<CommandAIData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetch('/api/command-ai/next-action')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return null;

  return (
    <>
      <div className="border border-[#C9A84C]/40 bg-[#111827] rounded-xl p-5">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <span className="bg-red-900/50 text-red-400 text-[10px] px-2 py-0.5 rounded-full inline-flex items-center">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block mr-1" />
            HIGH PRIORITY
          </span>
          <span className="text-[#C9A84C] text-sm">{data.confidence}% confidence</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mt-3">{data.title}</h3>

        {/* Description */}
        <p className="text-sm text-gray-300 mt-2 leading-relaxed">{data.description}</p>

        {/* Rationale */}
        <p className="text-gray-500 text-xs uppercase mt-3">Why:</p>
        <p className="text-gray-400 text-sm italic mt-1">{data.rationale}</p>

        {/* Client tags */}
        <div className="flex gap-2 mt-3">
          {data.client_tags.map((tag) => (
            <span
              key={tag.id}
              className="bg-[#1e2a3a] text-[#C9A84C] text-xs px-2 py-1 rounded cursor-pointer hover:bg-[#C9A84C]/20"
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* Impact */}
        <p className="text-emerald-400 text-sm font-medium mt-3">
          Est. impact: {data.estimated_impact}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <button className="bg-[#C9A84C] text-[#0D1117] font-semibold px-4 py-2 rounded-lg hover:bg-[#C9A84C]/90">
            Execute
          </button>
          <button className="border border-gray-600 text-gray-300 px-4 py-2 rounded-lg hover:border-gray-400">
            Dismiss
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="border border-gray-600 text-gray-300 px-4 py-2 rounded-lg hover:border-[#C9A84C]"
          >
            View evidence chain
          </button>
        </div>
      </div>

      <EvidenceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        evidence={data.evidence_chain}
      />
    </>
  );
}
