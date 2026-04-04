import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'clm-001', claim: 'Johnson Family Trust has concentrated tech position exceeding 40%', confidence: 0.96, sources: ['Orion Portfolio', 'Bloomberg'], client: 'Johnson Family Trust', category: 'risk', verifiedAt: '2026-04-03T08:15:00Z', status: 'verified' },
    { id: 'clm-002', claim: 'Nakamura Holdings CEO recently sold $2.3M in company stock', confidence: 0.92, sources: ['SEC EDGAR', 'Bloomberg News Wire'], client: 'Nakamura Holdings', category: 'wealth-event', verifiedAt: '2026-04-03T06:30:00Z', status: 'verified' },
    { id: 'clm-003', claim: 'Rivera Foundation property at 145 Oak Lane appraised at $4.8M', confidence: 0.88, sources: ['County Property Records'], client: 'Rivera Foundation', category: 'asset', verifiedAt: '2026-04-02T14:00:00Z', status: 'verified' },
    { id: 'clm-004', claim: 'Patel Family Office exploring Series B investment in AI startup', confidence: 0.74, sources: ['Crunchbase', 'LinkedIn'], client: 'Patel Family Office', category: 'opportunity', verifiedAt: '2026-04-02T10:00:00Z', status: 'pending-review' },
    { id: 'clm-005', claim: 'Chen Family reported $1.2M charitable donation in Q1 filing', confidence: 0.95, sources: ['IRS Public Tax Data'], client: 'Chen Family', category: 'tax', verifiedAt: '2026-04-01T09:00:00Z', status: 'verified' },
    { id: 'clm-006', claim: 'Morrison Group involved in pending litigation (case #24-CV-3847)', confidence: 0.91, sources: ['Court Records (PACER)'], client: 'Morrison Group', category: 'legal', verifiedAt: '2026-04-01T11:00:00Z', status: 'verified' },
    { id: 'clm-007', claim: 'Whitfield Estate beneficiary recently changed employment to Goldman Sachs', confidence: 0.82, sources: ['LinkedIn'], client: 'Whitfield Estate', category: 'life-event', verifiedAt: '2026-03-31T16:00:00Z', status: 'verified' },
    { id: 'clm-008', claim: 'Tanaka Corp filed UCC lien against subsidiary for $500K equipment', confidence: 0.68, sources: ['State UCC Filings'], client: 'Tanaka Corp', category: 'legal', verifiedAt: '2026-03-30T12:00:00Z', status: 'unverified' },
    { id: 'clm-009', claim: 'Garcia Holdings acquired minority stake in regional bank', confidence: 0.87, sources: ['SEC EDGAR', 'PitchBook'], client: 'Garcia Holdings', category: 'wealth-event', verifiedAt: '2026-03-29T15:00:00Z', status: 'verified' },
    { id: 'clm-010', claim: 'Yamamoto Trust planning real estate portfolio expansion in Southeast', confidence: 0.63, sources: ['Crunchbase', 'County Property Records'], client: 'Yamamoto Trust', category: 'opportunity', verifiedAt: '2026-03-28T10:00:00Z', status: 'pending-review' },
  ])
}
