# P-02 — Escalations

---

## 1. `TenantMiddleware` refuses bad credentials, but NOT absent ones

**This is a partial delivery of T-006 and it needs recording.**

The card said the middleware should refuse a request with no resolvable
identity. I built exactly that, ran the suite, and it failed **163 tests**.
After fixing the test fixture (item 2) it still failed **106** — every one in
a file owned by **P-13 through P-18**:

```
15 test_workspace_settings   14 test_playbooks_api   12 test_qualify_api
10 test_playbook_api          9 test_playbook_flow    8 test_profile
 8 test_lifecycle_api         5 test_storage_api      4 test_search_api
```

They fail because they call routes that still have no auth dependency — 187
of them. Landing the refusal in P-02 would mean editing 106 tests across six
other packages' files in one commit, which is the cross-package edit the
plan forbids, and the ledger's own rule says a package may not baseline
failures to make its PR pass.

**What shipped instead.** The middleware now:

- **binds the operator scope** for every authenticated request, reset in a
  `finally` so it cannot leak into the next request on the same worker;
- **refuses credentials that do not decode** — expired, tampered, or wrongly
  signed. That is unambiguous, so it is rejected rather than passed to a
  route that may not check;
- **passes through a request with no credentials**, leaving the per-route
  dependency as the gate.

**Why this is defensible rather than a climb-down:** `Depends(get_workspace_id)`
is the gate FastAPI is designed around, it is overridable in tests, and
`test_auth_coverage.py` makes it universal by counting the open routes down
to zero. Middleware refusal would be a redundant second gate whose only
unique value is catching a route someone forgot — which the guard already
catches at CI time, before it ships.

**Action for the coordinator:** the absent-credentials refusal is now
implicit in P-13–P-18 finishing. **P-26 must flip
`AUTH_COVERAGE_ENFORCING=1`** — that is the point at which no route can be
reached anonymously, and it is the real completion of T-006.

---

## 2. `backend/tests/conftest.py` — a P-00-frozen file

The `authed_client` fixture authenticated by **overriding FastAPI
dependencies** and never sent a token. Dependency overrides resolve at the
router, which runs *after* middleware, so the fixture was testing every route
with the security layer effectively disabled — and a fixture that bypasses a
security control cannot tell you whether that control works.

It now also issues a real access token. The overrides stay, so the rest of
each test remains hermetic, but the request now travels the real chain:
middleware decodes the token and binds the scope.

**This is an edit to a P-00-owned file.** Per `PARALLEL_BUILD.md` the
coordinator lands P-00 amendments between merge windows; recording it here
so it is not mistaken for a package reaching outside its list. It fixed 57
of the 163 failures on its own.

---

## 3. `db/session.py` — scoping is NOT applied at the sessionmaker

The obvious implementation was a global filter on `SessionLocal`. Rejected:
it silently changes what every existing `db.query(...)` returns, including
the 25 files still reading the legacy domain tables, and a silent change to
what a query returns is the hardest kind of bug to find.

Scope is bound by the middleware and applied at query time through
`app.db.scope.scoped_query`. `get_db`'s signature is unchanged, as the card
requires.

---

## 4. `primitives.py` — the hole was wider than the card said

The card named three request bodies. `workspace_id` was **also a path
parameter** on six routes (`/rules/{workspace_id}`,
`/records/{workspace_id}/holds`, `/records/{workspace_id}/retention`,
`/sandbox/{workspace_id}`, `/runtime/{workspace_id}/dashboard`,
`/runtime/{workspace_id}/agent/{agent_name}`). Equally spoofable — anyone
could read another operator's rules, legal holds, retention schedule,
sandboxes or AI spend by editing the URL.

**Those six routes changed shape.** The workspace segment is gone:

```
GET /primitives/rules/{workspace_id}              ->  GET /primitives/rules
GET /primitives/records/{workspace_id}/holds      ->  GET /primitives/records/holds
GET /primitives/records/{workspace_id}/retention  ->  GET /primitives/records/retention
GET /primitives/sandbox/{workspace_id}            ->  GET /primitives/sandbox
GET /primitives/runtime/{workspace_id}/dashboard  ->  GET /primitives/runtime/dashboard
GET /primitives/runtime/{workspace_id}/agent/{a}  ->  GET /primitives/runtime/agent/{a}
```

**Action for P-21 and P-23:** the Admin Rules and AI Runtime screens call
these. No frontend file references them today (checked), but if a BFF handler
is written against the old shape it will 404.

All 19 primitives routes are now gated at the router, so a route added later
is protected by default rather than by remembering. **Open routes: 206 → 187.**

---

## 5. Not done, deliberately

`AIRuntime.check_budget` still takes `monthly_budget` from the caller, so it
reports rather than enforces. Persisting the ceiling on `workspace_budgets`
(the table P-01 created) and making the refusal real is **P-04**. P-02 only
stopped the caller choosing which workspace to check.
