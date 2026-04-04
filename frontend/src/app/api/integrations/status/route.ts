import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    voiceforge: {
      status: 'connected',
      latency: 45,
      lastSync: new Date().toISOString(),
      version: '2.1.0',
    },
    visionaudioforge: {
      status: 'connected',
      latency: 62,
      lastSync: new Date().toISOString(),
      version: '1.8.3',
    },
  })
}
