"use client";

import { useState } from "react";
import RuleBuilder from "@/components/modules/RuleBuilder";

interface Rule {
  id: string;
  name: string;
  trigger_type: string;
  action_type: string;
  is_active: boolean;
  execution_count: number;
}

const SAMPLE_RULES: Rule[] = [
  {
    id: "1",
    name: "Low Client Health Alert",
    trigger_type: "client_health_below",
    action_type: "send_alert",
    is_active: true,
    execution_count: 23,
  },
  {
    id: "2",
    name: "Wealth Event Task Creation",
    trigger_type: "wealth_event_detected",
    action_type: "create_task",
    is_active: true,
    execution_count: 8,
  },
  {
    id: "3",
    name: "Regulatory Compliance Review",
    trigger_type: "regulatory_alert",
    action_type: "open_risk_review",
    is_active: false,
    execution_count: 0,
  },
];

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>(SAMPLE_RULES);
  const [showBuilder, setShowBuilder] = useState(false);

  function handleRuleCreated(rule: Rule) {
    setRules((prev) => [rule, ...prev]);
    setShowBuilder(false);
  }

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-gold-400 mb-2">
              Rules Engine
            </h1>
            <p className="text-chamber-400">
              Automation rules with triggers and actions
            </p>
          </div>
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="bg-gold-500 text-chamber-950 px-4 py-2 rounded font-semibold text-sm hover:bg-gold-400"
          >
            {showBuilder ? "Cancel" : "+ New Rule"}
          </button>
        </div>

        {showBuilder && (
          <div className="mb-8">
            <RuleBuilder onCreated={handleRuleCreated} />
          </div>
        )}

        {/* Rules List */}
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-chamber-900 border border-chamber-800 rounded-lg p-5 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white font-semibold">{rule.name}</span>
                  {rule.is_active ? (
                    <span className="bg-emerald-400/10 text-emerald-400 text-xs px-2 py-0.5 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="bg-chamber-700/50 text-chamber-500 text-xs px-2 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-chamber-400">
                  <span>
                    Trigger:{" "}
                    <span className="text-chamber-300 font-mono">
                      {rule.trigger_type}
                    </span>
                  </span>
                  <span>
                    Action:{" "}
                    <span className="text-chamber-300 font-mono">
                      {rule.action_type}
                    </span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-lg">
                  {rule.execution_count}
                </div>
                <div className="text-chamber-500 text-xs">executions</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
