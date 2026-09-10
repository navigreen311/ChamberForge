# PARALLEL_BUILD.md

The ledger for ChamberForge's 30-package parallel build. **The coordinator
writes this file. No package agent opens it** — agents record blockers in
`PARALLEL_BUILD_ESCALATION.md` on their own branch, which always merges
cleanly because each branch has its own copy.

---

## Decisions already made — do not relitigate

| | Ruling |
|---|---|
| **D1** | **Prisma + NextAuth are adopted.** Merged Phase 3 Section 1 work. Build on the existing config at `frontend/src/app/api/auth/[...nextauth]/route.ts`. Never delete them. |
| **D2** | **Single operator per instance.** No RLS, no multi-tenant work. Build the ORM filter so a workspace dimension can be added later. This reduces **tenancy** scope only — it does **not** reduce auth scope. |
| **D3** | **The 78 Next.js route handlers are scaffolding to implement** with real Prisma queries, not to delete. |
| **D4** | **Prisma is source of truth for the domain models** — User, Client, Problem, Offer, Playbook, Deliverable, Task, WealthEvent, RiskReviewItem, Notification, AutomationRule, AutomationRunLog, AIFeedback, AuditLog, Partner, ExportJob, Citation. FastAPI keeps its non-overlapping tables and its service layer: agents, Celery, Elasticsearch, evidence ingestion, exports queue, scan orchestration. The BFF goes **direct to Postgres via Prisma** for those models and never calls FastAPI for them. FastAPI never touches Client, Offer or Playbook rows. |
| **D5a** | **Two audit surfaces, never unified.** Prisma `AuditLog` = operator-facing actions (Settings → Security → Audit Log). FastAPI `audit_logs` = system-layer mutations (agents, Celery, indexing, ingestion, prompt executions). Same chain construction on both. A full compliance export joins them by timestamp range. |
| **D5b** | **ExportJob: Prisma owns the state, FastAPI owns the execution.** The Celery worker writes `s3Key` and `completedAt` back to the Prisma-owned row by direct Postgres write on the shared connection string. This is the **one intentional cross-stack write** in the platform. |

Read `docs/data-architecture.md` (published by P-01) before writing any
database query.

---

## Merge log

| # | Package | PR | Merge SHA | Suite | Reverts | When |
|---|---------|----|-----------|-------|---------|------|
| 1 | P-00 Coordinator | _in flight_ | — | see below | 0 | 2026-09-09 |

---

## P-00 baseline — what the repository looked like before, and after

| Check | Before P-00 | After P-00 |
|---|---|---|
| `ruff check .` | **409 errors** | **0** |
| `pytest --collect-only` | **ImportError**, suite never ran | collects clean |
| `npx tsc --noEmit` | **10 errors** | **0** |
| `npm run build` | **failed** | **succeeds, 148/148 pages** |
| `npm audit` | 13 vulns (3 critical) | 5 (1 critical) — rest need Next 16, **P-27** |
| CI green, all time | **0 of 291 runs** | pending first run |
| Backend suite (SQLite, local) | could not execute | 1,273 passed / 136 failed / 8 error |
| Backend suite (**Postgres, CI**) | could not execute | **191 known failures** - the number that governs |
| Open routes (no auth) | unmeasured | **206** — see the correction below |
| Model/migration drift | unmeasured | **4 tables missing** — P-01 closes |

### Two corrections to the audit

**Open routes: 206, not 149.** The audit counted routes in routers with
*zero* auth references, which missed open routes inside routers that were
*partly* covered. `tests/security/test_auth_coverage.py` measures it
properly by introspecting every route's dependency tree. The router
packages' scope is ~38% larger than planned, and it redistributes — `sell`
is now the single largest open-route file at 28, which grows **P-14**.

**`.env.example` `AWS_S`** was a false positive of the audit's own regex,
which truncated `AWS_S3_BUCKET` at the digit. The file was always correct.

---

## The 191 pre-existing test failures, assigned

