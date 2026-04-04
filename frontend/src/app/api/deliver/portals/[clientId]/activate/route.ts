import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  return NextResponse.json({
    success: true,
    portal_url: `https://portal.chamberforge.io/client/${params.clientId}`,
    token: `portal_tok_${params.clientId}_${Date.now().toString(36)}`,
  })
}
