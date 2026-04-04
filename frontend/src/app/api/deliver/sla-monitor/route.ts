import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    overall: 88,
    clients: [
      {
        name: 'Wellington Trust',
        adherence: 72,
        status: 'critical',
      },
      {
        name: 'Elizabeth Thornton',
        adherence: 85,
        status: 'at_risk',
      },
      {
        name: 'Marcus Reid',
        adherence: 100,
        status: 'on_track',
      },
      {
        name: 'Harrington Family Office',
        adherence: 91,
        status: 'on_track',
      },
      {
        name: 'Victoria Ashworth',
        adherence: 95,
        status: 'on_track',
      },
    ],
  })
}
