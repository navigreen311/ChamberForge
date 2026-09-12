/**
 * @jest-environment node
 */

/**
 * Clients — eight handlers read from Prisma, require a session, and do not
 * invent anything about a family.
 *
 * P-20 (T-027, T-053). All eight served hardcoded data to anonymous callers.
 * The stakes here are higher than anywhere else in the BFF, and the guards
 * below are written around the three specific things that were being made up:
 *
 *   1. **Private observations.** "Spouse expressed frustration with lack of
 *      consolidated reporting", "Delayed response to last two follow-up
 *      emails". An advisor reading those believes their client is unhappy.
 *   2. **Financial claims to repeat to the client.** `generate-brief`
 *      produced "tax savings of $180K" and "client satisfaction survey
 *      results (92nd percentile)" for the advisor to say in the meeting.
 *   3. **A household roster with street addresses.** Five named relatives
 *      and four properties, served without a session.
 *
 * The structure follows P-19's three layers, and for the same reasons:
 * source guards here, `tsc --noEmit` proving the Prisma queries are real, and
 * contract tests with the auth boundary mocked.
 *
 * NOTE: no CI job runs these. The `frontend` job runs typecheck, lint and
 * build only, and no workflow invokes `npm test`. See the escalation.
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const CLIENTS = join(process.cwd(), 'src', 'app', 'api', 'clients')

const HANDLERS: Record<string, string> = {
  list: join(CLIENTS, 'route.ts'),
  detail: join(CLIENTS, '[id]', 'detail', 'route.ts'),
  'at-risk': join(CLIENTS, 'at-risk', 'route.ts'),
  'health-summary': join(CLIENTS, 'health-summary', 'route.ts'),
  kpis: join(CLIENTS, 'kpis', 'route.ts'),
  'wealth-events': join(CLIENTS, 'wealth-events', 'route.ts'),
  'generate-brief': join(CLIENTS, '[id]', 'generate-brief', 'route.ts'),
  'household-graph': join(CLIENTS, '[id]', 'household-graph', 'summary', 'route.ts'),
}

/**
 * Source with comments stripped, so prose *describing* the old fabrications
 * is not mistaken for the fabrications returning. Both forms are removed:
 * block comments, and whole-line `//` comments (matched only at the start of
 * a line, so a `https://` inside a string survives).
 *
 * This matters here more than usual - these handlers document what they
 * replaced, and quote it, which is the point.
 */
function body(path: string): string {
  return readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ 	]*\/\/.*$/gm, '')
}

const entries = Object.entries(HANDLERS)

describe('every client handler requires a session', () => {
  test.each(entries)('%s calls requireSession', (_name, path) => {
    const source = body(path)
    expect(source).toContain('requireSession')
    expect(source).toMatch(/if\s*\(!session\.ok\)\s*return session\.response/)
  })

  test('all eight handlers are covered', () => {
    // Vacuous passes are how three unregistered routers escaped the count in
    // P-13 through P-15.
    expect(entries).toHaveLength(8)
  })
})

describe('every handler scopes to the session operator', () => {
  test.each(entries)('%s filters by the session operator', (_name, path) => {
    const source = body(path)
    // Two spellings are in use: the where clause naming it directly, or the
    // handler lifting it to a local first. Both are scoped; only a handler
    // that does neither is a finding.
    const direct = source.includes('userId: session.userId')
    const lifted =
      /const userId = session\.userId/.test(source) && /userId,/.test(source)

    expect(direct || lifted).toBe(true)
  })
})

describe('the fabrications do not come back', () => {
  const BANNED: Record<string, (string | RegExp)[]> = {
    list: ['Jonathan Wellington III', 'Nakamura Holdings', "'c-001'", 'platinum'],
    detail: [
      'Spouse expressed frustration',
      'Delayed response to last two follow-up emails',
      'Platinum Estate Planning Suite',
      'household_summary: {',
    ],
    'at-risk': [
      'Health score dropped below 65; no meaningful touchpoint',
      'Send personalized outreach referencing inheritance',
      'Margaret Thornton',
    ],
    'health-summary': ['Johnson Family Trust', 'Rivera Foundation', "score: 92"],
    kpis: [/active_count:\s*3\b/, /mrr:\s*75000\b/, /avg_health:\s*81\b/],
    'wealth-events': ['Elena Rivera', '$12M endowment', 'Aisha Patel'],
    'generate-brief': [
      'tax savings of $180K',
      '92nd percentile',
      'conversation_opener',
      'proof_assets',
      'Unknown Client',
    ],
    'household-graph': [
      '1240 Park Avenue',
      'Catherine Wellington',
      "Sotheby",
      'adult-child',
    ],
  }

  for (const [name, banned] of Object.entries(BANNED)) {
    test(`${name} contains none of its old hardcoded values`, () => {
      const source = body(HANDLERS[name])
      for (const literal of banned) {
        if (typeof literal === 'string') {
          expect(source).not.toContain(literal)
        } else {
          expect(source).not.toMatch(literal)
        }
      }
    })
  }
})

