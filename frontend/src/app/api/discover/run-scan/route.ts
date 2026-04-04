import { NextResponse } from 'next/server'

// TODO: Replace with real scan job queue (Bull/BullMQ or similar)
// TODO: Add rate limiting to prevent scan spam
// TODO: Return WebSocket channel ID for real-time progress updates
// TODO: Validate that no scan is already running before starting
export async function POST() {
  const jobId = `scan-${Date.now().toString(36)}`

  return NextResponse.json({
    job_id: jobId,
    status: 'started',
    estimated_time: '3-5 minutes',
  })
}
