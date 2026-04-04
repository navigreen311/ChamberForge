import { NextResponse } from 'next/server'

// TODO: Replace with real scan engine status polling
// TODO: Add WebSocket support for live status updates
// TODO: Track per-source error rates and retry logic
export async function GET() {
  return NextResponse.json({
    status: 'idle',
    last_scan_at: '2 hours ago',
    problems_found: 47,
    sources: [
      { name: 'UBS Family Office Report', status: 'active' },
      { name: 'FBI/FTC Alerts', status: 'active' },
      { name: 'Deloitte Cyber Report', status: 'active' },
      { name: 'Citi Wealth 2025', status: 'active' },
      { name: 'PubMed', status: 'idle' },
      { name: 'Capgemini WWR', status: 'active' },
      { name: 'IC3 Reports', status: 'active' },
      { name: 'McKinsey Insights', status: 'active' },
      { name: 'FTC Press Releases', status: 'error' },
    ],
  })
}
