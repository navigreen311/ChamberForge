import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 'we-001',
      type: 'inheritance',
      timestamp: new Date().toISOString(),
      client: 'Rivera Foundation',
      impact: 'high',
      value: 3200000,
    },
    {
      id: 'we-002',
      type: 'liquidity_event',
      timestamp: new Date().toISOString(),
      client: 'Nakamura Holdings',
      impact: 'medium',
      value: 850000,
    },
  ])
}
