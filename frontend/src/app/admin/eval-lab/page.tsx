"use client";

import { useCallback, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface PromptVersion {
  id: string;
  version: number;
  is_active: boolean;
  created_at: string | null;
}

interface RegressionResult {
  test_id: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export default function EvalLabPage() {
  const [agentName, setAgentName] = useState("discovery_agent");
  const [history, setHistory] = useState<PromptVersion[]>([]);
  const [regressionResults, setRegressionResults] = useState<
    RegressionResult[]
  >([]);
  const [passRate, setPassRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(
        `${API}/api/v1/primitives/eval-lab/${agentName}/history`
      );
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch {
      // API unavailable
    }
  }, [agentName]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleRollback(version: number) {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/admin/prompts/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_name: agentName,
          target_version: version,
        }),
      });
      if (res.ok) {
        await loadHistory();
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  async function handleRegression() {
    setLoading(true);
    try {
      const testCases = [
        {
          test_id: "t1",
          input: "sample input",
          expected: "expected output",
          actual: "expected output",
        },
      ];
      const res = await fetch(
        `${API}/api/v1/primitives/eval-lab/${agentName}/regression`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_name: agentName, test_cases: testCases }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setRegressionResults(data.results ?? []);
        setPassRate(data.pass_rate ?? null);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-gold-400 mb-2">
          AI Eval Lab
        </h1>
        <p className="text-chamber-400 mb-6">
          Prompt version management and regression testing
        </p>

        {/* Agent selector */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-chamber-300 text-sm">Agent:</label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="bg-chamber-900 border border-chamber-700 rounded px-3 py-1.5 text-white text-sm"
          />
          <button
            onClick={handleRegression}
            disabled={loading}
            className="bg-gold-500 text-chamber-950 px-4 py-1.5 rounded text-sm font-semibold hover:bg-gold-400 disabled:opacity-50"
          >
            Run Regression
          </button>
        </div>

        {/* Prompt Versions Table */}
        <div className="bg-chamber-900 border border-chamber-800 rounded-lg overflow-hidden mb-8">
          <table className="w-full text-left">
            <thead className="bg-chamber-800">
              <tr>
                <th className="px-4 py-3 text-chamber-300 text-sm font-medium">
                  Version
                </th>
                <th className="px-4 py-3 text-chamber-300 text-sm font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-chamber-300 text-sm font-medium">
                  Created
                </th>
                <th className="px-4 py-3 text-chamber-300 text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-chamber-500"
                  >
                    No prompt versions found. Register one via the API.
                  </td>
                </tr>
              ) : (
                history.map((pv) => (
                  <tr key={pv.id} className="border-t border-chamber-800">
                    <td className="px-4 py-3 text-white font-mono">
                      v{pv.version}
                    </td>
                    <td className="px-4 py-3">
                      {pv.is_active ? (
                        <span className="text-emerald-400 text-sm font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="text-chamber-500 text-sm">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-chamber-400 text-sm">
                      {pv.created_at
                        ? new Date(pv.created_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {!pv.is_active && (
                        <button
                          onClick={() => handleRollback(pv.version)}
                          disabled={loading}
                          className="text-gold-400 text-sm hover:text-gold-300 disabled:opacity-50"
                        >
                          Rollback
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Regression Results */}
        {passRate !== null && (
          <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              Regression Results
            </h2>
            <div
              className={`text-2xl font-bold mb-4 ${
                passRate >= 0.9 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {(passRate * 100).toFixed(1)}% pass rate
            </div>
            <div className="space-y-2">
              {regressionResults.map((r) => (
                <div
                  key={r.test_id}
                  className={`flex items-center gap-3 text-sm px-3 py-2 rounded ${
                    r.passed
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-red-400/10 text-red-400"
                  }`}
                >
                  <span>{r.passed ? "PASS" : "FAIL"}</span>
                  <span className="text-chamber-300">
                    {r.test_id}: {r.input}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
