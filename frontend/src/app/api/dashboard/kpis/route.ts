import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: Replace with Prisma queries
  return NextResponse.json({
    active_clients: { value: 12, trend: '+3', direction: 'up' },
    monthly_retainer: { value: 284000, trend: '+18%', direction: 'up' },
    pipeline_value: { value: 1420000, trend: '+42%', direction: 'up' },
    avg_health_score: { value: 82.4, trend: '-2.1', direction: 'down' },
    wealth_events: { value: 7, trend: '+4', direction: 'up' },
    risk_queue: { value: 3, trend: '+1', direction: 'up' },
  })
}
