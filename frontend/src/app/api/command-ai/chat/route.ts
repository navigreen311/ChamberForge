import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { message } = await request.json()

  // Simulate AI processing delay context
  const responses: Record<string, string> = {
    default: 'I analyzed your request. Based on current client data, here are my recommendations:\n\n1. **Johnson Family Trust** has a tech concentration at 42% — consider rebalancing with a diversified ETF allocation.\n2. **Nakamura Holdings** emerging market exposure is trending above policy limits.\n3. Three clients have upcoming quarterly reviews this week that need preparation.\n\nWould you like me to draft a rebalancing proposal or prepare review materials?',
  }

  const lowerMessage = (message || '').toLowerCase()
  let responseText = responses.default

  if (lowerMessage.includes('risk')) {
    responseText = 'I found 3 active risk items in the queue:\n\n- **HIGH**: Johnson Trust tech allocation breach (42% vs 35% limit)\n- **MEDIUM**: Nakamura EM exposure above policy\n- **LOW**: Rivera pending document signatures\n\nThe Johnson Trust item is most urgent. Shall I generate a rebalancing playbook?'
  } else if (lowerMessage.includes('client') || lowerMessage.includes('portfolio')) {
    responseText = 'Your top client metrics:\n\n- **127 active clients** (up 3.2% this quarter)\n- **Average health score**: 82/100\n- **14 wealth events** detected this month\n- **$12.4M** pipeline value\n\n3 clients need attention this week. Want me to prioritize them?'
  } else if (lowerMessage.includes('revenue') || lowerMessage.includes('billing')) {
    responseText = 'Revenue snapshot:\n\n- **MRR**: $284,500 (up 1.8%)\n- **ARR**: $3.41M\n- **Net retention**: 112%\n- **Avg revenue per client**: $2,240/mo\n\nTop growth opportunities: 4 clients eligible for premium tier upgrade. Shall I draft upgrade proposals?'
  }

  return NextResponse.json({
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: responseText,
    timestamp: new Date().toISOString(),
    suggestedActions: [
      { id: 'sa-1', label: 'View risk queue', action: '/risk-queue' },
      { id: 'sa-2', label: 'Open client dashboard', action: '/clients' },
      { id: 'sa-3', label: 'Generate report', action: '/exports' },
    ],
  })
}
