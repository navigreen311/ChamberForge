'use client'

import { useState } from 'react'

// ─── Inline Data ──────────────────────────────────────────────

const RULES = [
  {
    id: 1,
    name: 'At-Risk Intervention',
    trigger: 'Health score drops below 60',
    action: 'Send alert to advisor + create follow-up task',
    active: true,
    runs: 12,
    lastTriggered: '2 hours ago',
  },
  {
    id: 2,
    name: 'Wealth Event Outreach',
    trigger: 'Wealth event detected (exit, IPO, inheritance)',
    action: 'Generate client brief + notify relationship manager',
    active: true,
    runs: 8,
    lastTriggered: '5 hours ago',
  },
  {
    id: 3,
    name: 'SLA Breach Escalation',
    trigger: 'Deliverable overdue by >48 hours',
    action: 'Escalate to team lead + notify client team',
    active: true,
    runs: 3,
    lastTriggered: '1 day ago',
  },
  {
    id: 4,
    name: 'Renewal Prep',
    trigger: 'Engagement renewal within 30 days',
    action: 'Create renewal task + generate renewal brief',
    active: true,
    runs: 5,
    lastTriggered: '3 days ago',
  },
  {
    id: 5,
    name: 'Stale Evidence Alert',
    trigger: 'Evidence item older than 18 months',
    action: 'Flag for review + notify compliance officer',
    active: false,
    runs: 0,
    lastTriggered: 'Never',
  },
  {
    id: 6,
    name: 'Red-Team Auto-Run',
    trigger: 'Offer status changes to Active',
    action: 'Run red-team audit automatically',
    active: true,
    runs: 4,
    lastTriggered: '6 hours ago',
  },
]

const TRIGGER_CATEGORIES = [
  {
    category: 'Health & Risk',
    triggers: [
      'Health score drops below threshold',
      'Risk level changes',
      'Compliance flag raised',
    ],
  },
  {
    category: 'Wealth Events',
    triggers: [
      'Wealth event detected',
      'Asset transfer initiated',
      'Liquidity event confirmed',
    ],
  },
  {
    category: 'Lifecycle',
    triggers: [
      'Engagement renewal approaching',
      'Onboarding milestone reached',
      'Client status changes',
    ],
  },
  {
    category: 'Deliverables',
    triggers: [
      'Deliverable overdue',
      'Deliverable completed',
      'SLA threshold breached',
    ],
  },
  {
    category: 'Offers & Pipeline',
    triggers: [
      'Offer status changes',
      'Pipeline stage advances',
      'New opportunity scored',
    ],
  },
  {
    category: 'Evidence & Intel',
    triggers: [
      'Evidence item stale',
      'New intelligence captured',
      'Source reliability changed',
    ],
  },
]

const ACTIONS = [
  'Send alert to advisor',
  'Create follow-up task',
  'Generate client brief',
  'Notify relationship manager',
  'Escalate to team lead',
  'Notify client team',
  'Create renewal task',
  'Generate renewal brief',
  'Flag for review',
  'Notify compliance officer',
  'Run red-team audit',
  'Send email notification',
  'Update client health score',
  'Create calendar event',
]

const TEMPLATES = [
  { id: 1, name: 'Client Health Monitor', desc: 'Alert when any client health score drops below configurable threshold', trigger: 'Health score change', action: 'Alert + Task', category: 'Risk' },
  { id: 2, name: 'Wealth Event Pipeline', desc: 'Auto-generate briefs and outreach when wealth events are detected', trigger: 'Wealth event', action: 'Brief + Notify', category: 'Growth' },
  { id: 3, name: 'SLA Guardian', desc: 'Escalate overdue deliverables before clients notice', trigger: 'Deliverable overdue', action: 'Escalate', category: 'Operations' },
  { id: 4, name: 'Renewal Autopilot', desc: 'Prepare renewal materials 30/60/90 days before expiry', trigger: 'Renewal date', action: 'Task + Brief', category: 'Retention' },
  { id: 5, name: 'Evidence Freshness', desc: 'Flag stale evidence and prompt reviews on a rolling basis', trigger: 'Evidence age', action: 'Flag + Notify', category: 'Compliance' },
  { id: 6, name: 'Onboarding Watchdog', desc: 'Track onboarding milestones and alert on delays', trigger: 'Milestone missed', action: 'Alert + Escalate', category: 'Onboarding' },
  { id: 7, name: 'Red-Team on Publish', desc: 'Automatically run adversarial audit when offers go live', trigger: 'Offer status', action: 'Run audit', category: 'Quality' },
  { id: 8, name: 'Pipeline Velocity', desc: 'Notify when opportunities stall in any stage too long', trigger: 'Stage duration', action: 'Notify + Task', category: 'Growth' },
]

