import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 'c-001',
      name: 'Jonathan Wellington III',
      company: 'Wellington Family Office',
      tier: 'platinum',
      status: 'active',
      health_score: 62,
      health_trend: 'declining',
      last_contact_days: 12,
      risk_reason: 'Health score dropped below 65; no meaningful touchpoint in 12 days',
      recommended_action: 'Schedule personal check-in call this week',
    },
    {
      id: 'c-004',
      name: 'Margaret Thornton',
      company: 'Thornton Estates',
      tier: 'silver',
      status: 'alumni',
      health_score: 45,
      health_trend: 'declining',
      last_contact_days: 52,
      wealth_event: {
        type: 'inheritance',
        description: 'Received $8M inheritance from family trust',
      },
      risk_reason: 'Alumni with major inheritance event — re-engagement window open',
      recommended_action: 'Send personalized outreach referencing inheritance; propose estate planning review',
    },
  ])
}
