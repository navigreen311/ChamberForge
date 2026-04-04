import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      client_id: 'c-003',
      client_name: 'Elena Rivera',
      client_status: 'active',
      event_type: 'liquidity-event',
      description: 'Foundation received $12M endowment from estate settlement',
      detected_at: '2026-03-28T09:00:00Z',
    },
    {
      client_id: 'c-004',
      client_name: 'Margaret Thornton',
      client_status: 'alumni',
      event_type: 'inheritance',
      description: 'Received $8M inheritance from family trust',
      detected_at: '2026-03-15T11:30:00Z',
    },
    {
      client_id: 'c-005',
      client_name: 'David Chen',
      client_status: 'prospect',
      event_type: 'ipo',
      description: 'Portfolio company IPO valued at $200M',
      detected_at: '2026-03-20T14:00:00Z',
    },
    {
      client_id: 'c-008',
      client_name: 'Aisha Patel',
      client_status: 'active',
      event_type: 'business-sale',
      description: 'Exploring sale of medical practice ($5M valuation)',
      detected_at: '2026-03-10T16:45:00Z',
    },
  ])
}
