import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'src-001', name: 'SEC EDGAR Filings', type: 'regulatory', status: 'active', documentsIndexed: 48200, lastCrawl: '2026-04-03T06:00:00Z', crawlFrequency: 'daily', reliability: 98.5 },
    { id: 'src-002', name: 'Bloomberg News Wire', type: 'news', status: 'active', documentsIndexed: 124500, lastCrawl: '2026-04-03T09:00:00Z', crawlFrequency: 'hourly', reliability: 97.2 },
    { id: 'src-003', name: 'County Property Records', type: 'public-records', status: 'active', documentsIndexed: 8900, lastCrawl: '2026-04-02T06:00:00Z', crawlFrequency: 'daily', reliability: 94.8 },
    { id: 'src-004', name: 'LinkedIn Professional Profiles', type: 'social', status: 'active', documentsIndexed: 3200, lastCrawl: '2026-04-03T04:00:00Z', crawlFrequency: 'weekly', reliability: 88.3 },
    { id: 'src-005', name: 'IRS Public Tax Data', type: 'regulatory', status: 'active', documentsIndexed: 15600, lastCrawl: '2026-04-01T06:00:00Z', crawlFrequency: 'weekly', reliability: 99.1 },
    { id: 'src-006', name: 'Court Records (PACER)', type: 'legal', status: 'active', documentsIndexed: 6400, lastCrawl: '2026-04-02T06:00:00Z', crawlFrequency: 'daily', reliability: 96.7 },
    { id: 'src-007', name: 'Crunchbase Business Data', type: 'business', status: 'active', documentsIndexed: 22100, lastCrawl: '2026-04-03T03:00:00Z', crawlFrequency: 'daily', reliability: 91.4 },
    { id: 'src-008', name: 'State UCC Filings', type: 'regulatory', status: 'degraded', documentsIndexed: 4100, lastCrawl: '2026-03-30T06:00:00Z', crawlFrequency: 'daily', reliability: 85.2, error: 'Partial timeout on 3 state portals' },
    { id: 'src-009', name: 'PitchBook Private Markets', type: 'market-data', status: 'active', documentsIndexed: 18400, lastCrawl: '2026-04-03T05:00:00Z', crawlFrequency: 'daily', reliability: 95.9 },
  ])
}
