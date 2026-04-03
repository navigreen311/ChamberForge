"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface WealthEvent {
  id: string;
  event_type: string;
  person_name: string;
  company: string | null;
  estimated_impact: string;
  relevance_score: number;
  buying_window_status: string;
  detected_at: string | null;
  expires_at: string | null;
}

const statusColors: Record<string, string> = {
  open: "bg-green-400/20 text-green-400",
  closing: "bg-orange-400/20 text-orange-400",
  closed: "bg-chamber-700 text-chamber-400",
};

const typeLabels: Record<string, string> = {
  exit: "Exit",
  ipo: "IPO",
  inheritance: "Inheritance",
  divorce: "Divorce",
  board_appointment: "Board Appt",
  prominence: "Prominence",
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function WealthEventsPage() {
  const [events, setEvents] = useState<WealthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/discovery/events");
      setEvents(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    try {
      setScanning(true);
      await api.post("/api/v1/discovery/events/scan", { sources: ["news", "filings", "social"] });
      await fetchEvents();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-chamber-950 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">Wealth Event Monitor</h1>
          <p className="text-chamber-400">Track exits, IPOs, inheritances, and buying windows</p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50 flex items-center gap-2"
        >
          {scanning && <span className="w-4 h-4 border-2 border-chamber-950 border-t-transparent rounded-full animate-spin" />}
          {scanning ? "Scanning..." : "Scan Events"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-chamber-800 text-left text-xs text-chamber-400 uppercase tracking-wider">
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Person</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Impact</th>
              <th className="px-4 py-3">Relevance</th>
              <th className="px-4 py-3">Window</th>
              <th className="px-4 py-3">Detected</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-400/20 text-blue-400">
                    {typeLabels[ev.event_type] ?? ev.event_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-white font-medium">{ev.person_name}</td>
                <td className="px-4 py-3 text-chamber-300">{ev.company ?? "-"}</td>
                <td className="px-4 py-3 text-gold-400 font-semibold">{ev.estimated_impact}</td>
                <td className="px-4 py-3 text-chamber-300">{ev.relevance_score ? `${Math.round(ev.relevance_score * 100)}%` : "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ev.buying_window_status] ?? statusColors.closed}`}>
                    {ev.buying_window_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-chamber-400 text-sm">
                  {ev.detected_at ? new Date(ev.detected_at).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
            {events.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-chamber-500">
                  No wealth events detected yet. Run a scan to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
