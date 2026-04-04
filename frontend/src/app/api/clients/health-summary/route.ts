import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'c-001', name: 'Johnson Family Trust', score: 92, tier: 'platinum', trend: 'stable' },
    { id: 'c-002', name: 'Nakamura Holdings', score: 78, tier: 'gold', trend: 'declining' },
    { id: 'c-003', name: 'Rivera Foundation', score: 85, tier: 'platinum', trend: 'improving' },
  ])
}
