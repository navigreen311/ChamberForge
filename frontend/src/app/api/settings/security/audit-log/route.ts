import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'aud-001', timestamp: '2026-04-03T09:12:00Z', user: 'Sarah Chen', action: 'login', details: 'Successful login via SSO', ipAddress: '203.0.113.42', resource: 'auth' },
    { id: 'aud-002', timestamp: '2026-04-03T08:55:00Z', user: 'Marcus Rivera', action: 'export', details: 'Exported client portfolio report for Johnson Family Trust', ipAddress: '198.51.100.17', resource: 'reports' },
    { id: 'aud-003', timestamp: '2026-04-03T08:30:00Z', user: 'Sarah Chen', action: 'update', details: 'Modified team member role: David Okafor → analyst', ipAddress: '203.0.113.42', resource: 'team' },
    { id: 'aud-004', timestamp: '2026-04-02T17:45:00Z', user: 'Emily Nakamura', action: 'create', details: 'Created new playbook: Q2 Tax-Loss Harvesting Strategy', ipAddress: '192.0.2.88', resource: 'playbooks' },
    { id: 'aud-005', timestamp: '2026-04-02T16:20:00Z', user: 'Marcus Rivera', action: 'delete', details: 'Removed draft deliverable: Nakamura Q1 Review (draft)', ipAddress: '198.51.100.17', resource: 'deliverables' },
    { id: 'aud-006', timestamp: '2026-04-02T14:10:00Z', user: 'Sarah Chen', action: 'update', details: 'Updated integration credentials for Salesforce CRM', ipAddress: '203.0.113.42', resource: 'integrations' },
    { id: 'aud-007', timestamp: '2026-04-02T11:00:00Z', user: 'System', action: 'alert', details: 'Calendly OAuth token expired — integration paused', ipAddress: null, resource: 'integrations' },
    { id: 'aud-008', timestamp: '2026-04-01T09:30:00Z', user: 'Sarah Chen', action: 'update', details: 'Changed billing plan from Professional to Enterprise', ipAddress: '203.0.113.42', resource: 'billing' },
  ])
}
