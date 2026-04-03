"use client";

import { useState, useEffect } from "react";

const household = {
  clientId: "client-001",
  name: "The Henderson Family",
  netWorth: "$180M",
  members: [
    { name: "James Henderson", role: "Principal", age: 58, primary: true },
    { name: "Victoria Henderson", role: "Spouse", age: 55, primary: false },
    { name: "Alexander Henderson", role: "Son", age: 28, primary: false },
    { name: "Charlotte Henderson", role: "Daughter", age: 24, primary: false },
  ],
  properties: [
    { name: "Manhattan Penthouse", location: "New York, NY", type: "Primary Residence", value: "$14.2M" },
    { name: "Palm Beach Estate", location: "Palm Beach, FL", type: "Vacation Home", value: "$8.5M" },
    { name: "Aspen Chalet", location: "Aspen, CO", type: "Vacation Home", value: "$6.1M" },
    { name: "London Flat", location: "Mayfair, London", type: "Pied-a-terre", value: "$4.8M" },
  ],
  staff: [
    { name: "Maria Santos", role: "Estate Manager", location: "NY", since: "2019" },
    { name: "David Kim", role: "Personal Chef", location: "NY", since: "2021" },
    { name: "Robert Clarke", role: "Property Manager", location: "FL", since: "2020" },
    { name: "Sophie Laurent", role: "PA / Scheduler", location: "NY", since: "2022" },
    { name: "Thomas Wright", role: "Security Director", location: "Multi", since: "2018" },
  ],
  vendors: [
    { name: "Sterling Aviation", service: "Private Aviation", contract: "$150K/yr", status: "Active" },
    { name: "Pinnacle Wealth Advisors", service: "Tax Advisory", contract: "$85K/yr", status: "Active" },
    { name: "Artisan Home Services", service: "Property Maintenance", contract: "$120K/yr", status: "Active" },
    { name: "Sapphire Insurance Group", service: "Insurance", contract: "$45K/yr", status: "Under Review" },
  ],
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function HouseholdGraphPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-2 gap-6">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/build" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Build</a>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">{household.name}</h1>
          <p className="text-chamber-400">Household graph — Net worth: {household.netWorth}</p>
        </div>
        <a href={`/lifecycle/intel-brief/${household.clientId}`} className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-gold-400 transition text-sm">View Intel Brief</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Family Members */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Family Members</h3>
          <div className="space-y-3">
            {household.members.map((m) => (
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
            {household.properties.map((p) => (
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
            {household.staff.map((s) => (
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
            {household.vendors.map((v) => (
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
