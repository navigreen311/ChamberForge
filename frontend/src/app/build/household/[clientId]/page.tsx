"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

interface Member {
  name: string;
  role: string;
  age: number;
  primary: boolean;
}

interface Property {
  name: string;
  location: string;
  type: string;
  value: string;
}

interface Staff {
  name: string;
  role: string;
  location: string;
  since: string;
}

interface Vendor {
  name: string;
  service: string;
  contract: string;
  status: string;
}

interface Household {
  clientId: string;
  name: string;
  netWorth: string;
  net_worth?: string;
  members: Member[];
  properties: Property[];
  staff: Staff[];
  vendors: Vendor[];
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function HouseholdGraphPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "", age: "" });

  useEffect(() => {
    async function fetchHousehold() {
      try {
        const res = await api.get(`/api/v1/household/${clientId}`);
        setHousehold(res.data?.household ?? res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? "Failed to load household");
      } finally {
        setLoading(false);
      }
    }
    fetchHousehold();
  }, [clientId]);

  async function handleAddMember() {
    setAdding(true);
    setError(null);
    try {
      const res = await api.post(`/api/v1/household/${clientId}/members`, {
        name: newMember.name,
        role: newMember.role,
        age: parseInt(newMember.age) || 0,
        primary: false,
      });
      const updated = res.data?.household ?? res.data;
      if (updated?.members) {
        setHousehold(updated);
      } else {
        // If API returns the new member only, append it
        setHousehold((prev) =>
          prev
            ? {
                ...prev,
                members: [
                  ...prev.members,
                  { name: newMember.name, role: newMember.role, age: parseInt(newMember.age) || 0, primary: false },
                ],
              }
            : prev
        );
      }
      setNewMember({ name: "", role: "", age: "" });
      setShowAddForm(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to add member");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-2 gap-6">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64" />)}</div>
      </div>
    );
  }

  if (error && !household) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <a href="/build" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Build</a>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      </div>
    );
  }

  if (!household) return null;

  const netWorth = household.netWorth ?? household.net_worth ?? "N/A";

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/build" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Build</a>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 mb-6 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">{household.name}</h1>
          <p className="text-chamber-400">Household graph — Net worth: {netWorth}</p>
        </div>
        <a href={`/lifecycle/intel-brief/${clientId}`} className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-gold-400 transition text-sm">View Intel Brief</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Family Members */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Family Members</h3>
            <button onClick={() => setShowAddForm(!showAddForm)} className="text-gold-400 text-sm hover:underline">
              {showAddForm ? "Cancel" : "+ Add Member"}
            </button>
          </div>

          {showAddForm && (
            <div className="mb-4 p-4 bg-chamber-800/50 rounded-lg space-y-3">
              <input type="text" placeholder="Name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-3 py-2 text-white placeholder-chamber-500 text-sm focus:outline-none focus:border-gold-400" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Role (e.g., Son)" value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} className="bg-chamber-800 border border-chamber-700 rounded-lg px-3 py-2 text-white placeholder-chamber-500 text-sm focus:outline-none focus:border-gold-400" />
                <input type="number" placeholder="Age" value={newMember.age} onChange={(e) => setNewMember({ ...newMember, age: e.target.value })} className="bg-chamber-800 border border-chamber-700 rounded-lg px-3 py-2 text-white placeholder-chamber-500 text-sm focus:outline-none focus:border-gold-400" />
              </div>
              <button onClick={handleAddMember} disabled={adding || !newMember.name} className="px-4 py-2 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition text-sm disabled:opacity-50">
                {adding ? "Adding..." : "Add Member"}
              </button>
            </div>
          )}

          <div className="space-y-3">
            {(household.members ?? []).map((m) => (
              <div key={m.name} className="flex items-center gap-4 p-3 bg-chamber-800/50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${m.primary ? "bg-gold-400 text-chamber-950" : "bg-chamber-700 text-chamber-300"}`}>
                  {m.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{m.name}</p>
                  <p className="text-xs text-chamber-500">{m.role} &middot; Age {m.age}</p>
                </div>
                {m.primary && <span className="px-2 py-0.5 bg-gold-400/20 text-gold-400 text-xs rounded-full">Primary</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Properties */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>
          <div className="space-y-3">
            {(household.properties ?? []).map((p) => (
              <div key={p.name} className="flex items-center justify-between p-3 bg-chamber-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{p.name}</p>
                  <p className="text-xs text-chamber-500">{p.location} &middot; {p.type}</p>
                </div>
                <span className="text-gold-400 font-semibold text-sm">{p.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Household Staff</h3>
          <div className="space-y-3">
            {(household.staff ?? []).map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 bg-chamber-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{s.name}</p>
                  <p className="text-xs text-chamber-500">{s.role} &middot; {s.location}</p>
                </div>
                <span className="text-xs text-chamber-500">Since {s.since}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vendors */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Vendors & Services</h3>
          <div className="space-y-3">
            {(household.vendors ?? []).map((v) => (
              <div key={v.name} className="flex items-center justify-between p-3 bg-chamber-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{v.name}</p>
                  <p className="text-xs text-chamber-500">{v.service} &middot; {v.contract}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${v.status === "Active" ? "bg-green-400/20 text-green-400" : "bg-gold-400/20 text-gold-400"}`}>{v.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