Measured on **CI against PostgreSQL 16**, which is the arbiter. A local
SQLite run shows only ~136 - it misses 55 auth-flow, isolation and
sensitive-data failures that need a real database. **Do not tune against
SQLite.** The authoritative list is `backend/tests/known_failures.txt`.

**CI now gates on the delta, not on green.** `scripts/check_test_regressions.py`
compares each run to that baseline and fails only on a test that was passing
and now is not. A permanently red suite gives twenty-nine agents no signal;
"did you break something" is the only useful question during a remediation
this size. Each package **deletes the lines it fixes** - the file only ever
shrinks, and P-26 asserts it is empty. Adding a line to make your own PR pass
is what the coordinator hands a PR back for.

The same applies to migration drift: `scripts/migration_drift_baseline.txt`
holds the four known-missing tables so CI fails on *new* drift only. P-01
empties it.

**Each package fixes only the failures in its own files.** Do not fix another package's tests; do not
weaken an assertion to reach green.

Three further failures in `tests/test_env_validator.py` were caused by
P-00's own fail-closed change and are already fixed — they are not in this
table.

| Test file | Count | Owner | Why it belongs there |
|---|---:|---|---|
| `tests/test_notifications.py` | 12 | **P-17** | owns `api/v1/notifications.py` |
| `tests/integration/test_notifications_api.py` | 8 | **P-17** | same router |
| `tests/test_retention.py` | 10 | **P-08** | owns `jobs/tasks/retention_tasks.py` |
| `tests/test_consent_ledger.py` | 10 | **P-15** | owns `api/v1/compliance.py` |
| `tests/integration/test_compliance_api.py` | 7 | **P-15** | same router |
| `tests/integration/test_evidence_api.py` | 10 | **P-13** | owns `api/v1/evidence.py` |
| `tests/unit/test_offers_api.py` | 8 | **P-14** | owns `api/v1/offers.py` |
| `tests/integration/test_offers_api.py` | 7 | **P-14** | same router |
| `tests/test_secure_comms.py` | 8 | **P-30** | secure messaging is Phase 3 §8 |
| `tests/test_client_portal.py` | 6 | **P-30** | owns `api/v1/portal.py` |
| `tests/test_household_graph.py` | 8 | **P-14** | owns `api/v1/household.py` |
| `tests/test_white_label.py` | 7 | **P-16** | owns the white-label admin endpoints |
| `tests/security/test_file_upload_security.py` | 6 | **P-17** | owns `api/v1/storage.py` |
| `tests/test_upload_e2e.py` | 4 | **P-17** | same router |
| `tests/test_ai_runtime.py` | 5 | **P-04** | owns `services/backbone/ai_runtime.py` |
| `tests/integration/test_billing_api.py` | 5 | **P-29** | owns `api/v1/billing.py` |
| `tests/test_migrations.py` | 4 | **P-01** | the four missing tables are exactly this |
| `tests/test_template_versioning.py` | 3 | **P-17** | owns `api/v1/polish.py` |
| `tests/test_crisis_console.py` | 2 | **P-17** | owns `api/v1/polish.py` |
| `tests/integration/test_tenant_isolation.py` | 2 | **P-02** | owns the scope filter |
| `tests/integration/test_playbook_flow.py` | 2 | **P-14** | owns `playbook_engine.py` |
| `tests/test_edge_cases.py` | 1 | **P-02** | scope-filter edge case |
| `tests/security/test_sql_injection.py` | 1 | **P-13** | owns `api/v1/discovery.py` |

Totals by package: P-17 **35** · P-14 **25** · P-15 **17** · P-13 **11** ·
P-08 10 · P-30 14 · P-16 7 · P-29 5 · P-04 5 · P-01 4 · P-02 3.

**P-17 and P-14 carry the heaviest test debt.** Both are already large; size
them accordingly.

---

## Shared-file ownership — the map every agent must respect

### Frozen by P-00. Off limits to every other package.

