"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import HouseholdGraphViewer from "@/components/modules/HouseholdGraphViewer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface HouseholdData {
  id: string;
  client_id: string;
  members: Record<string, unknown>[];
  properties: Record<string, unknown>[];
  staff: Record<string, unknown>[];
  vendors: Record<string, unknown>[];
  entities: Record<string, unknown>[];
  risk_exposures: Record<string, unknown>[];
  jurisdictions: string[];
  updated_at: string | null;
}

export default function HouseholdGraphPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [data, setData] = useState<HouseholdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGraph();
  }, [clientId]);

  async function fetchGraph() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/household/${clientId}`);
      if (res.status === 404) {
        setData(null);
        setError(null);
      } else if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      } else {
        setData(await res.json());
      }
    } catch (err) {
      setError("Failed to load household graph");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createGraph() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/household/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      setError("Failed to create household graph");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(category: string, itemData: Record<string, unknown>) {
    const endpointMap: Record<string, string> = {
      members: "members",
      properties: "properties",
      staff: "staff",
      vendors: "vendors",
    };
    const endpoint = endpointMap[category];
    if (!endpoint) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/household/${clientId}/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData),
        }
      );
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Failed to add item:", err);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-chamber-950 p-8">
        <p className="text-chamber-300">Loading household graph...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-chamber-950 p-8">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-chamber-950 p-8">
        <h1 className="text-3xl font-bold text-gold-400 mb-6">Household Graph</h1>
        <p className="text-chamber-300 mb-4">
          No household graph exists for this client yet.
        </p>
        <button
          onClick={createGraph}
          className="bg-gold-500 hover:bg-gold-600 text-chamber-950 font-semibold px-6 py-2 rounded"
        >
          Create Household Graph
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-bold text-gold-400 mb-2">Household Graph</h1>
      <p className="text-chamber-400 mb-6">Client: {clientId}</p>
      <HouseholdGraphViewer
        members={data.members}
        properties={data.properties}
        staff={data.staff}
        vendors={data.vendors}
        onAddItem={addItem}
      />
    </main>
  );
}
