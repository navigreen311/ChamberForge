import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    voiceforge: { connected: true, modules_active: 6, name: 'VoiceForge' },
    visionaudioforge: { connected: true, modules_active: 8, name: 'VisionAudioForge' },
  })
}
