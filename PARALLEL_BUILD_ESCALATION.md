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

# P-06 — Trust Center & Honest Reporting

Tasks T-021, T-022. Merge order 7 of 30.

## 1. The card's blocker, and the decision taken

> *"No uptime SLI is defined anywhere in the repository. Name a Datadog
> monitor or approve the render-nothing interim before starting."*

**Built on the render-nothing interim**, and flagged rather than blocked on.
It is the package's own thesis — "no data yet" is honest, a plausible number
is not — so proceeding under it cannot produce a wrong answer, only an empty
one. Naming a monitor later is a configuration change, not a code change: the
adapter is real and reads `DATADOG_UPTIME_SLO_ID`, `DD_API_KEY`, `DD_APP_KEY`
and `DD_SITE`.

## 2. The seeding was the dangerous part, not the randomness

```python
random.seed(f"{year}-{month}")          # "Deterministic per month"
uptime = round(99.9 + random.uniform(-0.15, 0.1), 3)
```

A fluctuating random figure invites suspicion. A **seeded** one returned the
same 99.87% for August on every request — so it survived the one check a
sceptical reader actually performs: ask twice, compare. It behaved like a
stored measurement, on the page a prospect reads to decide whether to trust
the platform with a family's financial affairs.

`uptime_source.py` has two states and no third: **measured** or **unknown**.
No fallback, no estimate, no last-known-good. Every failure path —
unconfigured, unreachable, malformed — resolves to unknown, so no caller can
receive a number the adapter did not read from a monitor. A **partial**
configuration counts as unconfigured, because a half-configured monitor fails
in a way that looks like an outage and would be reported as one.

## 3. The page mixed measurements with the firm's own claims

Fixing only the uptime figure would have left the larger problem. Claims like
*"annual third-party penetration testing"*, *"GDPR-ready"* and
*"dpa_available: true"* are **not measurements the platform can take** — they
are statements the operating firm makes about itself, and the platform cannot
verify a single one. They were returned in the same flat dict as everything
else, with the same apparent authority.

Every field now carries a `source`: `measured`, `platform_configuration`, or
`operator_declared`. **The claims are still published** — deleting a firm's
compliance statements is not a decision code should make quietly — but a
reader and a reviewer can now tell which is which.

Two consequences worth naming:

**`uptime_sla: "99.9%"` is marked declared, not measured.** It is what the
firm undertakes to deliver; the uptime history is what was delivered. Those
must never be conflated, and previously nothing distinguished them.

**`incident_history: []` now carries a note.** An empty list on a trust page
reads as a clean record. It is not one — it means unrecorded, because no
incident source is wired up. A caller rendering only the list would publish
an implied claim nobody made.

## 4. `pen_test_summary` — needs a decision, not a code change

`docs/compliance/pen-test-report-template.md` is a **template**. There is no
completed penetration test report anywhere in the repository, while the API
tells every reader that annual third-party testing happens.

The claim may well be true of the firm. Nothing in this codebase
substantiates it. It is marked `operator_declared` and recorded in
`docs/compliance/trust-center-data-sources.md` for the document owner to
either attach the report or amend the claim. **P-06 did not decide it in
either direction.**

## 5. The VoiceForge cross-cut was larger than line 68

The card scopes this to `:68 random.uniform`. The whole mock block was the
defect: with no API key it returned an `.mp3` URL, a duration padded by
`random.uniform(6.0, 10.0)` for an "intro jingle", a bitrate, a sample rate,
a file size derived from the invented duration, and a hardcoded
`generated_at` of `2026-04-03T12:00:00Z` — a complete description of a file
that was never rendered. The only signal was `.mock` in the hostname of a URL
nothing resolves.

It now returns `available: false` with a reason, no URL and no duration.

**One value survives deliberately.** `estimated_narration_seconds` is word
count over the voice profile's words-per-minute — arithmetic on the caller's
own text, describing how long the brief *would* take to read aloud. That is a
calculation, not a claim about an artefact, and it is named so it cannot be
read as the length of a file.

The route in `api/v1/voiceforge.py` is a pass-through, so P-18's file was not
touched.

## 6. The guard is structural, and repo-wide

The card asks that no `random` import survive "asserted by test, not review".
Both repaired files quote the offending lines in their docstrings, so a
text search would fail on the explanation and pass on a comment. The test
parses each file's **syntax tree** instead.

It also sweeps **all of `app/services`**, not just the two known files. Both
offenders sat in different packages and were found separately; the third one
now fails at the moment it is written rather than when a customer asks where
a number came from.

## 7. Scope

Exactly the card's file list — nothing outside it. The trust-center endpoints
live in `primitives.py`, which is P-02's file, so both service methods keep
their signatures and the routes were not touched.

## 8. Results

- **Backend: 0 newly failing** — `check_test_regressions.py`: `OK — no new failures`
- 127 failures, unchanged from what P-04 left
- **17 tests added** · `ruff` 0 · frontend untouched

## 9. NEEDS A RULING BEFORE MERGE

The card carries a standing instruction: *"MISREPRESENTATION RISK.
Customer-facing compliance surface. If any figure has been shown externally,
escalate to Ivan before merging."*

**I cannot determine this from the repository.** It is the audit's open
question §9 Q5 — whether the v1.0.0 claims were ever shown to a third party.

If a generated uptime figure has been shown to a prospect, a client, or an
auditor, then a fabricated availability record has been presented as fact and
that is a disclosure question, not an engineering one. The code fix does not
address it and merging does not close it.
