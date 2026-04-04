import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    date: new Date().toISOString().split('T')[0],
    changes: [
      { category: 'market', summary: 'S&P 500 up 1.2% — tech sector leading' },
      { category: 'regulatory', summary: 'New SEC disclosure requirements effective Q3' },
    ],
    alerts: [
      { severity: 'warning', message: 'Johnson Trust approaching concentration limit in tech' },
    ],
    actions: [
      { priority: 'high', title: 'Review rebalancing proposal', client: 'Johnson Family Trust' },
      { priority: 'medium', title: 'Schedule annual review', client: 'Rivera Foundation' },
    ],
  })
}
