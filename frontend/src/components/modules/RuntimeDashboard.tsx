"use client";

import { useState } from "react";

interface AgentCost {
  name: string;
  cost: number;
  invocations: number;
  avgLatency: number;
}

const SAMPLE_AGENTS: AgentCost[] = [
  { name: "discovery_agent", cost: 12.45, invocations: 342, avgLatency: 1100 },
  { name: "qualify_agent", cost: 8.32, invocations: 218, avgLatency: 950 },
  { name: "lifecycle_agent", cost: 6.78, invocations: 156, avgLatency: 1300 },
  { name: "compliance_agent", cost: 4.56, invocations: 89, avgLatency: 800 },
  { name: "playbook_agent", cost: 3.21, invocations: 67, avgLatency: 1500 },
];

export default function RuntimeDashboard() {
  const [agents] = useState<AgentCost[]>(SAMPLE_AGENTS);

  const totalCost = agents.reduce((sum, a) => sum + a.cost, 0);
  const maxCost = Math.max(...agents.map((a) => a.cost));
  const avgLatency =
    agents.reduce((sum, a) => sum + a.avgLatency, 0) / agents.length;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
          <div className="text-chamber-400 text-sm mb-1">Total Cost (MTD)</div>
          <div className="text-3xl font-bold text-gold-400">
            ${totalCost.toFixed(2)}
          </div>
        </div>
        <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
          <div className="text-chamber-400 text-sm mb-1">
            Total Invocations
          </div>
          <div className="text-3xl font-bold text-white">
            {agents.reduce((sum, a) => sum + a.invocations, 0)}
          </div>
        </div>
        <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
          <div className="text-chamber-400 text-sm mb-1">
            Avg Latency
          </div>
          <div className="text-3xl font-bold text-white">
            {avgLatency.toFixed(0)}ms
          </div>
          {/* Latency Gauge */}
          <div className="mt-3">
            <div className="h-2 bg-chamber-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  avgLatency < 1000
                    ? "bg-emerald-400"
                    : avgLatency < 2000
                    ? "bg-gold-400"
                    : "bg-red-400"
                }`}
                style={{ width: `${Math.min((avgLatency / 3000) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-chamber-500 mt-1">
              <span>0ms</span>
              <span>3000ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Bar Chart by Agent */}
      <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Cost by Agent
        </h2>
        <div className="space-y-3">
          {agents
            .sort((a, b) => b.cost - a.cost)
            .map((agent) => (
              <div key={agent.name} className="flex items-center gap-4">
                <div className="w-40 text-sm text-chamber-300 font-mono truncate">
                  {agent.name}
                </div>
                <div className="flex-1">
                  <div className="h-6 bg-chamber-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-500/80 rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${(agent.cost / maxCost) * 100}%`,
                        minWidth: "2rem",
                      }}
                    >
                      <span className="text-xs text-chamber-950 font-semibold">
                        ${agent.cost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-24 text-right text-sm text-chamber-400">
                  {agent.invocations} calls
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Latency by Agent */}
      <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Latency by Agent
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.name}
              className="bg-chamber-800 rounded-lg p-4"
            >
              <div className="text-sm text-chamber-300 font-mono mb-2">
                {agent.name}
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {agent.avgLatency}ms
              </div>
              <div className="h-1.5 bg-chamber-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    agent.avgLatency < 1000
                      ? "bg-emerald-400"
                      : agent.avgLatency < 1500
                      ? "bg-gold-400"
                      : "bg-red-400"
                  }`}
                  style={{
                    width: `${Math.min((agent.avgLatency / 2000) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
