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

---

# P-04 — AI Call-Path Governance

Tasks T-018, T-031, T-034. Merge order 6 of 30.

## 1. The card's premise was wrong about the code, and it changed the package

The card scopes this as edits to `base_agent.py` plus "10 agents — structured
output schema each". But **only one of the ten agents subclasses
`BaseAgent`.** `CommandAI` does; the other nine are standalone classes that
each construct their own Anthropic client, each with their own fallback and
their own JSON parsing.

Fixing `base_agent.py` alone would therefore have governed **one agent in
ten**, and the acceptance criterion — *"every agent invocation writes a usage
row"* — would have been unreachable while appearing to be met.

So `call_claude()` is a **module-level function**, not a method, and all ten
agents call it. Three of them expose synchronous methods, so there is a
`call_claude_sync()` sharing one `_precheck` / `_finish` pair: two
transports, one budget policy. Two copies of that policy is exactly how a
sync agent ends up silently unmetered.

## 2. Nothing was metered, and nothing was ever refused

No agent called `AIRuntime.track_usage`. Its only callers were REST endpoints
where a **client self-reported its own usage**. A real agent invocation cost
money and left no record.

`AIRuntime.check_budget(db, workspace_id, monthly_budget)` took the ceiling
**as an argument from the caller** — the same class of hole P-02 closed for
`workspace_id`. Whoever asked "am I over budget" also supplied the limit. It
then returned a dict with `over_budget` in it and refused nothing.

`budget_guard.py` inverts all three: the ceiling is persisted per workspace,
the meter moves only on the server-side path, and passing it **raises**.

The call path needs a workspace to meter against, and agent methods do not
take one. Rather than add a parameter to every method — which would have
meant editing routers owned by six other packages — it reads the
`OperatorScope` contextvar **P-02 already built**. No router changed.

## 3. Failure was disguised as success — the finding that matters

This is worse than the audit recorded. With no API key:

| Agent | What it returned |
|---|---|
| `ProofAI.generate_roi_framework` | monetary values, `total_estimated_roi`, `roi_multiple`, `payback_period_months` |
| `ValidatorAI.validate_problem` | `is_real: True`, `is_ethical: True`, *"No ethical concerns identified"* |
| `ResearchAI.ingest_source` | *"compliance costs increased 23% year-over-year"*, confidence 0.85, credited to the caller's source |
| `PricingAI.generate_pricing` | a $15k / $25k / $40k tier ladder |
| `OfferAI.generate_offer` | a full offer at $15,000–$30,000 a month |
| `CommandAI.get_next_best_action` | *"Potential $450K in pipeline recovery"*, confidence 0.85 |
| `FulfillmentAI.generate_sop_bundle` | a staffing plan with roles and weekly hours |
| `ProblemAI.score_problem` | urgency 7, WTP confidence 0.75 |

All constant. None derived from the input. **None marked.** A caller could
not distinguish any of it from analysis, and neither could the UI.

For a platform whose users advise HNW and UHNW families, this is not a
degraded mode — it does not look like an outage, it looks like advice.

Every one is now a typed degraded result: `degraded: True`, a machine-
readable reason, and `data: None`. List-returning methods return `[]` and
record the reason on the agent, because a list cannot carry the envelope
without lying about its type — that is a real, acknowledged loss of
expressiveness, and it is still strictly better than inventing rows.
`ValidatorAI.score_wtp_confidence` returns `-1.0`, deliberately outside its
documented 0.0–1.0 range so it cannot be plotted or averaged as a reading.

**The fabrication was also reachable with a working API key.** Nine of ten
agents did not strip markdown code fences, so a correct fenced answer parsed
as a failure and fell through to the sample data. Fence handling is now in
the shared parser.

## 4. Fourteen tests asserted the defect

They did not merely tolerate it — they pinned it:

- `test_returns_required_fields_without_api` — docstring: *"With no API key
  the agent falls back to sample data containing all required fields."*
- `test_mock_scores_are_positive` — asserted all four validation dimensions
  came back `True`.
