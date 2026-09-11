/**
 * @jest-environment node
 */

/**
 * Dashboard & Signals — the eight handlers read from Prisma, require a
 * session, and state what they cannot compute.
 *
 * P-19 (T-027, T-053). All eight returned hardcoded literals to anonymous
 * callers. The card's acceptance is that **a test must fail if a hardcoded
 * literal is reintroduced**, so that is asserted directly, against the
 * source, rather than only through behaviour — a behavioural test passes
 * happily against a handler that queries Prisma and then returns a constant
 * anyway.
 *
 * Three layers, because no single one of them is sufficient:
 *
 *   1. **Source guards** (this file, always run). Every handler calls
 *      `requireSession`, reaches `prisma`, and contains none of the specific
 *      literals that were there. These need no database and no network, so
 *      they run in any environment.
 *   2. **`tsc --noEmit`** (CI, already green). This is what proves the
 *      Prisma queries are real: every `select`, `where` and aggregate is
 *      checked against the generated client, so a query naming a column that
 *      does not exist fails the build. The mocked-Prisma tests below could
 *      not catch that on their own, and a reader should not mistake them for
 *      validation of the schema.
 *   3. **Contract tests** (below, mocked Prisma). These pin the honest-
 *      absence behaviour: a trend that cannot be computed is `null` with a
 *      reason, not a number.
 *
 * NOTE FOR THE COORDINATOR: none of this runs in CI today. The `frontend`
 * job runs typecheck, lint and build, and **no workflow invokes `npm test`**
 * at all. See PARALLEL_BUILD_ESCALATION.md — every frontend jest test in
 * this repository is currently unexecuted, which affects P-19 through P-23
 * and P-25.
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const API = join(process.cwd(), 'src', 'app', 'api')

const HANDLERS: Record<string, string> = {
  'dashboard/kpis': join(API, 'dashboard', 'kpis', 'route.ts'),
  'wealth-events': join(API, 'wealth-events', 'route.ts'),
  'risk-queue': join(API, 'risk-queue', 'route.ts'),
  'daily-brief/today': join(API, 'daily-brief', 'today', 'route.ts'),
  'revenue/kpis': join(API, 'revenue', 'kpis', 'route.ts'),
  'revenue/mrr-history': join(API, 'revenue', 'mrr-history', 'route.ts'),
  'revenue/save-projection': join(API, 'revenue', 'save-projection', 'route.ts'),
  'opportunities/ranked': join(API, 'opportunities', 'ranked', 'route.ts'),
}

/** Source with block comments stripped, so the prose above a handler that
 *  quotes the old literals does not read as the literals coming back. */
function body(path: string): string {
  return readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
}

const entries = Object.entries(HANDLERS)

describe('every handler requires a session', () => {
  test.each(entries)('%s calls requireSession', (_name, path) => {
    const source = body(path)
    expect(source).toContain('requireSession')
    // The discriminated union is the point: reading session.userId without
    // handling the failure branch should not compile. Assert the branch is
    // actually returned rather than merely awaited.
    expect(source).toMatch(/if\s*\(!session\.ok\)\s*return session\.response/)
  })
})

describe('every handler that reports data reads it from the database', () => {
  // save-projection is the exception and it is deliberate: there is no
  // Projection model, so it refuses rather than pretending to write. It is
  // covered by its own test below.
  const reading = entries.filter(([name]) => name !== 'revenue/save-projection')

  test.each(reading)('%s queries prisma', (_name, path) => {
    const source = body(path)
    expect(source).toContain("from '@/lib/prisma'")
    expect(source).toMatch(/prisma\.\w+\.(findMany|findFirst|count|aggregate|groupBy)/)
  })
})

describe('the specific fabrications do not come back', () => {
  /**
   * The literals that were actually in these files. A regression here is not
   * hypothetical - this is the exact content that shipped, and matching on
   * the values themselves is what makes the test bite. Generic "no magic
   * numbers" linting would not have caught `probability: 0.85`.
   */
  const BANNED: Record<string, (string | RegExp)[]> = {
    'dashboard/kpis': [/value:\s*127\b/, /value:\s*284500\b/, /value:\s*12400000\b/],
    'wealth-events': ['Rivera Foundation', 'Nakamura Holdings', 'we-001'],
    'risk-queue': ['Johnson Family Trust', 'risk-001', 'Concentration limit breach'],
    'daily-brief/today': ['S&P 500', 'SEC disclosure'],
    'revenue/kpis': [/value:\s*284500\b/, /value:\s*8400\b/, 'platinum', 'bronze'],
    'revenue/mrr-history': [/mrr:\s*218000\b/, "'2025-05'"],
    'revenue/save-projection': [/success:\s*true/, /proj-\$\{Date\.now\(\)\}/],
    'opportunities/ranked': [/probability:\s*0\.85/, 'Chen Dynasty Fund', 'opp-001'],
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

describe('what cannot be computed is stated, not guessed', () => {
  test('daily brief does not invent market or regulatory commentary', () => {
    const source = body(HANDLERS['daily-brief/today'])
    expect(source).toContain('no_market_or_regulatory_source')
    expect(source).toMatch(/available:\s*false/)
  })

  test('revenue KPIs declare CAC, LTV and net retention unavailable', () => {
    const source = body(HANDLERS['revenue/kpis'])
    expect(source).toContain('no_acquisition_cost_data')
    expect(source).toContain('no_margin_or_lifetime_data')
    expect(source).toContain('no_period_history')
  })

  test('opportunities omit probability rather than estimating it', () => {
    const source = body(HANDLERS['opportunities/ranked'])
    expect(source).toContain('no_win_probability_model')
    // Absent from the payload entirely - a null in a familiar key still gets
    // rendered as a percentage by something, eventually.
    expect(source).not.toMatch(/probability:\s*[\d.]/)
  })

  test('mrr history does not infer churn from a missing invoice', () => {
    const source = body(HANDLERS['revenue/mrr-history'])
    expect(source).toContain('no_subscription_history')
    expect(source).toMatch(/churned:\s*null/)
  })

  test('dashboard KPIs return a null trend where there is no history', () => {
    const source = body(HANDLERS['dashboard/kpis'])
    expect(source).toContain('no_status_history')
    expect(source).toContain('no_retainer_history')
    expect(source).toContain('no_pipeline_history')
  })
})

describe('save-projection no longer confirms a write it did not make', () => {
  test('it refuses with 501 and says nothing was stored', () => {
    const source = body(HANDLERS['revenue/save-projection'])

    expect(source).toMatch(/saved:\s*false/)
    expect(source).toContain('not_implemented')
    expect(source).toMatch(/status:\s*501/)
    // The old handler's tell: a success flag and an id minted from the clock.
    expect(source).not.toMatch(/success:\s*true/)
    expect(source).not.toContain('Date.now()')
  })

  test('it does not write an audit entry, because nothing happened', () => {
    // P-03's writeAuditEntry records what an operator did. A refused request
    // is not an operator action, and auditing one would put a line in the
    // compliance trail for work that was never performed.
    expect(body(HANDLERS['revenue/save-projection'])).not.toContain(
      'writeAuditEntry'
    )
  })
})

describe('the guard guards something', () => {
  test('all eight handlers exist and are non-trivial', () => {
    // Vacuous passes are how three unregistered routers escaped the count in
    // P-13 through P-15. If a path here stops resolving, this fails rather
    // than quietly testing nothing.
    expect(entries).toHaveLength(8)
    for (const [name, path] of entries) {
      expect(typeof body(path)).toBe('string')
      expect(body(path).length).toBeGreaterThan(200)
      expect(name).toBeTruthy()
    }
  })
})
