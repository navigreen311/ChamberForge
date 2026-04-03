"use client";

import { useState, useEffect } from "react";

const evidence = [
  { id: 1, problem: "Private Aviation Charter Gaps", type: "Survey", source: "Luxury Travel Magazine", credibility: 92, summary: "78% of UHNW travelers report booking friction", date: "2026-02-20", status: "Verified" },
  { id: 2, problem: "Private Aviation Charter Gaps", type: "Interview", source: "Family Office Network", credibility: 88, summary: "Average wait time for charter confirmations is 4.2 days", date: "2026-03-01", status: "Verified" },
  { id: 3, problem: "Estate Staff Retention Crisis", type: "Data", source: "Bureau of Labor Statistics", credibility: 95, summary: "Estate manager turnover rate at 42% nationally", date: "2026-01-15", status: "Verified" },
  { id: 4, problem: "Estate Staff Retention Crisis", type: "Report", source: "Staffing Industry Analysts", credibility: 90, summary: "Median estate manager tenure dropped to 1.8 years", date: "2026-03-10", status: "Verified" },
  { id: 5, problem: "Yacht Crew Credentialing", type: "Social", source: "CrewForum.com", credibility: 62, summary: "Rising complaints about certification tracking across vessels", date: "2026-03-20", status: "Pending" },
  { id: 6, problem: "Concierge Service Fragmentation", type: "Survey", source: "Wealth-X", credibility: 91, summary: "Average UHNW household uses 7.3 concierge providers", date: "2026-02-05", status: "Verified" },
  { id: 7, problem: "Art Collection Insurance Gaps", type: "Report", source: "AXA Art Insurance", credibility: 87, summary: "30% of private collections underinsured by $500K+", date: "2026-01-28", status: "Pending" },
  { id: 8, problem: "Family Office Tax Complexity", type: "Interview", source: "KPMG Private Client", credibility: 85, summary: "Multi-jurisdiction filing errors average $52K per family", date: "2026-03-15", status: "Queued" },
];

type SortKey = "date" | "credibility" | "source" | "type" | "status";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function EvidenceBrowserPage() {
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("credibility");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const sorted = [...evidence].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortKey === "credibility") return (a.credibility - b.credibility) * dir;
    if (sortKey === "date") return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
    return (a[sortKey] || "").localeCompare(b[sortKey] || "") * dir;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/discover" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Discovery</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Evidence Browser</h1>
      <p className="text-chamber-400 mb-8">All collected evidence across problem domains, sorted by credibility</p>

      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              {(["type", "source", "credibility", "status", "date"] as SortKey[]).map((key) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider cursor-pointer hover:text-gold-400 transition"
                >
                  {key} {sortKey === key ? (sortAsc ? "↑" : "↓") : ""}
                </th>
              ))}
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Summary</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Problem</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr key={e.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    e.type === "Data" ? "bg-blue-400/20 text-blue-400" :
                    e.type === "Survey" ? "bg-purple-400/20 text-purple-400" :
                    e.type === "Interview" ? "bg-green-400/20 text-green-400" :
                    e.type === "Report" ? "bg-gold-400/20 text-gold-400" :
                    "bg-chamber-700 text-chamber-300"
                  }`}>{e.type}</span>
                </td>
                <td className="px-5 py-4 text-white text-sm">{e.source}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-chamber-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${e.credibility >= 85 ? "bg-green-400" : e.credibility >= 70 ? "bg-gold-400" : "bg-orange-400"}`} style={{ width: `${e.credibility}%` }} />
                    </div>
                    <span className="text-sm text-chamber-300">{e.credibility}%</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    e.status === "Verified" ? "bg-green-400/20 text-green-400" :
                    e.status === "Pending" ? "bg-gold-400/20 text-gold-400" :
                    "bg-chamber-700 text-chamber-400"
                  }`}>{e.status}</span>
                </td>
                <td className="px-5 py-4 text-sm text-chamber-400">{e.date}</td>
                <td className="px-5 py-4 text-sm text-chamber-300 max-w-xs truncate">{e.summary}</td>
                <td className="px-5 py-4 text-sm text-chamber-500">{e.problem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-chamber-500">{evidence.length} evidence records</p>
        <a href="#" className="text-gold-400 text-sm hover:underline">Open Analyst Queue &rarr;</a>
      </div>
    </div>
  );
}