- `test_generate_offer_returns_sample` — `assert result == SAMPLE_OFFER`.
- `test_ingest_source_no_api_key` — asserted three invented claims.
- `test_roi_multiple_is_positive` — asserted an ROI multiple above zero from
  an agent that had analysed nothing.
- `test_refine_offer_returns_modified` — asserted `"Refined" in description`,
  which the code achieved by appending the word.

Any correct fix would have failed all of them. They are rewritten to assert
the inverse, in the same files.

## 5. Three files outside the card's list — declared, not buried

- **`core/dependencies.py`** — `require_budget()`'s body. Sanctioned: P-00's
  own comment in that function reads *"Pass-through until P-04 lands the
  budget guard. P-04 fills in the body."* The frozen signature did not move,
  so routes annotated during the run began enforcing on merge with no router
  touched.
- **`core/exceptions.py`** — added `BudgetError` (**402**, not 403). Purely
  additive. 403 would tell an operator they lack permission and send them
  looking in entirely the wrong place; they are permitted, and will be again
  next period.
- **`app/models/ai_usage.py`** — one line. `AIUsageLog.id` defaulted to the
  `uuid.uuid4` **callable**, putting a UUID object into a `String(36)`
  column. SQLite rejects it outright. Three writers create these rows, so
  the fix belongs on the default rather than at one call site.

`ai_cost_tracker.py` and `ai_eval_lab.py` are on the card's modify list and
are **unchanged**. The cost tracker's `calculate_cost` is correct and is now
the guard's pricing source; the eval lab is prompt versioning and has no
bearing on T-018, T-031 or T-034. Editing them to match the card would have
been churn.

## 6. Two judgment calls worth review

**An unreadable meter refuses.** If the budget check itself fails — database
unreachable, table missing — the call is refused with reason
`budget_unavailable`. The alternative is spending real money with no ceiling
and no record for as long as the fault lasts, which is a cost control that
switches itself off exactly when nobody is watching. It costs availability on
a platform where a database outage has already taken every other route with
it. `test_an_unreadable_meter_refuses_rather_than_spending` pins it.

**`copy_ai` and `relationship_ai` keep their templates.** Both compose
fallback text from the caller's *own* offer fields rather than inventing
facts, so their templates survive — they are now routed through the governed
path so they are metered and budgeted. The exception is two hand-written
lists in `relationship_ai` that included claims like *"achieve 3-5x ROI
within 12 months"* in an outreach script an advisor could send. Those are
fabricated factual claims, and they are gone.

## 7. Results

- **Backend: 0 newly failing** — `check_test_regressions.py`: `OK — no new failures`
- **127 failures against the 132 P-03 left** — five previously-failing tests now pass
- **57 tests added**; `ruff` 0
- Frontend untouched — this package is backend-only

## 8. Still open

`POST /api/v1/runtime/track` still lets a client write usage rows. It cannot
move the meter (`test_the_usage_log_cannot_move_the_meter` pins that), but it
can pollute the dashboard. The endpoint lives in `primitives.py`, which is
**P-02's file and on P-04's must-not-touch list**, so it is flagged rather
than removed. It should be deleted outright — the server is what calls the
provider; nothing legitimate self-reports.

---

# P-07 — Partner Integration Resilience

Tasks T-032, T-033, T-049 (modules only). Merge order 8 of 30.

## 1. The mock layers were not placeholders

The card describes "a silent mock fallback". What both partner clients
actually returned when unconfigured was **client deliverables**, in the
partner's own response shape, with nothing marking them as invented.

| Where | What an unconfigured deployment returned |
|---|---|
| `visionaudio_client` quarterly report | `total_aum: "$847.3M"`, `net_return_qtd: "+4.2%"`, `alpha_generated_bps: 85`, `sharpe_ratio: 1.42`, `revenue_qtd: "$1.53M"`, *"Tax-loss harvesting captured $127K"*, and four dated investment recommendations — with an `output_url` to a `.pptx` |
| `visionaudio_client` proof video | `before_after_metrics`: *"$284K saved"*, *"92% reduction in compliance exposure events"*, NPS 62 → 81 |
| `voiceforge_client` identity | `{"verified": True, "confidence": 0.95}` |
| `voiceforge_health` | Verbatim client quotes — *"really pleased with the performance"*, *"let's increase the allocation"* — plus sentiment scores and risk indicators |
| `voiceforge_crisis` | Which emergency contacts had **acknowledged** a crisis brief |
| `visionaudio_trainer` | 3 of 8 modules, 37.5% complete — the same record for every trainee |

