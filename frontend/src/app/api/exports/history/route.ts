import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'exp-001', name: 'Q1 2026 Client Performance Report', type: 'pdf', format: 'PDF', status: 'completed', createdAt: '2026-04-02T15:30:00Z', createdBy: 'Sarah Chen', fileSize: '2.4 MB', downloadUrl: '/exports/q1-2026-performance.pdf' },
    { id: 'exp-002', name: 'Risk Queue Export — March 2026', type: 'csv', format: 'CSV', status: 'completed', createdAt: '2026-04-01T09:00:00Z', createdBy: 'Marcus Rivera', fileSize: '124 KB', downloadUrl: '/exports/risk-march-2026.csv' },
    { id: 'exp-003', name: 'Full Client List with AUM', type: 'xlsx', format: 'Excel', status: 'completed', createdAt: '2026-03-31T14:00:00Z', createdBy: 'Sarah Chen', fileSize: '890 KB', downloadUrl: '/exports/clients-aum.xlsx' },
    { id: 'exp-004', name: 'Compliance Audit Trail — Q1', type: 'pdf', format: 'PDF', status: 'completed', createdAt: '2026-03-31T10:00:00Z', createdBy: 'Emily Nakamura', fileSize: '5.1 MB', downloadUrl: '/exports/compliance-q1.pdf' },
    { id: 'exp-005', name: 'Revenue Analytics Dashboard Data', type: 'csv', format: 'CSV', status: 'completed', createdAt: '2026-03-28T16:00:00Z', createdBy: 'Sarah Chen', fileSize: '256 KB', downloadUrl: '/exports/revenue-analytics.csv' },
    { id: 'exp-006', name: 'Playbook Effectiveness Report', type: 'pdf', format: 'PDF', status: 'processing', createdAt: '2026-04-03T09:15:00Z', createdBy: 'Marcus Rivera', fileSize: null, downloadUrl: null },
    { id: 'exp-007', name: 'Partner Collaboration Summary', type: 'xlsx', format: 'Excel', status: 'completed', createdAt: '2026-03-25T11:00:00Z', createdBy: 'Emily Nakamura', fileSize: '340 KB', downloadUrl: '/exports/partner-collab.xlsx' },
    { id: 'exp-008', name: 'AI Agent Activity Log — March', type: 'csv', format: 'CSV', status: 'failed', createdAt: '2026-04-01T08:00:00Z', createdBy: 'Sarah Chen', fileSize: null, downloadUrl: null, error: 'Export timed out — data range too large. Try narrowing date range.' },
  ])
}
