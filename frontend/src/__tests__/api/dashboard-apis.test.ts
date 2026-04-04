/**
 * @jest-environment node
 */

// Test all 9 dashboard API routes return proper data shapes
describe('Dashboard API Routes', () => {
  test('GET /api/dashboard/kpis returns 6 metrics with value/trend/direction', async () => {
    const { GET } = await import('@/app/api/dashboard/kpis/route')
    const response = await GET()
    const data = await response.json()

    const expectedMetrics = [
      'active_clients',
      'monthly_retainer',
      'pipeline_value',
      'avg_health_score',
      'wealth_events',
      'risk_queue',
    ]

    for (const metric of expectedMetrics) {
      expect(data).toHaveProperty(metric)
      expect(data[metric]).toHaveProperty('value')
      expect(data[metric]).toHaveProperty('trend')
      expect(data[metric]).toHaveProperty('direction')
      expect(['up', 'down', 'stable']).toContain(data[metric].direction)
      expect(typeof data[metric].value).toBe('number')
      expect(typeof data[metric].trend).toBe('number')
    }
  })

  test('GET /api/command-ai/next-action returns action with evidence chain', async () => {
    const { GET } = await import('@/app/api/command-ai/next-action/route')
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveProperty('priority')
    expect(data).toHaveProperty('confidence')
    expect(data).toHaveProperty('title')
    expect(data).toHaveProperty('evidence_chain')
    expect(typeof data.confidence).toBe('number')
    expect(data.confidence).toBeGreaterThanOrEqual(0)
    expect(data.confidence).toBeLessThanOrEqual(1)
    expect(Array.isArray(data.evidence_chain)).toBe(true)
    expect(data.evidence_chain.length).toBeGreaterThan(0)
    expect(data.evidence_chain[0]).toHaveProperty('source')
    expect(data.evidence_chain[0]).toHaveProperty('detail')
    expect(data.evidence_chain[0]).toHaveProperty('credibility')
    expect(typeof data.evidence_chain[0].credibility).toBe('number')
  })

  test('GET /api/clients/health-summary returns array of clients with score', async () => {
    const { GET } = await import('@/app/api/clients/health-summary/route')
    const response = await GET()
    const data = await response.json()

    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)

    for (const client of data) {
      expect(client).toHaveProperty('id')
      expect(client).toHaveProperty('name')
      expect(client).toHaveProperty('score')
      expect(client).toHaveProperty('tier')
      expect(client).toHaveProperty('trend')
      expect(typeof client.score).toBe('number')
      expect(client.score).toBeGreaterThanOrEqual(0)
      expect(client.score).toBeLessThanOrEqual(100)
    }
  })

  test('GET /api/opportunities/ranked returns array with rank, tier, lifecycle', async () => {
    const { GET } = await import('@/app/api/opportunities/ranked/route')
    const response = await GET()
    const data = await response.json()

    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)

    for (const opp of data) {
      expect(opp).toHaveProperty('id')
      expect(opp).toHaveProperty('rank')
      expect(opp).toHaveProperty('tier')
      expect(opp).toHaveProperty('lifecycle')
      expect(opp).toHaveProperty('client')
      expect(opp).toHaveProperty('value')
      expect(opp).toHaveProperty('probability')
      expect(typeof opp.rank).toBe('number')
      expect(typeof opp.value).toBe('number')
    }

    // Verify ranked order
    for (let i = 1; i < data.length; i++) {
      expect(data[i].rank).toBeGreaterThan(data[i - 1].rank)
    }
  })

  test('GET /api/wealth-events returns array with type and timestamp', async () => {
    const { GET } = await import('@/app/api/wealth-events/route')
    const response = await GET()
    const data = await response.json()

    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)

    for (const event of data) {
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('type')
      expect(event).toHaveProperty('timestamp')
      expect(event).toHaveProperty('client')
      expect(event).toHaveProperty('impact')
      expect(typeof event.timestamp).toBe('string')
      expect(new Date(event.timestamp).toString()).not.toBe('Invalid Date')
    }
  })

  test('GET /api/daily-brief/today returns date, changes, alerts, actions', async () => {
    const { GET } = await import('@/app/api/daily-brief/today/route')
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveProperty('date')
    expect(data).toHaveProperty('changes')
    expect(data).toHaveProperty('alerts')
    expect(data).toHaveProperty('actions')

    // date should be YYYY-MM-DD format
    expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)

    expect(Array.isArray(data.changes)).toBe(true)
    expect(Array.isArray(data.alerts)).toBe(true)
    expect(Array.isArray(data.actions)).toBe(true)

    expect(data.changes[0]).toHaveProperty('category')
    expect(data.changes[0]).toHaveProperty('summary')
    expect(data.alerts[0]).toHaveProperty('severity')
    expect(data.alerts[0]).toHaveProperty('message')
    expect(data.actions[0]).toHaveProperty('priority')
    expect(data.actions[0]).toHaveProperty('title')
  })

  test('GET /api/agents/status returns array of 10 agents with status', async () => {
    const { GET } = await import('@/app/api/agents/status/route')
    const response = await GET()
    const data = await response.json()

    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(10)

    for (const agent of data) {
      expect(agent).toHaveProperty('id')
      expect(agent).toHaveProperty('name')
      expect(agent).toHaveProperty('status')
      expect(agent).toHaveProperty('lastHeartbeat')
      expect(['active', 'idle', 'error', 'offline']).toContain(agent.status)
      expect(typeof agent.lastHeartbeat).toBe('string')
    }
  })

  test('GET /api/risk-queue returns array with severity and module', async () => {
    const { GET } = await import('@/app/api/risk-queue/route')
    const response = await GET()
    const data = await response.json()

    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)

    for (const risk of data) {
      expect(risk).toHaveProperty('id')
      expect(risk).toHaveProperty('severity')
      expect(risk).toHaveProperty('module')
      expect(risk).toHaveProperty('title')
      expect(risk).toHaveProperty('client')
      expect(['high', 'medium', 'low', 'critical']).toContain(risk.severity)
      expect(typeof risk.module).toBe('string')
    }
  })

  test('GET /api/integrations/status returns voiceforge + visionaudioforge', async () => {
    const { GET } = await import('@/app/api/integrations/status/route')
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveProperty('voiceforge')
    expect(data).toHaveProperty('visionaudioforge')

    for (const key of ['voiceforge', 'visionaudioforge'] as const) {
      const integration = data[key]
      expect(integration).toHaveProperty('status')
      expect(integration).toHaveProperty('latency')
      expect(integration).toHaveProperty('lastSync')
      expect(integration).toHaveProperty('version')
      expect(['connected', 'disconnected', 'degraded']).toContain(integration.status)
      expect(typeof integration.latency).toBe('number')
    }
  })
})
