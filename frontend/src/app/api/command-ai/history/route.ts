import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'act-001', timestamp: '2026-04-03T09:10:00Z', type: 'query', summary: 'Asked about Johnson Trust risk status', status: 'completed' },
    { id: 'act-002', timestamp: '2026-04-03T08:45:00Z', type: 'generation', summary: 'Generated rebalancing playbook for tech concentration', status: 'completed' },
    { id: 'act-003', timestamp: '2026-04-03T08:30:00Z', type: 'analysis', summary: 'Ran portfolio stress test across 12 client accounts', status: 'completed' },
    { id: 'act-004', timestamp: '2026-04-02T17:20:00Z', type: 'query', summary: 'Requested Q1 revenue breakdown by client segment', status: 'completed' },
    { id: 'act-005', timestamp: '2026-04-02T16:00:00Z', type: 'generation', summary: 'Drafted quarterly review materials for Nakamura Holdings', status: 'completed' },
    { id: 'act-006', timestamp: '2026-04-02T14:30:00Z', type: 'automation', summary: 'Triggered wealth event scan for new SEC filings', status: 'completed' },
    { id: 'act-007', timestamp: '2026-04-02T11:15:00Z', type: 'query', summary: 'Compared client retention rates vs industry benchmarks', status: 'completed' },
    { id: 'act-008', timestamp: '2026-04-01T16:45:00Z', type: 'generation', summary: 'Created onboarding checklist for new client: Patel Family Office', status: 'completed' },
    { id: 'act-009', timestamp: '2026-04-01T10:00:00Z', type: 'analysis', summary: 'Identified 4 clients eligible for premium tier upgrade', status: 'completed' },
    { id: 'act-010', timestamp: '2026-03-31T15:30:00Z', type: 'automation', summary: 'Scheduled automated compliance reports for month-end', status: 'completed' },
  ])
}