These are investment performance figures, identity verifications, client
quotes and emergency acknowledgements. An advisor generating a quarterly
report against an unconfigured deployment received a complete and entirely
invented performance report for a client.

## 2. Two of them were fabricated even with a real API key

This is the part the card did not anticipate, and it changes the severity.

**`voiceforge_crisis.get_escalation_status`** reported acknowledgement from
`_RESPONSE_PATTERNS[i % 6]` — a static table of hand-written outcomes
assigned by the contact's position in the list. It **never asked the
partner**: `initiate_call`'s result was used for its `call_id` and nothing
else. So with a fully configured deployment placing real calls, an operations
console during a live incident would still have shown *"Acknowledged: 3 of 4,
average response 5.2s"* with quoted confirmations, from a lookup table.

**A firm could have stood down believing a principal had been reached.**

It now reports placement — which is genuinely known — and states that
outcomes are not. `acknowledged`, `pending`, `failed` and
`avg_response_time_seconds` are **absent** rather than zeroed, because a zero
would read as "nobody acknowledged" rather than "we do not know".
Under-reporting during a crisis sends someone to check; over-reporting sends
them home.

**`voiceforge_health`** selected a call profile by `md5(call_id)`, so the
same invented quotes came back on every visit to a client's record — and the
profile's risk indicators drove `recommended_action` up to
`immediate_outreach` at `critical` urgency. A firm could have called a client
about a churn risk that existed only in a hash.

## 3. Resilience — one decision worth reviewing

`_resilience.py` adds retry with exponential backoff and full jitter, plus a
per-partner circuit breaker.

**Retries are restricted to idempotent methods.** `POST /calls/initiate`
places a telephone call. A read timeout there usually means the request
arrived and only the response was lost — so a naive retry rings a family
office twice. A POST is retried only when its caller declares repeating it
safe. `verify_identity` is also left non-idempotent deliberately:
resubmitting a passphrase after a timeout has the shape of a credential
replay.

Jitter comes from `secrets`, not `random`, and not for cryptographic reasons.
P-06 makes "no module under `app/services` imports `random`" a test-enforced
invariant. Retry jitter is a legitimate exception and could have been
allowlisted — but an invariant with one exception is one people start arguing
with, and this costs nothing.

## 4. Boundary validation

`_schemas.py` validates each response against the fields the caller actually
reads. A renamed field now fails at the boundary naming the partner, the
endpoint and the field, instead of surfacing as `KeyError: 'call_id'` three
layers into a service — or as a `.get()` returning `None` that flowed onward
and put a null transcript on a client's record with nothing raised.

Schemas list **only** consumed fields. A partner adding, reordering or
dropping anything else does not break us; a schema that fails on additions is
one people bypass.

## 5. Eighteen tests asserted the defects

`test_verify_identity_mock` asserted `result["verified"] is True` for a client
with no API key — a test that guaranteed an identity-verification bypass.

`test_get_escalation_status` asserted that acknowledged + pending + failed
summed to the contact count: that **every emergency contact had a definite
outcome**, satisfied by a system that had placed no calls and asked no one.
`test_initiate_status_values` asserted `status == "ringing"` for calls never
dialled. `test_mock_render_status` asserted a render came back **complete**
with a download link for a document that was never produced.

All rewritten to assert the inverse, in the same files.

## 6. New modules (T-049)

`voiceforge_secure_comms.py` enforces **verify, then speak** — the ordering
is the control, since placing the call first would already have spoken the
message to whoever answered. It distinguishes *refused* from *could not
check*, because "the client failed verification" and "we did not verify" call
for different actions. It also tests `verified is True` rather than
truthiness: `{"verified": "false"}` is a truthy string.

`visionaudio_brief.py` queues and polls client brief renders, and passes the
caller's sections through untouched — an empty section stays empty rather
than acquiring a plausible summary on the way past.

