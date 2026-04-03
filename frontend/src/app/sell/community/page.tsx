"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Insight {
  id: string;
  insight_type: string;
  content: string;
  category: string;
  upvotes: number;
  downvotes: number;
  net_score: number;
  created_at: string | null;
}

interface MarketPulse {
  total_insights: number;
  trending_categories: { category: string; count: number }[];
  insight_type_distribution: Record<string, number>;
  top_insights: { id: string; insight_type: string; content: string; net_score: number }[];
}

const typeColors: Record<string, string> = {
  market_signal: "bg-blue-400/20 text-blue-400",
  pricing_intel: "bg-green-400/20 text-green-400",
  objection_pattern: "bg-orange-400/20 text-orange-400",
  delivery_tip: "bg-purple-400/20 text-purple-400",
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function CommunityPage() {
  const [feed, setFeed] = useState<Insight[]>([]);
  const [pulse, setPulse] = useState<MarketPulse | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareType, setShareType] = useState("market_signal");
  const [shareContent, setShareContent] = useState("");
  const [sharing, setSharing] = useState(false);

  const fetchData = async () => {
    try {
      const [feedRes, pulseRes] = await Promise.all([
        api.get("/api/v1/community/feed"),
        api.get("/api/v1/community/pulse"),
      ]);
      setFeed(feedRes.data);
      setPulse(pulseRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShare = async () => {
    if (!shareContent.trim()) return;
    try {
      setSharing(true);
      await api.post("/api/v1/community/share", {
        workspace_id: "default",
        insight_type: shareType,
        content: shareContent,
        anonymize: true,
      });
      setShareContent("");
      await fetchData();
    } catch {
      // silent
    } finally {
      setSharing(false);
    }
  };

  const handleVote = async (insightId: string, vote: string) => {
    try {
      await api.post("/api/v1/community/vote", { insight_id: insightId, vote });
      await fetchData();
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">Community Intel</h1>
        <p className="text-chamber-400">Anonymized insights from fellow premium-service practitioners</p>
      </div>

      {/* Share Panel */}
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-5 mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Share an Insight</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={shareType}
            onChange={(e) => setShareType(e.target.value)}
            className="bg-chamber-800 border border-chamber-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400"
          >
            <option value="market_signal">Market Signal</option>
            <option value="pricing_intel">Pricing Intel</option>
            <option value="objection_pattern">Objection Pattern</option>
            <option value="delivery_tip">Delivery Tip</option>
          </select>
          <input
            type="text"
            placeholder="What are you seeing in the market?"
            value={shareContent}
            onChange={(e) => setShareContent(e.target.value)}
            className="flex-1 bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400 transition"
          />
          <button
            onClick={handleShare}
            disabled={sharing}
            className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50"
          >
            {sharing ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-4">
          {feed.map((ins) => (
            <div key={ins.id} className="bg-chamber-900 rounded-xl border border-chamber-800 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[ins.insight_type] ?? "bg-chamber-700 text-chamber-300"}`}>
                  {ins.insight_type.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-chamber-500">
                  {ins.created_at ? new Date(ins.created_at).toLocaleDateString() : ""}
                </span>
              </div>
              <p className="text-white mb-3">{ins.content}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleVote(ins.id, "upvote")}
                  className="flex items-center gap-1 text-sm text-chamber-400 hover:text-green-400 transition"
                >
                  <span>+</span>
                  <span>{ins.upvotes}</span>
                </button>
                <button
                  onClick={() => handleVote(ins.id, "downvote")}
                  className="flex items-center gap-1 text-sm text-chamber-400 hover:text-red-400 transition"
                >
                  <span>-</span>
                  <span>{ins.downvotes}</span>
                </button>
                <span className="text-xs text-chamber-500">Score: {ins.net_score}</span>
              </div>
            </div>
          ))}
          {feed.length === 0 && (
            <div className="text-center py-12 text-chamber-500">No insights shared yet. Be the first!</div>
          )}
        </div>

        {/* Market Pulse Sidebar */}
        <div className="space-y-6">
          <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-5">
            <h3 className="text-white font-semibold mb-3">Market Pulse</h3>
            <div className="text-3xl font-bold text-gold-400 mb-1">{pulse?.total_insights ?? 0}</div>
            <p className="text-xs text-chamber-400 mb-4">total community insights</p>

            {pulse && pulse.trending_categories.length > 0 && (
              <>
                <h4 className="text-sm text-chamber-300 font-medium mb-2">Trending Categories</h4>
                <div className="space-y-2">
                  {pulse.trending_categories.map((tc) => (
                    <div key={tc.category} className="flex items-center justify-between text-sm">
                      <span className="text-chamber-300">{tc.category?.replace(/_/g, " ") ?? "uncategorized"}</span>
                      <span className="text-gold-400 font-medium">{tc.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {pulse && pulse.top_insights.length > 0 && (
            <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-5">
              <h3 className="text-white font-semibold mb-3">Top Insights</h3>
              <div className="space-y-3">
                {pulse.top_insights.map((ti) => (
                  <div key={ti.id} className="text-sm">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${typeColors[ti.insight_type] ?? "bg-chamber-700 text-chamber-300"}`}>
                      {ti.insight_type.replace(/_/g, " ")}
                    </span>
                    <p className="text-chamber-300 mt-1">{ti.content}</p>
                    <span className="text-xs text-gold-400">Score: {ti.net_score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
