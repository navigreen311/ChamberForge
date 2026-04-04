import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    agents: [
      { id: 'agent-discover', name: 'Discovery Scanner', status: 'running', uptime: '14d 6h 32m', tasksCompleted: 2480, avgLatencyMs: 1240, successRate: 97.8, lastRun: '2026-04-03T09:00:00Z' },
      { id: 'agent-risk', name: 'Risk Sentinel', status: 'running', uptime: '14d 6h 32m', tasksCompleted: 18920, avgLatencyMs: 320, successRate: 99.2, lastRun: '2026-04-03T09:05:00Z' },
      { id: 'agent-playbook', name: 'Playbook Composer', status: 'running', uptime: '14d 6h 32m', tasksCompleted: 412, avgLatencyMs: 4800, successRate: 94.6, lastRun: '2026-04-03T08:45:00Z' },
      { id: 'agent-redteam', name: 'Red Team Challenger', status: 'idle', uptime: '14d 6h 32m', tasksCompleted: 186, avgLatencyMs: 6200, successRate: 91.3, lastRun: '2026-04-02T22:15:00Z' },
      { id: 'agent-deliver', name: 'Delivery Engine', status: 'running', uptime: '14d 6h 32m', tasksCompleted: 1050, avgLatencyMs: 2100, successRate: 96.4, lastRun: '2026-04-03T08:50:00Z' },
      { id: 'agent-evidence', name: 'Evidence Collector', status: 'running', uptime: '14d 6h 32m', tasksCompleted: 5640, avgLatencyMs: 890, successRate: 98.1, lastRun: '2026-04-03T09:02:00Z' },
    ],
    totalCreditsUsed: 184000,
    totalCreditsAvailable: 500000,
    avgResponseTimeMs: 2590,
    requestsToday: 1247,
    requestsThisMonth: 28400,
    errorRatePercent: 2.4,
  })
}