## 7. Scope

Exactly the card's list. `voiceforge_intel_brief.py` is **untouched** —
carved out to P-06. No router, job or frontend file was opened.

**`PARALLEL_BUILD.md` was deliberately not edited.** P-06 is open at the same
time and already modifies the same merge-log row; two open PRs editing one
line is a guaranteed conflict. The coordinator updates the log at merge time.
Merges remain strictly sequential — only the PRs overlap.

## 8. One cross-package coupling, handled

`voiceforge_intel_brief.py` branches on `result.get("mock")`, and P-07
replaces that key with the platform's `degraded` vocabulary. Dropping `mock`
would have silently broken the carved-out file — it would have fallen through
to returning an empty `audio_url`.

The degraded envelope therefore still carries `mock: True`, marked deprecated
in the source. **It should be removed once P-06 has merged**, at which point
both sides speak `degraded`.

## 9. Results

- **Backend: 0 newly failing** — `check_test_regressions.py`: `OK — no new failures`
- 127 failures, unchanged from the P-04 baseline
- **1400 passing**, up from 1380 · **33 tests added** · `ruff` 0 · frontend untouched

---

# P-09 — Ontology & Scoring Persistence

Tasks T-035, T-039. Merge order 9 of 30.

## 1. One line, two defects

```python
_extensions: dict[str, list[str]] = {}
```

The card calls this "a module-level dict that leaks ontology extensions
across callers and loses them on restart". Both halves are true, and they are
not equally serious.

The **durability** bug is annoying: a firm extends its ontology and loses the
change at the next deploy.

The **tenancy leak** is the real one. There was no workspace dimension in the
structure at all, so a value one firm added was immediately visible to every
other firm in the process — and, because `validate_against_ontology` reads
the same schema, silently *accepted* in their data. One firm's vocabulary
ending up in another firm's records is a data-integrity problem that would be
very hard to explain after the fact.

Extensions now live in `ontology_extensions`, scoped by workspace, using the
scope P-02 already binds — so no signature the router calls had to move.
`api/v1/ontology.py` belongs to P-13 and was not opened.

**A test that only exercises one workspace passes identically against a
global dict and a scoped table**, which is why the isolation tests here
matter more than the durability ones.

## 2. Refusing to guess an owner

`update_ontology_mappings` **refuses** when no workspace can be resolved,
rather than falling back to something global. The old behaviour — apply it to
everyone — is precisely the bug, so there is no version of "no workspace"
that can be handled by writing the row anyway.

Same principle in `scoring_store`: an unscoped scoring record would be
invisible to the scope filter and unreadable by the workspace that made it,
so it is skipped and logged rather than written.

## 3. "Why was this approved in March" had no answer at all

Four services computed a verdict, returned it, and kept nothing.

`inputs` is stored beside the score deliberately. A recorded verdict without
its inputs lets you *recite* a past decision but not *explain* it — and the
offer or client will have changed by the time anyone asks. A guardrails
`BLOCK` that was later overridden is exactly the case where the inputs are
the whole story.

Recording never fails a score: refusing to audit an offer because a write
failed would take a compliance check offline to protect its own log. A
failure is logged and `None` returned, which a caller can check.

## 4. A third fabrication, not in the card

`client_health.get_health_trend` was not merely unrecorded — it was
**invented**:

```python
seed = int(hashlib.md5(client_id.encode()).hexdigest()[:8], 16)
base = 60 + (seed % 30)
score = base + ((seed >> (i * 2)) % 11) - 5
```

Six months of health scores for a named client, derived from a hash of their
id. Stable, so the same client always showed the same history, and inside the
range a real score occupies. **An advisor deciding whether a relationship was
deteriorating was reading an md5 digest.**

Same family as the trust-center uptime (P-06), the call profiles and crisis
acknowledgements (P-07), and the agent sample data (P-04). This is the fourth
package in a row to find one, in a service the card described only as needing
persistence.

It now reads the scores this service actually recorded. A client with no
history returns an empty list, which renders as no trend rather than a
reassuring one.

## 5. Three tests asserted the defects

- `test_returns_correct_month_count` — asserted six months of scores always
  came back **for any client id at all**, which the hash guaranteed.
