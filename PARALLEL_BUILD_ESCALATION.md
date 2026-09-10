# P-11 — Escalations

---

## 1. Prisma's `User` has no workspace column — D4 broke FastAPI's scoping

**The plan did not anticipate this and it is the most important thing here.**

D4 made Prisma source of truth for `User`. Prisma's `User` carries
`id, name, email, password, role, theme, mode, onboardedAt` — and **no
`workspace_id`**. FastAPI scopes everything on `workspace_id`, and **105
routes** depend on `get_workspace_id` returning one.

So repointing identity at Prisma is not a one-line swap: the new source of
truth cannot answer the question the old one was being asked.

**Resolved in `app/core/identity.py`:** identity (who) comes from Prisma;
the workspace is resolved from the FastAPI-owned `workspaces` table — the one
this operator owns, or, under D2 where there is a single operator, the only
one there is. If there are several and none is owned by the caller it returns
`None` and the request is refused. **Refusing to guess is the point** —
picking arbitrarily is how one operator ends up reading another's data.

`get_workspace_id` keeps its signature and return type, so none of the 105
routes changed.

**Action for whoever builds the reseller tier:** `_resolve_workspace()` is
the single function that grows a real lookup. Nothing else moves.

---

## 2. The Prisma tables may not exist — identity falls back, loudly

Alembic runs first and Prisma second (`docs/data-architecture.md`), and the
SQLite test database has no Prisma tables at all. Rather than refuse to
authenticate anyone on a half-provisioned database, `resolve_identity()`
falls back to the legacy `users` table and logs a warning **once** (not per
request, which would bury everything else).

Deliberate asymmetry worth knowing: if the Prisma table **exists** and has no
such user, that is authoritative — a "no such user", not a reason to consult
the legacy table. The fallback only triggers when the table is absent.

The table is read with **raw SQL on purpose**. Declaring a SQLAlchemy model
for `"User"` would put one table under both stacks, which is what
`test_data_architecture.py` forbids and the ownership guard tracks.

---

## 3. `/auth/register` still writes the legacy `users` table — unresolved

Under D1 registration belongs to NextAuth, which writes the Prisma `"User"`.
The FastAPI endpoint creates a **workspace and a user together**, so moving
it means deciding which stack owns sign-up — a question the plan has not
answered.

I left it on the legacy table and marked it in the source. **Guessing would
put new operators in a table the operator console cannot see.**

**This needs a ruling.** Options: NextAuth owns sign-up and creates the
workspace via a callback; or FastAPI owns it and writes the Prisma table
directly (a second sanctioned cross-stack write, which D5b currently says
there is only one of).

---

## 4. A second auth path was deleted: `stores/auth-store.ts`

A Zustand store duplicating `useAuth`, writing the access token to
`localStorage` and mirroring it into a **non-httpOnly** `auth_token` cookie —
the same exposure P-11 exists to close. **Nothing imported it** (checked
across the whole `src` tree; only the barrel re-exported it). Removed rather
than migrated: an unused second auth path is a liability with no offsetting
benefit.

---

## 5. Two test files rewritten because they asserted the vulnerability

`__tests__/hooks/useAuth.test.ts` asserted that login wrote the access token,
refresh token and user object into `localStorage`.
`__tests__/lib/api.test.ts` asserted the client read a token back out and set
an `Authorization` header from it.

Those tests were **pinning the defect in place** — they would have failed the
moment anyone fixed it. Rewritten to assert the inverse: nothing sensitive is
reachable from script, and a 401 has nothing client-side to clear.

Frontend suite: **23 failures vs 24 on main**, with 15 tests added. The
remaining 23 are pre-existing (Dashboard, Discover, Settings, Login page) and
belong to the packages that own those screens.

---

## 6. `middleware.ts` no longer exempts `/api`

It listed `/api` as public, which is why all 78 BFF handlers were anonymous
by default. Route handlers now get a cheap cookie check in middleware and a
real identity check in the handler via `requireSession()`.

The division of labour is not belt-and-braces: Next.js middleware runs on the
**edge runtime and cannot open a Prisma connection**, so it can confirm a
cookie is present but not that it maps to a live operator. Each check does
what the other cannot.

**`requireSession()` is FROZEN.** P-19 through P-23 implement 78 handlers
against it; a signature change is a change in five packages at once. It
returns a discriminated union so TypeScript refuses to let a handler read
`userId` without handling the unauthenticated branch — "I forgot to check"
is a compile error rather than a data leak.

---

# P-03 — Audit Trail Integrity

Tasks T-011, T-012. Merge order 5 of 30.

## 1. The middleware discarded the entries that mattered most

