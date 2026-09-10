import { prisma } from '@/lib/prisma'

/**
 * The operator audit trail.
 *
 * P-03 publishes this and **the interface is frozen** — P-19 through P-23
 * call it from every mutating handler, so a signature change here is a change
 * in five packages at once.
 *
 * D5a settled two audit surfaces, never unified:
 *
 *   - **this one** records what the operator does in the UI — created an
 *     offer, updated a client, exported a PDF, approved a risk item — and is
 *     what appears under Settings → Security → Audit Log;
 *   - FastAPI's `audit_logs` records system-layer mutations: agent actions,
 *     Celery completions, index operations, ingestion events.
 *
 * A full compliance export joins both by timestamp range. Each carries the
 * **same hash chain**, so either can be verified on its own.
 *
 * The chain construction is the contract with
 * `backend/app/services/backbone/audit_chain.py`. `canonicalPayload` and
 * `computeEntryHash` below must stay byte-identical to their Python
 * counterparts — if they drift, the two trails stop agreeing and a
 * compliance export cannot be verified end to end.
 */

import { createHash } from 'crypto'

/** Marks the first entry in a chain. Matches GENESIS in audit_chain.py. */
const GENESIS = 'genesis'

export interface AuditEntryInput {
  /** The operator. Always the session's userId, never a value from the request. */
  userId: string
  /** Dotted verb, e.g. `offer.create`, `client.update`, `export.generate`. */
  action: string
  /** The Prisma model name, e.g. `Offer`. */
  resourceType: string
  resourceId?: string | null
  /**
   * Free-form context. Deliberately NOT hashed — its JSON serialisation
   * differs between Python and JavaScript, and a chain that breaks on key
   * ordering catches nothing but itself.
   */
  details?: Record<string, unknown>
  ipAddress?: string | null
}

/**
 * The exact string that gets hashed.
 *
 * Key order is fixed and separators are tight, because two implementations
 * must produce identical bytes. Mirrors `canonical_payload` in
 * `audit_chain.py`; JSON.stringify with an explicit key array gives the same
 * output as Python's `sort_keys=True` for this fixed, alphabetical set.
 */
export function canonicalPayload(input: {
  workspaceId: string
  userId: string | null
  action: string
  resourceType: string
  resourceId: string | null
  /**
   * Epoch MILLISECONDS, not an ISO string. Two reasons, both found the hard
   * way on the Python side:
   *
   *   - a tz-aware datetime written to the column comes back naive, so
   *     `.isoformat()` produced one string on write and another on read and
   *     every hash failed to verify;
   *   - Python and JavaScript format ISO timestamps differently anyway
   *     (`+00:00` versus `Z`, differing sub-second precision), so the two
   *     implementations would never have agreed.
   *
   * An integer has one representation in both languages.
   */
  timestamp: number
}): string {
  return JSON.stringify(
    {
      action: input.action,
      resource_id: input.resourceId ?? '',
      resource_type: input.resourceType,
      timestamp: input.timestamp,
      user_id: input.userId ?? '',
      workspace_id: input.workspaceId ?? '',
    },
    ['action', 'resource_id', 'resource_type', 'timestamp', 'user_id', 'workspace_id']
  )
}

/** sha256 over the previous hash and this entry's canonical payload. */
export function computeEntryHash(
  prevHash: string | null,
  payload: string
): string {
  return createHash('sha256')
    .update(`${prevHash ?? GENESIS}|${payload}`)
    .digest('hex')
}

/**
 * Record an operator action.
 *
 * Call this on **every mutation** — create, update, delete. Reads are not
 * audited; auditing them would bury the actions that matter under page views.
 *
 *   const session = await requireSession()
 *   if (!session.ok) return session.response
 *   const offer = await prisma.offer.create({ data })
 *   await writeAuditEntry({
 *     userId: session.userId,
 *     action: 'offer.create',
 *     resourceType: 'Offer',
 *     resourceId: offer.id,
 *   })
 *
 * **Never throws.** A handler must not fail because auditing did — but a
 * silent drop is the failure mode nobody notices, so a failure is reported
 * and the function returns false. Check it where the action is
 * compliance-critical.
 */
export async function writeAuditEntry(
  input: AuditEntryInput
): Promise<boolean> {
  try {
    // The tip of this operator's chain.
    const previous = await prisma.auditLog.findFirst({
      where: { userId: input.userId },
      orderBy: { createdAt: 'desc' },
      select: { entryHash: true, createdAt: true },
    })
    const prevHash = previous?.entryHash ?? null

    // Strictly after the previous entry. The chain is ordered by createdAt,
    // and two entries sharing a millisecond would make that order ambiguous
    // - `id` is a cuid and offers no reliable tiebreaker, so the tip query
    // above and a later verification pass could disagree about which entry
    // preceded which. Found on the Python side, where three rapid writes
    // produced a chain that failed to verify the moment it was written.
    //
    // A millisecond nudge buys a total order without a schema change; the
    // cost is that a burst of writes records timestamps a few milliseconds
    // late, which is the right trade against an unverifiable trail.
    const now = new Date()
    const timestamp =
      previous?.createdAt && now <= previous.createdAt
        ? new Date(previous.createdAt.getTime() + 1)
        : now

    const entryHash = computeEntryHash(
      prevHash,
      canonicalPayload({
        // The operator trail is scoped by user, not workspace (D2). The
        // field is kept in the payload so both implementations hash the
        // same shape.
        workspaceId: '',
        userId: input.userId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId ?? null,
        timestamp: timestamp.getTime(),
      })
    )

    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId ?? null,
        details: (input.details ?? {}) as never,
        ipAddress: input.ipAddress ?? null,
        prevHash,
        entryHash,
        createdAt: timestamp,
      },
    })
    return true
  } catch (error) {
    // A dropped audit entry is a compliance event. Report it rather than
    // letting the trail quietly stop.
    console.error('[audit] write failed', {
      action: input.action,
      resourceType: input.resourceType,
      error,
    })
    return false
  }
}

export interface ChainBreak {
  entryId: string
  timestamp: string
  reason: string
}

/**
 * Recompute an operator's chain and report any break.
 *
 * The database trigger P-01 added stops UPDATE and DELETE against the live
 * database. This catches what a trigger cannot: a restore from a doctored
 * backup, or a migration that dropped the trigger.
 *
 * Reports every break rather than stopping at the first, because one tampered
 * row makes every later `prevHash` mismatch too — and being told only about
 * the first makes a single edit look identical to a wholesale rewrite.
 */
export async function verifyChain(userId: string): Promise<{
  ok: boolean
  checked: number
  breaks: ChainBreak[]
}> {
  const rows = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })

  const breaks: ChainBreak[] = []
  let expectedPrev: string | null = null

  for (const row of rows) {
    const timestamp = row.createdAt.toISOString()

    if (expectedPrev !== null && row.prevHash !== expectedPrev) {
      breaks.push({
        entryId: row.id,
        timestamp,
        reason:
          'prevHash does not match the preceding entry - an entry was altered or removed',
      })
    }

    const recomputed = computeEntryHash(
      row.prevHash,
      canonicalPayload({
        workspaceId: '',
        userId: row.userId,
        action: row.action,
        resourceType: row.resourceType,
        resourceId: row.resourceId ?? null,
        timestamp: row.createdAt.getTime(),
      })
    )
    if (recomputed !== row.entryHash) {
      breaks.push({
        entryId: row.id,
        timestamp,
        reason: 'entry content does not match its recorded hash',
      })
    }

    expectedPrev = row.entryHash
  }

  return { ok: breaks.length === 0, checked: rows.length, breaks }
}
