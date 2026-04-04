import { NextResponse } from 'next/server'

const brandConfig = {
  companyName: 'Meridian Wealth Partners',
  logoUrl: '/brand/meridian-logo.svg',
  faviconUrl: '/brand/meridian-favicon.ico',
  primaryColor: '#1E3A5F',
  secondaryColor: '#4A90D9',
  accentColor: '#D4AF37',
  fontFamily: 'Inter',
  portalSubdomain: 'meridian',
  customDomain: 'portal.meridianwealth.com',
  emailFromName: 'Meridian Wealth Partners',
  emailFromAddress: 'noreply@meridianwealth.com',
  footerText: '© 2026 Meridian Wealth Partners. All rights reserved.',
  supportEmail: 'support@meridianwealth.com',
  enablePoweredBy: false,
}

export async function GET() {
  return NextResponse.json(brandConfig)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const updated = { ...brandConfig, ...body }
  return NextResponse.json(updated)
}