describe('the handlers that report data read it from the database', () => {
  // The two 501s query only to resolve and scope the client, which is
  // asserted separately below.
  const reading = entries.filter(
    ([name]) => name !== 'generate-brief' && name !== 'household-graph'
  )

  test.each(reading)('%s queries prisma for its payload', (_name, path) => {
    const source = body(path)
    expect(source).toContain("from '@/lib/prisma'")
    expect(source).toMatch(/prisma\.\w+\.(findMany|findFirst|count|aggregate|groupBy)/)
  })
})

describe('nothing about a client is invented', () => {
  test('detail declares pain signals and recommendations unavailable', () => {
    const source = body(HANDLERS.detail)
    expect(source).toContain('no_pain_signal_record')
    expect(source).toContain('no_recommendation_source')
    expect(source).toContain('no_touchpoint_model')
  })

  test('at-risk reports the trigger and not a remedy', () => {
    const source = body(HANDLERS['at-risk'])
    expect(source).toContain('no_recommendation_source')
    // The old field name must not reappear under any value.
    expect(source).not.toMatch(/recommended_action:/)
  })

  test('at-risk reasons quote the value that fired the rule', () => {
    // A reason an advisor cannot check is only a different kind of assertion.
    const source = body(HANDLERS['at-risk'])
    expect(source).toContain('is below the ${HEALTH_FLOOR} threshold')
    expect(source).toContain('No contact recorded in ${contactDays} days')
  })

  test('the list does not guess KPI coverage or touchpoint counts', () => {
    const source = body(HANDLERS.list)
    expect(source).toContain('no_kpi_coverage_model')
    expect(source).toContain('no_touchpoint_model')
  })

  test('client KPI deltas are null rather than invented', () => {
    const source = body(HANDLERS.kpis)
    expect(source).toMatch(/active_delta:\s*null/)
    expect(source).toMatch(/mrr_delta:\s*null/)
    expect(source).toContain('no_period_history')
  })
})

describe('the at-risk rule has exactly one definition', () => {
  test('both handlers import the thresholds rather than declaring them', () => {
    // A counter and a list that disagree is how a screen reads "1 at risk"
    // above three rows. Next.js forbids exporting a constant from route.ts,
    // hence the shared module.
    for (const name of ['at-risk', 'kpis']) {
      const source = body(HANDLERS[name])
      expect(source).toContain("from '@/app/api/clients/_rules'")
      expect(source).not.toMatch(/^const HEALTH_FLOOR/m)
      expect(source).not.toMatch(/^const STALE_CONTACT_DAYS/m)
    }
  })
})

describe('the two blocked handlers refuse rather than fabricate', () => {
  test('generate-brief returns 501 and produces no brief', () => {
    const source = body(HANDLERS['generate-brief'])
    expect(source).toMatch(/generated:\s*false/)
    expect(source).toMatch(/status:\s*501/)
    expect(source).toContain('not_implemented')
    // It must not reimplement what the backend service owns.
    expect(source).not.toContain('pain_signals')
    expect(source).not.toContain('objections')
  })

  test('household-graph returns 501 and produces no household', () => {
    const source = body(HANDLERS['household-graph'])
    expect(source).toMatch(/available:\s*false/)
    expect(source).toMatch(/status:\s*501/)
    expect(source).not.toContain('properties:')
    expect(source).not.toContain('people:')
  })

  test('both still resolve and scope the client before refusing', () => {
    // So the route is correct the moment the backend channel exists, and so
    // a brief cannot be requested for someone else's client meanwhile.
    for (const name of ['generate-brief', 'household-graph']) {
      const source = body(HANDLERS[name])
      expect(source).toContain('prisma.client.findFirst')
      expect(source).toContain('userId: session.userId')
    }
  })
})

describe('PII does not leak through error payloads', () => {
  test.each(entries)('%s never echoes the client id in an error', (_name, path) => {
    const source = body(path)
    // The card's flag: no client identifiers in logs or error payloads.
    expect(source).not.toMatch(/message:[^\n]*\$\{params\.id\}/)
    expect(source).not.toMatch(/error[^\n]*\$\{params\.id\}/)
  })

  test('a client outside the operator book is indistinguishable from a missing one', () => {
    // A 403 would confirm the record exists. On a route that returns a
    // family's affairs, that is itself a disclosure.
    for (const name of ['detail', 'generate-brief', 'household-graph']) {
      const source = body(HANDLERS[name])
      expect(source).toMatch(/status:\s*404/)
      expect(source).not.toMatch(/status:\s*403/)
    }
  })
})

describe('the hook no longer calls an endpoint that never existed', () => {
  const hook = () =>
    readFileSync(join(process.cwd(), 'src', 'hooks', 'useClients.ts'), 'utf8')

  test('reads go to the BFF, not to the missing FastAPI clients router', () => {
    const source = hook().replace(/\/\*[\s\S]*?\*\//g, '')
    expect(source).not.toContain('/api/v1/clients')
    expect(source).toContain("fetch(`/api/clients")
  })

  test('an unauthorised read sets an error rather than an empty list', () => {
    // An empty list reads as "this operator has no clients", which is a
    // different and wrong statement.
    const source = hook()
    expect(source).toMatch(/setError\([^)]*\)\n\s*setClients\(\[\]\)/)
  })
})