```
backend/requirements.txt          backend/app/main.py
frontend/package.json             backend/app/core/config.py
frontend/package-lock.json        backend/pytest.ini
.github/workflows/**              backend/pyproject.toml
.env.example                      backend/tests/conftest.py
docker-compose*.yml               frontend/tsconfig.json
VERSION  CHANGELOG.md  README.md  frontend/next.config.js
PARALLEL_BUILD.md                 frontend/tailwind.config.ts
frontend/src/app/layout.tsx       frontend/jest.config.ts
                                  frontend/playwright.config.ts
```

`backend/app/core/dependencies.py` is split by line range: **P-00 owns the
signatures**, **P-11 owns the body of `get_current_user`** (it repoints
identity at the Prisma-owned `User` table). The only such split in the plan.

`frontend/src/app/layout.tsx` is frozen because P-00 mounted `AppProviders`
there. **Any package needing a client provider nests it inside
`src/app/components/providers/AppProviders.tsx`** rather than opening the
layout — that is the seam.

### Serialized — exactly one owner

| Path | Owner |
|---|---|
| `frontend/prisma/**` (schema, migrations, seed) | **P-01** |
| `frontend/src/lib/prisma.ts` | **P-01**, frozen after |
| `backend/alembic/**`, `backend/app/models/**` | **P-01** |
| `frontend/src/middleware.ts`, `app/api/auth/**`, `lib/api.ts` | **P-11** |
| `frontend/src/lib/require-session.ts` | **P-11**, frozen after |
| `frontend/src/lib/audit.ts` | **P-03**, frozen after |
| `backend/app/db/session.py`, `api/v1/primitives.py` | **P-02** |
| `backend/app/jobs/**` | **P-08** |
| `backend/app/services/agents/base_agent.py`, `ai_runtime.py`, `ai_cost_tracker.py` | **P-04** |
| `backend/app/api/v1/billing.py`, `webhooks/stripe.py` | **P-29** |
| `backend/app/api/v1/portal.py` | **P-30** |
| `backend/app/api/v1/websocket.py` | **P-12** (P-00 left a stub) |

**Never add an Alembic or Prisma migration.** P-01 owns both chains; two
concurrent migrations produce two heads with the same parent and Alembic
refuses to run. **Never add a dependency** — P-00 landed every one the run
needs. Both are escalations, not edits.

---

## The two progress counters

**Auth coverage** — `tests/security/test_auth_coverage.py` counts routes
with no auth dependency. **206 → 0** across merges 13–18. Advisory today;
P-26 sets `AUTH_COVERAGE_ENFORCING=1` and it becomes a gate. Router
packages must not edit the allowlist to make a slice pass.

**No-fixture handlers** — created by P-23. Counts handlers returning
hardcoded literals. **78 → 0** across merges 19–23. It is the completion
signal for D3.

Neither is a proxy. Each is the literal completion criterion for its half of
the work.

---

## Merge protocol

1. `git checkout main && git pull`
2. Verify the PR's `DEPENDS ON` are already on main. If not, skip to the next non-blocking PR.
3. Verify the PR touched only files on its allowed list. If not, **hand back before running anything**.
4. Merge with `--no-ff` so the merge is revertible as one commit.
5. Run the full suite: pytest, jest, playwright, ruff, tsc, `prisma generate`, `next build`.
6. **Green** → push, append a row to the merge log, next PR. **Red** → `git revert` the merge, push the revert, hand the PR back with the complete failing output, move to the next non-blocking PR.

**Absolute rules.** Never merge in parallel. Never force-push to main. If a
critical-path package (P-00, P-01, P-11, P-21, P-28, P-25, P-26, P-27)
fails twice, **halt the run and escalate to Ivan** — a second failure means
the boundary was drawn wrong and continuing compounds it downstream.

Two reviewers on **P-01** (the data contract), **P-11** (the identity
boundary), **P-16** (admin privilege) and **P-30** (the only
externally-reachable surface). P-02 and P-11 never merge in the same
window — both change how identity resolves, and a combined red result
cannot be attributed.

After the final merge, run the full regression **from a clean checkout** —
the generated Prisma client is not committed, so a stale local one hides
real failures.
