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
