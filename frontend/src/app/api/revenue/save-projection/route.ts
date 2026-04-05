import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  // TODO: Save to database via Prisma
  const projectionId = `proj-${Date.now()}`
  return NextResponse.json({
    success: true,
    projectionId,
    message: `Projection saved: ${body.offerName} — ${body.clients} clients at $${(body.ratePerMonth/1000).toFixed(0)}K/mo = $${body.monthlyRevenue.toLocaleString()}/mo`,
  })
}
