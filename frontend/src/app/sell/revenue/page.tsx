"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface Projection {
  month: number;
  clients: number;
  mrr: number;
  arr: number;
  cumulative: number;
}

interface RevenueResult {
  monthly_projections: Projection[];
  break_even_month: number | null;
  year_1_arr: number;
}

export default function RevenuePage() {
  const [monthlyPrice, setMonthlyPrice] = useState("20000");
  const [clientsMonth1, setClientsMonth1] = useState("2");
  const [growthRate, setGrowthRate] = useState("0.15");
  const [churnRate, setChurnRate] = useState("0.05");
  const [months, setMonths] = useState("12");
  const [result, setResult] = useState<RevenueResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProject = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/sell/revenue/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_price: parseFloat(monthlyPrice),
          clients_month_1: parseInt(clientsMonth1),
          growth_rate: parseFloat(growthRate),
          churn_rate: parseFloat(churnRate),
          months: parseInt(months),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Failed to project revenue:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-white">Revenue Projector</h1>
        <p className="mt-2 text-zinc-400">
          Model recurring revenue with growth and churn dynamics
        </p>

        {/* Input Form */}
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Monthly Price ($)
              </label>
              <input
                type="number"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Starting Clients
              </label>
              <input
                type="number"
                value={clientsMonth1}
                onChange={(e) => setClientsMonth1(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Growth Rate
              </label>
              <input
                type="number"
                step="0.01"
                value={growthRate}
                onChange={(e) => setGrowthRate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Churn Rate
              </label>
              <input
                type="number"
                step="0.01"
                value={churnRate}
                onChange={(e) => setChurnRate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Months
              </label>
              <input
                type="number"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleProject}
            disabled={loading}
            className="mt-6 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? "Projecting..." : "Project Revenue"}
          </button>
        </div>

        {result && (
          <>
            {/* KPI Cards */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <p className="text-sm text-zinc-400">Year 1 ARR</p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">
                  {formatCurrency(result.year_1_arr)}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <p className="text-sm text-zinc-400">Break-Even Month</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {result.break_even_month ?? "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <p className="text-sm text-zinc-400">Final Month MRR</p>
                <p className="mt-1 text-2xl font-bold text-violet-400">
                  {formatCurrency(
                    result.monthly_projections[
                      result.monthly_projections.length - 1
                    ]?.mrr ?? 0
                  )}
                </p>
              </div>
            </div>

            {/* MRR Chart */}
            <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Monthly Recurring Revenue
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={result.monthly_projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="month"
                    stroke="#71717a"
                    label={{ value: "Month", position: "bottom", fill: "#71717a" }}
                  />
                  <YAxis
                    stroke="#71717a"
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value: number) => [formatCurrency(value)]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    name="MRR"
                    stroke="#10b981"
                    fill="#10b98133"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="Cumulative"
                    stroke="#8b5cf6"
                    fill="#8b5cf633"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Clients Chart */}
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Client Growth
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={result.monthly_projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clients"
                    name="Clients"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-zinc-400">Month</th>
                    <th className="px-4 py-3 text-right text-zinc-400">Clients</th>
                    <th className="px-4 py-3 text-right text-zinc-400">MRR</th>
                    <th className="px-4 py-3 text-right text-zinc-400">ARR</th>
                    <th className="px-4 py-3 text-right text-zinc-400">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {result.monthly_projections.map((p) => (
                    <tr
                      key={p.month}
                      className="border-t border-zinc-800 hover:bg-zinc-900/50"
                    >
                      <td className="px-4 py-2.5 text-white">{p.month}</td>
                      <td className="px-4 py-2.5 text-right text-white">
                        {p.clients}
                      </td>
                      <td className="px-4 py-2.5 text-right text-emerald-400">
                        {formatCurrency(p.mrr)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-white">
                        {formatCurrency(p.arr)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-violet-400">
                        {formatCurrency(p.cumulative)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