- `test_scores_in_range` — asserted those invented scores were plausible.
- `test_ontology.py` imported `_extensions` directly and cleared it between
  tests, which coupled the suite to the global that was the bug.

Rewritten in place.

## 6. Scope

The card's five service files, plus:

- **`scoring_store.py`** — not in the card's `creates` list, which names only
  the two test files. Four services need the same write path; putting it
  inside one of them would have made the other three import from an unrelated
  service.

`alembic/`, `frontend/prisma/`, `api/v1/ontology.py`, `qualify.py`,
`db/session.py` and `db/scope.py` were not opened. The card's flag — *"uses
the P-02 scope filter, do not bypass it"* — is honoured: every read and write
here is workspace-scoped, and `get_scores` requires a workspace rather than
treating it as optional.

## 7. Flagged, not fixed — `/api/v1/ontology/stats`

```python
def stats(workspace_id: str = "default", db: Session = Depends(get_db)):
```

A **client-supplied `workspace_id`**, defaulting to `"default"` — the same
spoofable-tenancy pattern P-02 removed from `primitives.py`. Any caller can
read another workspace's ontology distribution by naming it.

`api/v1/ontology.py` is **P-13's file** and on this package's must-not-touch
list, so it is flagged rather than fixed. **P-13 should close it**, and it is
worth checking the other router packages for the same default.

## 8. Results

- **Backend: 0 newly failing** — `check_test_regressions.py`: `OK — no new failures`
- 127 failures, unchanged from the P-07 baseline
- **1389 passing** · **25 tests added** · `ruff` 0 · frontend untouched

---

# P-10 — Distributed Rate Limiting

Task T-029. Merge order 10 of 30.

## 1. The configured limit was never the actual limit

The sliding window lived in two per-process `defaultdict`s, so the limit
applied **per instance**. Four workers behind a load balancer meant four
independent windows and an effective limit four times the configured one,
arriving unevenly depending on which worker a request landed on. A deploy
reset every counter, which made waiting for one the cheapest way past the
limiter.

The window now lives in Redis and every instance reads and writes the same
one.

## 2. Check and record are a single atomic operation

This is the part that makes it work rather than merely look distributed. A
read-then-write from N instances is the exact race that keeps the old
behaviour: each reads `count = limit - 1`, each decides it may proceed, and
the window overshoots by N. A Lua script does both inside Redis, so the count
a caller sees already includes its own request.

The sorted-set member is a **uuid, not the timestamp**. Keyed by timestamp,
two requests in the same millisecond collide on one member and the second
overwrites rather than counts — quietly raising the real limit under exactly
the burst the limiter exists for. There is a test for it.

## 3. Fail open, deliberately

The card's flag: *"a fail-closed limiter on /auth locks everyone out"*.

On any Redis failure the limiter falls back to the in-process window rather
than refusing traffic. That is **more permissive than intended** — each
instance starts a fresh local window — and that is the correct direction to
fail: `/api/v1/auth` is rate limited, so a fail-closed limiter during a Redis
outage locks out every user, including the people trying to fix it.

Fail-open here does not mean unlimited: the local window still applies, so a
single instance still cannot be used without limit. It is a weaker,
per-instance limit rather than no limit.

Redis is retried on the **next** request rather than being written off for
the process lifetime, so the shared window resumes as soon as Redis returns.
Every fallback reports a metric — a limiter silently running per-process is
the state this package exists to end, and it looks identical from outside to
one that is working.

## 4. The frozen constructor was not touched

`main.py:61-75` is P-00-owned and the signature is frozen. Redis is
configured from `settings.REDIS_URL`, which P-00 already added, so **no
argument was added and `main.py` was not opened**. A test asserts the
parameter list exactly, so a future change that needs an argument fails here
rather than silently diverging from the call site.

## 5. The problem worth reading — a frozen fixture and shared state

`tests/conftest.py` resets rate limiting between tests by reaching into the
middleware and calling `handler._requests.clear()`. That file is P-00-frozen.

