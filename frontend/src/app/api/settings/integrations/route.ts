import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'int-001', name: 'Salesforce CRM', category: 'crm', status: 'connected', lastSync: '2026-04-03T08:15:00Z', recordsSynced: 12480 },
    { id: 'int-002', name: 'Bloomberg Terminal', category: 'market-data', status: 'connected', lastSync: '2026-04-03T09:00:00Z', recordsSynced: 458200 },
    { id: 'int-003', name: 'Orion Portfolio', category: 'portfolio', status: 'connected', lastSync: '2026-04-03T07:30:00Z', recordsSynced: 3240 },
    { id: 'int-004', name: 'DocuSign', category: 'document', status: 'connected', lastSync: '2026-04-02T22:00:00Z', recordsSynced: 890 },
    { id: 'int-005', name: 'Slack', category: 'communication', status: 'connected', lastSync: '2026-04-03T09:05:00Z', recordsSynced: 24100 },
    { id: 'int-006', name: 'Redtail CRM', category: 'crm', status: 'disconnected', lastSync: '2026-03-15T12:00:00Z', recordsSynced: 0 },
    { id: 'int-007', name: 'Morningstar Direct', category: 'research', status: 'connected', lastSync: '2026-04-03T06:00:00Z', recordsSynced: 18750 },
    { id: 'int-008', name: 'Wealthbox', category: 'crm', status: 'pending', lastSync: null, recordsSynced: 0 },
    { id: 'int-009', name: 'Riskalyze', category: 'risk', status: 'connected', lastSync: '2026-04-03T08:45:00Z', recordsSynced: 2100 },
    { id: 'int-010', name: 'Calendly', category: 'scheduling', status: 'error', lastSync: '2026-04-01T14:30:00Z', recordsSynced: 560, error: 'OAuth token expired — re-authenticate required' },
    { id: 'int-011', name: 'Schwab Advisor Center', category: 'custodian', status: 'connected', lastSync: '2026-04-03T07:00:00Z', recordsSynced: 8920 },
  ])
}