`middleware/audit.py` returned early whenever it could not resolve a
workspace, and wrote nothing. **187 routes still accept anonymous requests**
after P-02, so the rule in practice was: *a request that cannot be attributed
leaves no trace*. An attacker's requests were precisely the ones not recorded.

Anonymous mutations now write under a sentinel workspace,
`ANONYMOUS_WORKSPACE = "anonymous-unauthenticated"`. It is deliberately not a
UUID — it has to stand out in a query and must never collide with a real
workspace id. A test asserts it cannot be parsed as one.

A failing audit write is now reported to Datadog and Sentry rather than
swallowed. A dropped audit entry is a compliance event; the failure mode
nobody notices is the one that silently stops.

## 2. "Append-only" was asserted in the docs and enforced nowhere

P-01 added the database trigger. The trigger stops UPDATE and DELETE against
*that* database — it cannot speak to a restore from a doctored backup, or to
a migration that dropped the trigger.

`services/backbone/audit_chain.py` adds the half a trigger cannot: each entry
hashes its own content together with the previous entry's hash. Alter a field
and that entry's hash stops matching; remove an entry and the next one's
`prev_hash` points at nothing.

`verify_chain` reports **every** break, not just the first — one tampered row
makes every later `prev_hash` mismatch too, and being told only about the
first makes a single edit look identical to a wholesale rewrite. Rows written
before the chain existed are reported as "pre-chain", not silently accepted:
the trail cannot be verified across them and saying so is the point.

## 3. D5a — the same construction on both surfaces, never unified

`frontend/src/lib/audit.ts` publishes `writeAuditEntry()` for the operator
trail in Prisma `AuditLog`; the Python module covers the system trail in
FastAPI `audit_logs`. A full compliance export joins both by timestamp range,
and each verifies on its own.

**`writeAuditEntry()` is FROZEN.** P-19 through P-23 call it from every
mutating handler, so a signature change is a change in five packages at once.
It **never throws** — a handler must not fail because auditing did — but it
returns a boolean, because a silent drop is worse than a loud one.

`canonical_payload` / `canonicalPayload` is the contract between the two.
Cross-checked by actually computing both, not by inspection: identical
payload bytes and the identical digest
`b6dff9348cb7d89b58aad37ce4adfb568807f381338e27df9055fab3ed400ef5`. The
vectors are duplicated verbatim in both test files, so if one side drifts,
both suites fail.

## 4. Two bugs the tests caught, both of which would have shipped silently

**Timestamps had to become integers.** A tz-aware datetime written to the
column came back naive, so `.isoformat()` produced one string on write and a
different one on read — *every* hash failed to verify. Hashing **epoch
milliseconds** fixes it and, as a second benefit, removes a divergence that
would have broken the cross-language contract anyway: Python and JavaScript
format ISO timestamps differently (`+00:00` vs `Z`, differing sub-second
precision), so the two implementations would never have agreed.

**The chain order was ambiguous under load.** Entries are ordered by
timestamp, and `id` is a random uuid4 — no usable tiebreaker. Three writes in
the same millisecond were enough for the tip query to pick a different
predecessor than verification did, and *the chain failed to verify the moment
it was written*, with nothing tampered. On a real workload this would have
surfaced as intermittent tamper alarms on an untampered trail — the fastest
way to teach an operator to ignore them.

Both sides now write strictly after the previous entry, nudging by a
millisecond on collision. That buys a total order without a schema change;
the cost is that a burst records timestamps a few milliseconds late, which is
the right trade against an unverifiable trail. A test on each side asserts
timestamps are unique and increasing across a burst.

## 5. A monkeypatch that leaked into every later test

`tests/test_audit.py` rebound `audit_service.AuditLog` to a SQLite-compatible
mirror **at import time and never restored it**, so every test that ran
afterwards used the mirror. It also silently diverged from production — no
chain columns, and `Uuid` where production uses `String(36)`.

Fixed with an autouse fixture that restores the binding, and by aligning the
mirror. The chain functions take the model as an **explicit parameter** so
the service and the chain can never operate on different tables — which they
were doing, invisibly.

## 6. Results

- **Backend: 0 newly failing** (`check_test_regressions.py`: `OK — no new failures`)
- **Frontend: 23 failures, unchanged from what P-11 left**, with 10 tests added
- `ruff` 0 · `tsc` 0 · `next lint` 0 errors
- 20 audit tests pass (10 backend integrity + 10 frontend)

## 7. Still open — inherited from P-11, not introduced here

`/auth/register` writes the legacy `users` table. Under D1 registration
belongs to NextAuth, but the endpoint creates a workspace *and* a user, so
moving it means ruling on which stack owns sign-up. **Needs a decision before
P-19–P-23.**