Once the window moved to Redis, clearing the local dict stopped clearing
anything that mattered: Redis kept the counts across tests, so one test's
requests exhausted the next test's limit. **Six tests in
`tests/security/test_rate_limiting.py` failed**, and they failed in a way
that looked like a limiter bug rather than shared state.

It would have been easy to miss. CI's backend job has no Redis, so the
limiter falls back to memory there and the suite passes — the failure only
appears on a machine that happens to have a Redis running, which is every
developer machine with the dev stack up. **Passing in CI would have been the
false signal.**

The fix puts the flush behind the call the frozen fixture already makes:
`_requests` and `_workspace_requests` are a `dict` subclass whose `clear()`
also deletes this limiter's own Redis keys. Production never calls it —
`_cleanup_expired` rebinds and deletes individual keys, and nothing else
clears the store.

Verified in **both** conditions: with a live Redis (0 newly failing, 1441
passing) and with Redis unreachable (the rate-limit files pass, the shared
window tests skip).

## 6. What the tests can and cannot prove

The Redis group exercises the real Lua script against a real server and was
run against Redis 7.2 during development: **15 passed, 0 skipped**, including
two instances sharing one window and the window surviving a restart.

Those tests **skip in CI**. `ci.yml` runs only three named files in the
`integration-real` job that has a Redis service, and that file is
P-00-frozen. The always-running group covers the fallback path, the
overrides, and the frozen signature.

**Worth doing when `ci.yml` next opens:** add
`tests/test_rate_limit_distributed.py` to the `integration-real` job so the
shared-window behaviour is gated rather than merely verified once by hand.

## 7. Results

- **Backend: 0 newly failing** — `check_test_regressions.py`: `OK — no new failures`
- 127 failures, unchanged from the P-09 baseline
- **1441 passing** · **15 tests added** · `ruff` 0 · frontend untouched
- Scope: exactly the card's two files

---

# P-08 — Background Jobs

Tasks T-030, T-049 (event jobs). Merge order 11 of 30.

## 1. The platform reported automation it did not perform

The five scheduled tasks were not silently doing nothing. Each returned a
**success-shaped dictionary**:

```python
{"workspace_id": ws, "brief_generated": True, "dashboard_refreshed": True}
{"index_name": idx, "doc_id": did, "status": "indexed"}
{"workspace_id": ws, "recipients": 0, "status": "sent"}
{"workspace_id": ws, "period": p, "total_revenue": 0, "status": "generated"}
```

`daily_brief` fired at 06:00 every morning and reported a generated brief and
a refreshed dashboard, having done neither. `weekly_digest` reported a digest
successfully sent to nobody. `generate_revenue_report` returned
`total_revenue: 0` marked `"generated"` — on a platform serving wealth
advisors, the most directly actionable false number in the job layer.

## 2. Two bugs the stubs were hiding

**`args: ("all",)`.** Four Beat entries passed the string `"all"` to tasks
whose first parameter is `workspace_id`, so every scheduled run asked for the
workspace *literally named* `"all"`. While the bodies were `pass` this made
no difference — and that is the trap. **Implementing the tasks without
noticing would have produced jobs that ran correctly, reported honestly, and
still did nothing**, because they would have swept a workspace that does not
exist. Beat now calls sweep tasks that enumerate workspaces themselves.

**`retention_tasks` was never registered.** This is the serious one, and it
predates this package.

`app/jobs/tasks/__init__.py` is what causes Celery to register a task, and
`retention_tasks` was **not in it** — while `retention_cleanup` sat in the
Beat schedule. So the weekly retention sweep, the deletion-adjacent job that
enforces retention policy and honours legal holds, and **the one job in this
package that was already fully implemented**, was scheduled against a task no
worker had registered. Beat would dispatch it, the worker would log an
unregistered-task error, and the sweep would never run.

Nothing else would surface. A compliance job that silently never fires looks
exactly like one with nothing to do.

`drip_tasks` was missing too, though nothing schedules it today. Both are now
imported, and `TestTaskRegistry` asserts that every task named in
`BEAT_SCHEDULE` is registered after importing the package.

## 3. What is implemented, and what D4 blocks

The card's rule — *"if a job needs to write Client or Offer, STOP and
escalate"* — turned out to govern most of this package.

