import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    priority: 'high',
    confidence: 0.92,
    title: 'Review portfolio rebalancing for Johnson Family Trust',
    description: 'Market conditions and recent life event trigger rebalancing review.',
    evidence_chain: [
      {
        source: 'market-monitor',
        detail: 'Sector rotation detected in tech holdings',
        credibility: 0.88,
        timestamp: new Date().toISOString(),
      },
      {
        source: 'life-event-tracker',
        detail: 'Beneficiary turned 25 — distribution clause activated',
        credibility: 0.95,
        timestamp: new Date().toISOString(),
      },
    ],
  })
}
