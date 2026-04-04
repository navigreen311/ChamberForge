import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 'risk-001',
      severity: 'high',
      module: 'compliance',
      title: 'Concentration limit breach — Johnson Trust tech allocation at 42%',
      client: 'Johnson Family Trust',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'risk-002',
      severity: 'medium',
      module: 'market',
      title: 'Emerging market exposure exceeds policy for Nakamura',
      client: 'Nakamura Holdings',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'risk-003',
      severity: 'low',
      module: 'operational',
      title: 'Pending document signatures for Rivera annual review',
      client: 'Rivera Foundation',
      createdAt: new Date().toISOString(),
    },
  ])
}