**Implemented, writing FastAPI-owned tables only:**

| Task | Work it now does |
|---|---|
| `evidence_tasks.refresh_recency_scores` | Applies temporal decay to `evidence`, calling `ResearchAI.compute_recency_decay` rather than reimplementing it |
| `evidence_tasks.flag_stale_sources` | Flags evidence past the threshold, **idempotently** — it runs nightly |
| `evidence_tasks.ingest_evidence` | Moved from `ai_tasks`; extracts claims and writes `evidence`. Writes **nothing** when the AI degrades |
| `notification_tasks.send_email_notification` | Real send via `EmailService`, logged to `email_logs` including failures |
| `notification_tasks.send_weekly_digest` | Counts real evidence activity and emails it |
| `report_tasks.generate_quarterly_scorecard` | Built from `ai_usage_logs`, `scoring_results` and `evidence` |
| `search_tasks.*` | Real Elasticsearch calls, reporting what was **accepted** rather than what was sent |

**Blocked under D4** — each returns a typed blocked result naming the table:

`run_problem_discovery` (`Problem`), `run_offer_generation` (`Offer`),
`run_command_ai_synthesis` (`Notification`), `dispatch_notification`
(`Notification`), `generate_revenue_report` (`Invoice`).

A worker writing the retired SQLAlchemy duplicates would succeed silently and
produce rows nothing reads — worse than not running, because it is invisible
rather than absent. **Blocked tasks do not compute either**: running
discovery and discarding the result would spend real AI budget nightly to
produce nothing. A test asserts no AI call is made.

`daily_brief` is **off the Beat schedule**, with the entry left commented so
the gap is visible rather than forgotten.

## 4. Judgment calls

**Blocked is a third outcome, not a zero.** A blocked result carries no
success counters — `result["records_updated"]` raises rather than returning a
`0` that reads as "nothing needed doing", which is exactly what a `pass` body
returned.

**The digest states its own scope.** It covers evidence activity only;
client, offer and deliverable activity is Prisma-owned. The email says so,
because a digest silently omitting half the platform reads as a quiet week.

**The scorecard lists what it excludes** rather than reporting zero for it.

**`full_reindex` does not drop the index first.** A drop-then-rebuild leaves
search empty for the length of the rebuild, and indefinitely if the rebuild
fails. Re-indexing in place is idempotent because the document id is the row
id.

**Retention and backup were not touched.** Both were already real; retention
already enumerates its own workspaces and already honours legal holds. The
only change is that it is now registered, so it can actually run.

## 5. Files created beyond the card

The card lists nine new modules. Four of them — `daily_brief.py`,
`notification_dispatcher.py`, `tasks/brief_tasks.py`, `tasks/billing_tasks.py`
— would be **scaffolding for work D4 blocks**, which is the exact defect this
run exists to remove. They are not created.

Created instead: `_result.py` (the done/blocked/failed vocabulary),
`fanout.py` and `tasks/sweep_tasks.py` (the `("all",)` fix).

## 6. A systemic defect for P-01

**21 model files** declare `id = Column(String(36), default=uuid.uuid4)` —
the callable, not `str(uuid.uuid4())`. SQLite rejects a UUID object bound to
a string column outright.

P-03 hit it on `audit_logs`, P-04 fixed it on `ai_usage_logs`, and this
package works around it by passing an explicit id when writing `evidence`.
That is three packages patching one defect at three call sites. **It belongs
to P-01 to fix once across `app/models/`.**

## 7. Nineteen tests asserted the stubs

`test_run_command_ai_synthesis` asserted `brief_generated is True` and
`dashboard_refreshed is True`. `test_dispatch_notification_creates_record`
asserted every field it had just passed in — satisfied by any function that
returns its own arguments. `test_celery_tasks.py` called itself
"comprehensive" and consisted entirely of shape assertions that a `pass` body
satisfies.

Rewritten. Execution coverage moved to `test_jobs.py`, where a database
fixture lets each test assert a changed row, a called service, or an explicit
blocked result.

## 8. Results