const RUN_LOG = [
  { id: 1, timestamp: '2026-04-03 09:14', rule: 'At-Risk Intervention', triggerEvent: 'Wellington Trust health → 58', action: 'Alert sent to J. Park + task created', result: 'Success', entity: 'Wellington Trust' },
  { id: 2, timestamp: '2026-04-03 08:30', rule: 'Wealth Event Outreach', triggerEvent: 'Marcus Reid Series C exit ($120M)', action: 'Brief generated + RM notified', result: 'Success', entity: 'Marcus Reid' },
  { id: 3, timestamp: '2026-04-03 06:45', rule: 'Red-Team Auto-Run', triggerEvent: 'Family Cyber Command → Active', action: 'Red-team audit initiated', result: 'Success', entity: 'Family Cyber Command' },
  { id: 4, timestamp: '2026-04-02 17:20', rule: 'SLA Breach Escalation', triggerEvent: 'Property audit overdue 52h', action: 'Escalated to A. Torres', result: 'Success', entity: 'Harrington Dynasty' },
  { id: 5, timestamp: '2026-04-02 14:10', rule: 'Renewal Prep', triggerEvent: 'Chen renewal in 28 days', action: 'Renewal task + brief created', result: 'Success', entity: 'Sarah Chen' },
  { id: 6, timestamp: '2026-04-02 11:00', rule: 'Wealth Event Outreach', triggerEvent: 'Thornton estate transfer ($45M)', action: 'Brief generated + RM notified', result: 'Success', entity: 'Thornton Family' },
]

// ─── Component ────────────────────────────────────────────────

