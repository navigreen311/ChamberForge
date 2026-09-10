/**
 * @jest-environment node
 *
 * NextResponse comes from next/server, which needs the node runtime rather
 * than jsdom.
 */
/**
 * P-11. `requireSession()` is the gate 78 BFF handlers will call, so its
 * failure modes matter more than its happy path: a bug here is 78 open
 * endpoints, not one.
 */
import { requireSession, requireRole } from '@/lib/require-session'

// authOptions pulls in the Prisma client, which this test has no need for -
// the guard's behaviour is entirely about what getServerSession returns.
jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))

import { getServerSession as realGetServerSession } from 'next-auth/next'

// jest.mock is hoisted above the imports, so this is the mock.
const getServerSession = realGetServerSession as unknown as jest.Mock

describe('requireSession', () => {
  beforeEach(() => jest.resetAllMocks())

  it('rejects when there is no session', async () => {
    getServerSession.mockResolvedValue(null)
    const result = await requireSession()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.response.status).toBe(401)
  })

  it('rejects a session with no operator id', async () => {
    // A session object exists but carries no id - every handler scopes its
    // Prisma queries by that id, so proceeding would query for `undefined`.
    getServerSession.mockResolvedValue({ user: { email: 'a@b.com' } })
    const result = await requireSession()
    expect(result.ok).toBe(false)
  })

  it('fails CLOSED when the session lookup throws', async () => {
    // A misconfigured secret or unreachable database must not read as
    // "authenticated".
    getServerSession.mockRejectedValue(new Error('no NEXTAUTH_SECRET'))
    const result = await requireSession()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.response.status).toBe(401)
  })

  it('returns the operator id on success', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'u1', email: 'a@b.com', role: 'admin', mode: 'expert' },
    })
    const result = await requireSession()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.userId).toBe('u1')
      expect(result.role).toBe('admin')
    }
  })

  it('defaults role and mode rather than returning undefined', async () => {
    getServerSession.mockResolvedValue({ user: { id: 'u1' } })
    const result = await requireSession()
    if (result.ok) {
      expect(result.role).toBe('operator')
      expect(result.mode).toBe('expert')
    }
  })
})

describe('requireRole', () => {
  beforeEach(() => jest.resetAllMocks())

  it('refuses a role that is not allowed', async () => {
    getServerSession.mockResolvedValue({ user: { id: 'u1', role: 'operator' } })
    const result = await requireRole('admin')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.response.status).toBe(403)
  })

  it('allows a permitted role', async () => {
    getServerSession.mockResolvedValue({ user: { id: 'u1', role: 'admin' } })
    const result = await requireRole('admin', 'owner')
    expect(result.ok).toBe(true)
  })

  it('returns 401 rather than 403 when unauthenticated', async () => {
    // The distinction matters: 403 tells an anonymous caller the resource
    // exists and they merely lack a role.
    getServerSession.mockResolvedValue(null)
    const result = await requireRole('admin')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.response.status).toBe(401)
  })
})
