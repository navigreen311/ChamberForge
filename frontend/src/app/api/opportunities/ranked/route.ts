import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { rank: 1, problem: 'AI Voice Cloning Wire Fraud', tier: 'UHNW', lifecycle: 'Emerging', offer: 'Family Cyber Command', probability: 89, impact: 9.2, composite: 8.2, stage: 'close' },
    { rank: 2, problem: 'Coordination Overload — Multi-Entity', tier: 'HNW', lifecycle: 'Accelerating', offer: 'Private Ops Office', probability: 76, impact: 7.8, composite: 5.9, stage: 'build' },
    { rank: 3, problem: 'Data Broker Exposure', tier: 'UHNW', lifecycle: 'Proven', offer: 'Footprint Reduction', probability: 65, impact: 6.5, composite: 4.2, stage: 'validate' },
    { rank: 4, problem: 'Succession Conflict — Next Gen', tier: 'HNW', lifecycle: 'Accelerating', offer: null, probability: 52, impact: 8.1, composite: 4.2, stage: 'build' },
    { rank: 5, problem: 'Insurance Market Hardening', tier: 'HNW', lifecycle: 'Saturated', offer: 'Property Resilience', probability: 41, impact: 5.2, composite: 2.1, stage: 'review' },
  ])
}
