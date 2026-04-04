import { NextResponse } from 'next/server'

// TODO: Replace with database upsert to user's watchlist table
// TODO: Add authentication check and user ID extraction
// TODO: Implement duplicate detection and toggle (save/unsave)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { problemId } = body

    if (!problemId) {
      return NextResponse.json(
        { error: 'problemId is required' },
        { status: 400 }
      )
    }

    // Mock: simulate saving to watchlist and returning updated count
    const watchlistCounts: Record<string, number> = {
      'ai-voice-fraud': 142,
      'coordination-overload': 98,
      'data-broker-exposure': 117,
      'risk-governance-gaps': 85,
      'healthcare-navigation': 73,
    }

    const baseCount = watchlistCounts[problemId] ?? 31
    const newCount = baseCount + 1

    return NextResponse.json({
      saved: true,
      watchlist_count: newCount,
    })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
