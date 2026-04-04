import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'ptr-001', name: 'Apex Tax Advisors', type: 'tax', contactName: 'Robert Kim', contactEmail: 'r.kim@apextax.com', status: 'active', clientsShared: 28, lastCollaboration: '2026-04-02T14:00:00Z', rating: 4.9 },
    { id: 'ptr-002', name: 'Sterling Estate Law', type: 'legal', contactName: 'Amanda Sterling', contactEmail: 'a.sterling@sterlingestatelaw.com', status: 'active', clientsShared: 15, lastCollaboration: '2026-04-01T10:00:00Z', rating: 4.8 },
    { id: 'ptr-003', name: 'Pacific Insurance Group', type: 'insurance', contactName: 'James Tanaka', contactEmail: 'j.tanaka@pacificins.com', status: 'active', clientsShared: 22, lastCollaboration: '2026-03-28T16:00:00Z', rating: 4.6 },
    { id: 'ptr-004', name: 'Heritage Real Estate Partners', type: 'real-estate', contactName: 'Lisa Morales', contactEmail: 'l.morales@heritagere.com', status: 'active', clientsShared: 9, lastCollaboration: '2026-03-25T11:00:00Z', rating: 4.7 },
    { id: 'ptr-005', name: 'Northridge Private Banking', type: 'banking', contactName: 'William Chen', contactEmail: 'w.chen@northridgebank.com', status: 'inactive', clientsShared: 6, lastCollaboration: '2026-02-15T09:00:00Z', rating: 4.2 },
    { id: 'ptr-006', name: 'Clearview Compliance Solutions', type: 'compliance', contactName: 'Priya Sharma', contactEmail: 'p.sharma@clearviewcs.com', status: 'active', clientsShared: 31, lastCollaboration: '2026-04-03T08:00:00Z', rating: 4.9 },
  ])
}
