import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 'scn-001',
      name: 'Market Downturn Stress Test',
      description: 'Simulate a 20% broad market decline and assess portfolio impact across all client accounts. Tests rebalancing triggers and risk alerts.',
      status: 'completed',
      lastRun: '2026-04-02T14:00:00Z',
      duration: '4m 32s',
      results: { clientsImpacted: 84, avgPortfolioDrawdown: -16.2, alertsTriggered: 12, rebalancesNeeded: 31 },
    },
    {
      id: 'scn-002',
      name: 'Interest Rate Spike (+200bps)',
      description: 'Model the effect of a sudden 200 basis point rate increase on fixed income allocations and mortgage-linked assets.',
      status: 'completed',
      lastRun: '2026-03-28T10:00:00Z',
      duration: '3m 15s',
      results: { clientsImpacted: 62, avgBondDrawdown: -8.4, alertsTriggered: 7, rebalancesNeeded: 18 },
    },
    {
      id: 'scn-003',
      name: 'Client Churn Cascade',
      description: 'Simulate losing the top 5 revenue clients simultaneously. Assess revenue impact, team capacity reallocation, and recovery timeline.',
      status: 'draft',
      lastRun: null,
      duration: null,
      results: null,
    },
    {
      id: 'scn-004',
      name: 'Regulatory Change Impact',
      description: 'Model new SEC reporting requirements affecting all clients with AUM > $5M. Estimate compliance workload and cost.',
      status: 'completed',
      lastRun: '2026-03-20T09:00:00Z',
      duration: '2m 48s',
      results: { clientsImpacted: 45, additionalComplianceHours: 120, estimatedCost: 18000, deadlineRisk: 'medium' },
    },
  ])
}