export default function AutomationPage() {
  const [rules, setRules] = useState(RULES)
  const [showBuilder, setShowBuilder] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [builderStep, setBuilderStep] = useState(1)
  const [selectedTrigger, setSelectedTrigger] = useState('')
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [ruleName, setRuleName] = useState('')
  const [conditionField, setConditionField] = useState('')
  const [conditionValue, setConditionValue] = useState('')

  const gold = '#C9A84C'

  const toggleRule = (id: number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
  }

  const resetBuilder = () => {
    setBuilderStep(1)
    setSelectedTrigger('')
    setSelectedActions([])
    setRuleName('')
    setConditionField('')
    setConditionValue('')
  }

  const openBuilder = () => {
    resetBuilder()
    setShowBuilder(true)
  }

  const toggleAction = (action: string) => {
    setSelectedActions(prev =>
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    )
  }

  const handleSaveRule = () => {
    if (!ruleName || !selectedTrigger || selectedActions.length === 0) return
    const newRule = {
      id: rules.length + 1,
      name: ruleName,
      trigger: selectedTrigger,
      action: selectedActions.join(' + '),
      active: true,
      runs: 0,
      lastTriggered: 'Never',
    }
    setRules(prev => [...prev, newRule])
    setShowBuilder(false)
    resetBuilder()
  }

  const deleteRule = (id: number) => {
    setRules(prev => prev.filter(r => r.id !== id))
  }

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setRuleName(tpl.name)
    setSelectedTrigger(tpl.trigger)
    setSelectedActions([tpl.action])
    setShowTemplates(false)
    setBuilderStep(1)
    setShowBuilder(true)
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rules &amp; Automation</h1>
            <p className="mt-1 text-sm text-white/50">
              {rules.filter(r => r.active).length} active rules · {rules.reduce((s, r) => s + r.runs, 0)} total executions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Templates
            </button>
            <button
              onClick={openBuilder}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
              style={{ backgroundColor: gold }}
            >
              + New Rule
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-8 space-y-8">
        {/* ─── Templates Library ───────────────────────────────── */}
        {showTemplates && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Rule Templates</h2>
              <button onClick={() => setShowTemplates(false)} className="text-sm text-white/40 hover:text-white">
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEMPLATES.map(tpl => (
                <div key={tpl.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col justify-between hover:border-white/20 transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${gold}20`, color: gold }}>
                        {tpl.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{tpl.name}</h3>
                    <p className="text-xs text-white/40 leading-relaxed mb-3">{tpl.desc}</p>
                    <div className="flex items-center gap-2 text-xs text-white/30">
                      <span>⚡ {tpl.trigger}</span>
                      <span>→</span>
                      <span>{tpl.action}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => applyTemplate(tpl)}
                    className="mt-4 w-full rounded-lg border border-white/20 py-1.5 text-xs font-medium text-white/70 hover:border-white/40 hover:text-white transition"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Rules List ──────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Active Rules</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-white/40 uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Rule</th>
                  <th className="px-5 py-3 font-medium">Trigger</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium text-center">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Runs</th>
                  <th className="px-5 py-3 font-medium">Last Triggered</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(rule => (
                  <tr key={rule.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                    <td className="px-5 py-4 font-medium">{rule.name}</td>
                    <td className="px-5 py-4 text-white/60">{rule.trigger}</td>
                    <td className="px-5 py-4 text-white/60">{rule.action}</td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          rule.active ? 'bg-emerald-500' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            rule.active ? 'translate-x-[18px]' : 'translate-x-[3px]'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums" style={{ color: rule.runs > 0 ? gold : 'rgba(255,255,255,0.3)' }}>
                      {rule.runs}
                    </td>
                    <td className="px-5 py-4 text-white/40">{rule.lastTriggered}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={openBuilder}
                          className="rounded px-2 py-1 text-xs text-white/40 hover:text-white hover:bg-white/10 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="rounded px-2 py-1 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── Run Log ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Recent Executions</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-white/40 uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Timestamp</th>
                  <th className="px-5 py-3 font-medium">Rule</th>
                  <th className="px-5 py-3 font-medium">Trigger Event</th>
                  <th className="px-5 py-3 font-medium">Action Taken</th>
                  <th className="px-5 py-3 font-medium text-center">Result</th>
                  <th className="px-5 py-3 font-medium">Entity</th>
                </tr>
              </thead>
              <tbody>
                {RUN_LOG.map(log => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                    <td className="px-5 py-3 text-white/40 tabular-nums text-xs">{log.timestamp}</td>
                    <td className="px-5 py-3 font-medium">{log.rule}</td>
                    <td className="px-5 py-3 text-white/60">{log.triggerEvent}</td>
                    <td className="px-5 py-3 text-white/60">{log.action}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        ● {log.result}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white/50">{log.entity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ─── Rule Builder Modal ────────────────────────────────── */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#12151A] p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">New Automation Rule</h2>
              <button onClick={() => setShowBuilder(false)} className="text-white/30 hover:text-white text-xl leading-none">
                ✕
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map(step => (
                <button
                  key={step}
                  onClick={() => setBuilderStep(step)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    builderStep === step
                      ? 'text-black'
                      : builderStep > step
                      ? 'bg-white/10 text-white/60'
                      : 'bg-white/5 text-white/30'
                  }`}
                  style={builderStep === step ? { backgroundColor: gold } : undefined}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/20 text-[10px]">
                    {step}
                  </span>
                  {step === 1 ? 'WHEN' : step === 2 ? 'THEN' : 'CONDITIONS'}
                </button>
              ))}
            </div>

            {/* Rule Name */}
            <div className="mb-5">
              <label className="mb-1.5 block text-xs text-white/40 uppercase tracking-wider">Rule Name</label>
              <input
                type="text"
                value={ruleName}
                onChange={e => setRuleName(e.target.value)}
                placeholder="e.g. At-Risk Intervention"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition"
              />
            </div>

            {/* Step 1: WHEN (Trigger) */}
            {builderStep === 1 && (
              <div>
                <label className="mb-3 block text-xs text-white/40 uppercase tracking-wider">Select Trigger</label>
                <div className="space-y-4">
                  {TRIGGER_CATEGORIES.map(cat => (
                    <div key={cat.category}>
                      <p className="mb-2 text-xs font-medium text-white/30">{cat.category}</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.triggers.map(t => (
                          <button
                            key={t}
                            onClick={() => setSelectedTrigger(t)}
                            className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                              selectedTrigger === t
                                ? 'border-transparent text-black font-semibold'
                                : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                            }`}
                            style={selectedTrigger === t ? { backgroundColor: gold } : undefined}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setBuilderStep(2)}
                    disabled={!selectedTrigger}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-black transition disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
                    style={{ backgroundColor: gold }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: THEN (Actions) */}
            {builderStep === 2 && (
              <div>
                <label className="mb-3 block text-xs text-white/40 uppercase tracking-wider">
                  Select Actions ({selectedActions.length} selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ACTIONS.map(a => (
                    <button
                      key={a}
                      onClick={() => toggleAction(a)}
                      className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                        selectedActions.includes(a)
                          ? 'border-transparent text-black font-semibold'
                          : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                      }`}
                      style={selectedActions.includes(a) ? { backgroundColor: gold } : undefined}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <button onClick={() => setBuilderStep(1)} className="text-sm text-white/40 hover:text-white transition">
                    ← Back
                  </button>
                  <button
                    onClick={() => setBuilderStep(3)}
                    disabled={selectedActions.length === 0}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-black transition disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
                    style={{ backgroundColor: gold }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: CONDITIONS */}
            {builderStep === 3 && (
              <div>
                <label className="mb-3 block text-xs text-white/40 uppercase tracking-wider">
                  Optional Conditions (filters)
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-white/30">Filter field</label>
                    <select
                      value={conditionField}
                      onChange={e => setConditionField(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30 transition"
                    >
                      <option value="">None</option>
                      <option value="client_tier">Client Tier</option>
                      <option value="engagement_type">Engagement Type</option>
                      <option value="health_score">Health Score Range</option>
                      <option value="region">Region</option>
                      <option value="advisor">Assigned Advisor</option>
                    </select>
                  </div>
                  {conditionField && (
                    <div>
                      <label className="mb-1 block text-xs text-white/30">Value</label>
                      <input
                        type="text"
                        value={conditionValue}
                        onChange={e => setConditionValue(e.target.value)}
                        placeholder="e.g. UHNW, > 80, Americas"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition"
                      />
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Rule Summary</p>
                  <p className="text-sm">
                    <span className="text-white/40">WHEN</span>{' '}
                    <span className="font-medium" style={{ color: gold }}>{selectedTrigger || '—'}</span>
                  </p>
                  <p className="text-sm mt-1">
                    <span className="text-white/40">THEN</span>{' '}
                    <span className="font-medium text-emerald-400">{selectedActions.join(' + ') || '—'}</span>
                  </p>
                  {conditionField && (
                    <p className="text-sm mt-1">
                      <span className="text-white/40">IF</span>{' '}
                      <span className="font-medium text-blue-400">{conditionField} = {conditionValue || '…'}</span>
                    </p>
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <button onClick={() => setBuilderStep(2)} className="text-sm text-white/40 hover:text-white transition">
                    ← Back
                  </button>
                  <button
                    onClick={handleSaveRule}
                    disabled={!ruleName || !selectedTrigger || selectedActions.length === 0}
                    className="rounded-lg px-6 py-2 text-sm font-semibold text-black transition disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
                    style={{ backgroundColor: gold }}
                  >
                    Save Rule
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
