import { NextResponse } from 'next/server'

// TODO: Replace with real config persistence (database or config service)
// TODO: Add validation schema for config updates
// TODO: Add audit logging for config changes
export async function GET() {
  return NextResponse.json({
    scan_interval_hours: 24,
    auto_scan_enabled: true,
    sources: [
      { name: 'UBS Family Office Report', enabled: true },
      { name: 'FBI/FTC Alerts', enabled: true },
      { name: 'Deloitte Cyber Report', enabled: true },
      { name: 'Citi Wealth 2025', enabled: true },
      { name: 'PubMed', enabled: false },
      { name: 'Capgemini WWR', enabled: true },
      { name: 'IC3 Reports', enabled: true },
      { name: 'McKinsey Insights', enabled: true },
      { name: 'FTC Press Releases', enabled: true },
    ],
    urgency_threshold: 5.0,
    credibility_threshold: 6.0,
    stale_after_days: 90,
  })
}

export async function POST(request: Request) {
  // TODO: Validate and persist config changes
  // TODO: Trigger re-scan if source toggles changed
  const config = await request.json()
  console.log('Scan config updated:', config)

  return NextResponse.json({ success: true })
}
