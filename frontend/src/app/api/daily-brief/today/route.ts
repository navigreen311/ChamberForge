import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    date: new Date().toISOString().split('T')[0],
    changes: [
      'Wellington Trust health score dropped from 71 to 62',
      'New evidence added: FBI AI impersonation alert (credibility 9.2)',
      'Private Ops Office offer moved to active status',
      '2 new wealth events detected in your target market',
    ],
    alerts: [
      { severity: 'critical', message: 'Wellington Trust health below 65 — intervention recommended' },
      { severity: 'high', message: 'Evidence source "UBS Wealth Report 2024" approaching 18-month staleness' },
      { severity: 'high', message: 'Regulatory change: FTC data broker rules update effective next month' },
    ],
    actions: [
      { id: 'a1', text: 'Review Wellington Trust health decline', priority: 'critical', done: false },
      { id: 'a2', text: 'Generate intel brief for Marcus Reid (new exit)', priority: 'high', done: false },
      { id: 'a3', text: 'Update Evidence Graph with latest FBI alert', priority: 'high', done: true },
      { id: 'a4', text: 'Schedule quarterly review with Sarah Chen', priority: 'medium', done: false },
    ],
  })
}
