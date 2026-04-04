import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      type: 'sla_breach',
      client: 'Wellington Trust',
      description: 'Incident Response Plan exceeded SLA by 2 days — critical priority deliverable',
      auto_triggered: true,
      created_at: '2026-04-01T17:00:00Z',
    },
  ])
}