- **Backend: 0 newly failing** — `check_test_regressions.py`: `OK — no new failures`
- 127 failures, unchanged from the P-10 baseline
- **1465 passing** · **29 tests added** · `ruff` 0 · frontend untouched

---

# P-13 — Routers: Discover & Qualify

Tasks T-008 (slice), T-023 (own failures). Merge order 13 of 30.

## 1. The missing auth was not the worst of it

Twenty-three reachable routes had no auth dependency. Two defects rode along
with that, and both are more serious than the open gate.

**`reviewer_id` came from the request body.**
`/risk-queue/{id}/approve` and `/reject` took the reviewer's identity as a
caller-supplied field and wrote it straight onto the review record:

```python
class RiskApproveRequest(BaseModel):
    reviewer_id: uuid.UUID
    notes: str = ""
...
review = RiskReviewQueue.approve(db, item_id, req.reviewer_id, req.notes)
```

Combined with the missing gate, **an unauthenticated caller could approve a
risk item and attribute the approval to somebody else** — a named colleague,
or a compliance officer who never saw it. The stored record would then show a
review that person did not perform, and it would look authoritative.

An approval is a compliance record naming who signed it off. Taking that name
from the caller made the record worse than worthless.

**Workspaces came from the caller.** Six discovery routes took `workspace_id`
as a query parameter or request-body field, four of them defaulting to
`"default"`; `/risk-queue` took it as a required query parameter and `/stats`
as an optional one. Any caller could read or write another firm's discovery
data, list their pending risk reviews, or read their ontology distribution by
naming their workspace.

These are the same defect P-02 removed from `primitives.py` and P-11 removed
from the audit trail: **input that should have come from the session.**
`Depends(get_workspace_id)` closes the gate and the tenancy hole in one
change, because the workspace now derives from the identity.

## 2. The count is 23, not 25

The card says 25. Measured against the auth-coverage guard: **187 → 164**.

The difference is `problem_detail.py`, whose two routes are **not
registered**. It is included only in `app/api/v1/router.py` — a file P-00's
card said to delete, which still exists and which **nothing imports**.
`main.py` does not include it and is P-00-frozen.

So two endpoints exist, are maintained, and cannot be called. They are gated
anyway — unreachable today is not unreachable forever — and
`test_problem_detail_is_unreachable` asserts the situation, so the day
somebody registers the router that test fails and they read why.

**For P-00 or the coordinator:** either delete `router.py` as planned, or
register `problem_detail` in `main.py` and let its two routes join the count.

## 3. Scope

Auth and identity only. Deliberately not touched:

- **`/discovery/scan` writes `Problem`**, which is Prisma-owned under D4 —
  the same boundary that blocks five background jobs in P-08. This package
  gates the route; it does not migrate the write. The BFF (P-21) serves the
  Discover screens directly, so these endpoints are legacy either way.
- **`ontology.py` now passes `db` and `workspace_id`** into the engine P-09
  made persistent and scoped, and attributes extensions to the session
  operator via `created_by`. That is calling P-09's service through the
  parameters it added, not changing it.
- **`guardrails-check` now passes its session** so the verdict is recorded.
  P-09 gave `check_offer` that parameter; without a caller passing it, the
  compliance decision stayed advisory. Two packages had to meet for that to
  work, and this is the half that closes it.

`core/dependencies.py`, `services/backbone/*`, `main.py`, `config.py`,
`alembic/` and `frontend/` were not opened. No new endpoints were built —
T-028 stays closed under D4.

## 4. Twelve tests were passing because the routes were open

Every test in `tests/integration/test_qualify_api.py` called these routes
**anonymously** and asserted a 200. They were not wrong when written; they
became a measurement of the hole.

Moved onto `authed_client`, and `TestAnonymousAccess` adds the half that was
missing: asserting an unauthenticated caller is **refused**. Without it the
file would pass just as happily if the dependency were removed again — which
is how the routes came to be open and stay open.

## 5. Results

- **Backend: 0 newly failing** — `check_test_regressions.py`: `OK — no new failures`
- **Open routes: 187 → 164** (the run's primary progress counter)
- 127 failures, unchanged from the P-08 baseline
- **1481 passing** · **16 tests added** · `ruff` 0 · frontend untouched
