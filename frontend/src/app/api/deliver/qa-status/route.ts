import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    sla_compliance: {
      failures: 2,
      status: 'failing',
    },
    onboarding_quality: 75,
    review_cadence: 'behind',
    proof_assets: {
      complete: 4,
      total: 6,
    },
    portal_usage: {
      active: 2,
      total: 5,
    },
    escalation_response: {
      avg_hours: 18,
      status: 'amber',
    },
  })
}
