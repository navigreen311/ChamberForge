import { NextResponse } from 'next/server'

// TODO: Replace with real schedule data from database / job scheduler
// TODO: Support PUT to update schedule preferences
export async function GET() {
  const now = new Date()

  // Next daily scan is tomorrow at 8 AM
  const nextScan = new Date(now)
  nextScan.setDate(nextScan.getDate() + 1)
  nextScan.setHours(8, 0, 0, 0)

  return NextResponse.json({
    nextScan: nextScan.toISOString(),
    nextScanType: 'Daily',
    schedules: [
      {
        scanType: 'Regulatory alerts',
        frequency: 'Real-time',
        sourcesChecked: 'FBI, FTC, SEC',
        lastRun: 'Live',
      },
      {
        scanType: 'Daily scan',
        frequency: 'Every day 8 AM',
        sourcesChecked: 'All 13 sources',
        lastRun: new Date(now.getTime() - 16 * 60 * 60 * 1000).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }) + ' today',
      },
      {
        scanType: 'Weekly deep scan',
        frequency: 'Every Monday',
        sourcesChecked: 'All sources + new reports',
        lastRun: 'Mon, Mar 31',
      },
      {
        scanType: 'Monthly re-score',
        frequency: '1st of month',
        sourcesChecked: 'Full problem library',
        lastRun: 'Apr 1',
      },
    ],
  })
}
