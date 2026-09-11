/**
 * @jest-environment node
 */

// NextAuth ships ESM that this repository's jest transform does not handle -
// importing `@/lib/auth` for real fails with "Unexpected token 'export'"
// before any test runs. `jest.config.ts` is P-00-frozen, so the auth library
// boundary is mocked here instead. What is under test is the handler's use of
// the guard, not next-auth itself; that the handler calls `requireSession`
// with the real signature is asserted against the source in
// dashboard-signals.test.ts, which needs no mocks at all.
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(async () => null),
}))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

// Test all 9 dashboard API routes return proper data shapes.
//
// P-19 note: the five routes this package owns - dashboard/kpis,
// opportunities/ranked, wealth-events, daily-brief/today and risk-queue -
// used to be asserted here against their hardcoded contents. Those
// assertions REQUIRED the fabrication: `typeof trend === 'number'` on an
// invented percentage, `changes[0].summary` on market commentary with no
// source behind it, `length > 0` on a literal array. They would have failed
// the moment a handler started reading real data, which is the same shape as
// the P-15 watermark test that pinned a misattribution defect in place.
//
// What is asserted here now is the property that survives real data: the
// route refuses an anonymous caller. Shape and honest-absence contracts live
// in dashboard-signals.test.ts, next to the source guards.
//
// The four routes below that P-19 does not own are untouched.
describe('Dashboard API Routes', () => {
  test('GET /api/dashboard/kpis rejects an anonymous caller', async () => {
    const { GET } = await import('@/app/api/dashboard/kpis/route')
    const response = await GET()

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error_code).toBe('not_authenticated')
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

  test('GET /api/opportunities/ranked rejects an anonymous caller', async () => {
    const { GET } = await import('@/app/api/opportunities/ranked/route')
    const response = await GET()

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error_code).toBe('not_authenticated')
  })
  test('GET /api/wealth-events rejects an anonymous caller', async () => {
    const { GET } = await import('@/app/api/wealth-events/route')
    const response = await GET(new Request('http://localhost/api/test'))

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error_code).toBe('not_authenticated')
  })
  test('GET /api/daily-brief/today rejects an anonymous caller', async () => {
    const { GET } = await import('@/app/api/daily-brief/today/route')
    const response = await GET()

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error_code).toBe('not_authenticated')
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

  test('GET /api/risk-queue rejects an anonymous caller', async () => {
    const { GET } = await import('@/app/api/risk-queue/route')
    const response = await GET(new Request('http://localhost/api/test'))

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error_code).toBe('not_authenticated')
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
