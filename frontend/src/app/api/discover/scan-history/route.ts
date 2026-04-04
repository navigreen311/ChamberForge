import { NextResponse } from 'next/server'

// TODO: Replace with real scan job history from database
// TODO: Add pagination and date-range filtering
// TODO: Include per-source breakdown in scan results
export async function GET() {
  const scans = [
    {
      id: 'scan-047',
      timestamp: '2026-04-03T08:15:00Z',
      problems_discovered: 2,
      status: 'complete' as const,
      duration: '4m 32s',
    },
    {
      id: 'scan-046',
      timestamp: '2026-04-02T08:15:00Z',
      problems_discovered: 0,
      status: 'complete' as const,
      duration: '3m 58s',
    },
    {
      id: 'scan-045',
      timestamp: '2026-04-01T08:15:00Z',
      problems_discovered: 3,
      status: 'complete' as const,
      duration: '5m 11s',
    },
    {
      id: 'scan-044',
      timestamp: '2026-03-31T08:15:00Z',
      problems_discovered: 1,
      status: 'partial' as const,
      duration: '6m 45s',
    },
    {
      id: 'scan-043',
      timestamp: '2026-03-30T08:15:00Z',
      problems_discovered: 0,
      status: 'failed' as const,
      duration: '1m 02s',
    },
    {
      id: 'scan-042',
      timestamp: '2026-03-29T08:15:00Z',
      problems_discovered: 4,
      status: 'complete' as const,
      duration: '4m 19s',
    },
  ]

  return NextResponse.json(scans)
}
