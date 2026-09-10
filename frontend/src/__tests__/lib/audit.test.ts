/**
 * @jest-environment node
 *
 * The audit chain, and the contract with the Python implementation.
 *
 * P-03. D5a runs the same chain construction on both surfaces so a
 * compliance export can be verified end to end. That only holds if the two
 * produce byte-identical input - so the vectors below are duplicated
 * verbatim in backend/tests/test_audit_integrity.py. If one side changes and
 * the other does not, both suites fail, which is the point.
 */
import { canonicalPayload, computeEntryHash, writeAuditEntry } from '@/lib/audit'

const findFirst = jest.fn()
const create = jest.fn()
jest.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      findFirst: (...args: unknown[]) => findFirst(...args),
      create: (...args: unknown[]) => create(...args),
    },
  },
}))

beforeEach(() => {
  findFirst.mockReset()
  create.mockReset()
})

const VECTOR = {
  workspaceId: '',
  userId: 'user-1',
  action: 'offer.create',
  resourceType: 'Offer',
  resourceId: 'of-1',
  timestamp: 1789603200000,
}

describe('canonicalPayload', () => {
  it('matches the Python implementation byte for byte', () => {
    // Identical to the string asserted in test_audit_integrity.py.
    expect(canonicalPayload(VECTOR)).toBe(
      '{"action":"offer.create","resource_id":"of-1","resource_type":"Offer",' +
        '"timestamp":1789603200000,"user_id":"user-1","workspace_id":""}'
    )
  })

  it('uses an integer timestamp, not an ISO string', () => {
    // The bug this prevents: a tz-aware datetime came back naive from the
    // database, so Python hashed one string on write and another on read and
    // every entry failed to verify. An integer has one representation.
    expect(canonicalPayload(VECTOR)).toContain('"timestamp":1789603200000')
    expect(canonicalPayload(VECTOR)).not.toContain('Z"')
  })

  it('normalises null fields to empty strings, as Python does', () => {
    const payload = canonicalPayload({ ...VECTOR, resourceId: null, userId: null })
    expect(payload).toContain('"resource_id":""')
    expect(payload).toContain('"user_id":""')
  })
})

describe('computeEntryHash', () => {
  it('treats a null previous hash as the genesis marker', () => {
    const payload = canonicalPayload(VECTOR)
    expect(computeEntryHash(null, payload)).toBe(
      computeEntryHash('genesis', payload)
    )
  })

  it('chains - the same entry after a different predecessor hashes differently', () => {
    // Without this, entries would be reorderable without detection.
    const payload = canonicalPayload(VECTOR)
    expect(computeEntryHash('abc', payload)).not.toBe(
      computeEntryHash(null, payload)
    )
  })

  it('changes when any hashed field changes', () => {
    const base = computeEntryHash(null, canonicalPayload(VECTOR))
    expect(
      computeEntryHash(null, canonicalPayload({ ...VECTOR, action: 'offer.delete' }))
    ).not.toBe(base)
    expect(
      computeEntryHash(null, canonicalPayload({ ...VECTOR, resourceId: 'of-2' }))
    ).not.toBe(base)
  })

  it('produces a sha256 hex digest', () => {
    expect(computeEntryHash(null, canonicalPayload(VECTOR))).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('writeAuditEntry', () => {
  const input = {
    userId: 'user-1',
    action: 'offer.create',
    resourceType: 'Offer',
    resourceId: 'of-1',
  }

  it('writes strictly after the previous entry, even in the same millisecond', async () => {
    // The chain is ordered by createdAt, so a tie makes the order ambiguous
    // - `id` is a cuid and gives no reliable tiebreaker. The Python side hit
    // exactly this: three writes shared a millisecond and the chain failed
    // to verify with nothing tampered.
    const tip = new Date('2026-09-10T14:00:00.000Z')
    // Pin the clock to the tip's own millisecond - that collision is the
    // whole point, and a real clock would race past it.
    jest.useFakeTimers().setSystemTime(tip)
    findFirst.mockResolvedValue({ entryHash: 'abc', createdAt: tip })
    create.mockResolvedValue({})

    expect(await writeAuditEntry(input)).toBe(true)

    const written = create.mock.calls[0][0].data.createdAt as Date
    expect(written.getTime()).toBe(tip.getTime() + 1)
    jest.useRealTimers()
  })

  it('hashes the timestamp it actually stores', async () => {
    // Hashing `new Date()` while storing a nudged value would produce a row
    // that cannot verify against its own content.
    const tip = new Date('2026-09-10T14:00:00.000Z')
    findFirst.mockResolvedValue({ entryHash: 'abc', createdAt: tip })
    create.mockResolvedValue({})

    await writeAuditEntry(input)

    const { createdAt, entryHash, prevHash } = create.mock.calls[0][0].data
    expect(entryHash).toBe(
      computeEntryHash(
        prevHash,
        canonicalPayload({
          workspaceId: '',
          userId: input.userId,
          action: input.action,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          timestamp: (createdAt as Date).getTime(),
        })
      )
    )
  })

  it('reports a failed write instead of throwing at the handler', async () => {
    // A handler must not fail because auditing did - but a silent drop is
    // the failure mode nobody notices.
    findFirst.mockRejectedValue(new Error('database is gone'))
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

    await expect(writeAuditEntry(input)).resolves.toBe(false)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
