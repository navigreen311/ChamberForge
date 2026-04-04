import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 'opp-001',
      rank: 1,
      tier: 'A',
      lifecycle: 'proposal',
      client: 'Johnson Family Trust',
      value: 2500000,
      probability: 0.85,
    },
    {
      id: 'opp-002',
      rank: 2,
      tier: 'A',
      lifecycle: 'discovery',
      client: 'Chen Dynasty Fund',
      value: 4200000,
      probability: 0.62,
    },
  ])
}
