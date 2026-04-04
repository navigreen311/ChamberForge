import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'inv-2026-04', date: '2026-04-01T00:00:00Z', amount: 2499, status: 'paid', description: 'Enterprise Plan — April 2026', pdfUrl: '/invoices/inv-2026-04.pdf' },
    { id: 'inv-2026-03', date: '2026-03-01T00:00:00Z', amount: 2499, status: 'paid', description: 'Enterprise Plan — March 2026', pdfUrl: '/invoices/inv-2026-03.pdf' },
    { id: 'inv-2026-02', date: '2026-02-01T00:00:00Z', amount: 2499, status: 'paid', description: 'Enterprise Plan — February 2026', pdfUrl: '/invoices/inv-2026-02.pdf' },
    { id: 'inv-2026-01', date: '2026-01-01T00:00:00Z', amount: 2499, status: 'paid', description: 'Enterprise Plan — January 2026', pdfUrl: '/invoices/inv-2026-01.pdf' },
    { id: 'inv-2025-12', date: '2025-12-01T00:00:00Z', amount: 2499, status: 'paid', description: 'Enterprise Plan — December 2025', pdfUrl: '/invoices/inv-2025-12.pdf' },
    { id: 'inv-2025-11', date: '2025-11-01T00:00:00Z', amount: 2499, status: 'paid', description: 'Enterprise Plan — November 2025', pdfUrl: '/invoices/inv-2025-11.pdf' },
  ])
}
