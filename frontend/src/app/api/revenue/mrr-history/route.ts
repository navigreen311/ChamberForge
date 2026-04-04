import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { month: '2025-05', mrr: 218000, clients: 98, newClients: 5, churned: 1 },
    { month: '2025-06', mrr: 224500, clients: 102, newClients: 6, churned: 2 },
    { month: '2025-07', mrr: 231000, clients: 105, newClients: 4, churned: 1 },
    { month: '2025-08', mrr: 238200, clients: 108, newClients: 5, churned: 2 },
    { month: '2025-09', mrr: 245800, clients: 111, newClients: 4, churned: 1 },
    { month: '2025-10', mrr: 252000, clients: 114, newClients: 5, churned: 2 },
    { month: '2025-11', mrr: 258500, clients: 116, newClients: 3, churned: 1 },
    { month: '2025-12', mrr: 264000, clients: 118, newClients: 4, churned: 2 },
    { month: '2026-01', mrr: 271200, clients: 121, newClients: 5, churned: 2 },
    { month: '2026-02', mrr: 276800, clients: 123, newClients: 3, churned: 1 },
    { month: '2026-03', mrr: 279500, clients: 125, newClients: 4, churned: 2 },
    { month: '2026-04', mrr: 284500, clients: 127, newClients: 3, churned: 1 },
  ])
}
