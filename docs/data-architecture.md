# Data Architecture — which stack owns which table

**Published by P-01. Read this before writing any database query.**

ChamberForge runs two persistence stacks against one PostgreSQL database:
Prisma (from the Next.js BFF) and SQLAlchemy (from FastAPI). That is a
deliberate architecture, not an accident — but it only works because the two
table sets are **disjoint by construction** and ownership is written down.

---

## The ruling (D4)

> **Prisma is source of truth for the domain models.** FastAPI keeps its
> non-overlapping tables and its service layer — agents, Celery,
> Elasticsearch, evidence ingestion, exports queue, scan orchestration. The
> BFF goes **direct to Postgres via Prisma** for those models and never calls
> FastAPI for them. FastAPI never touches Client, Offer or Playbook rows.

## Why they do not collide

Prisma declares no `@@map`, so it creates **PascalCase** tables: `"Client"`,
`"Offer"`, `"AuditLog"`. Alembic creates **snake_case** tables: `clients`,
`offers`, `audit_logs`. PostgreSQL treats those as different identifiers, so
both sets coexist without a name clash.

Verified on a clean database with both chains applied:

```
25 PascalCase (Prisma)   40 snake_case (FastAPI)   0 collisions
```

**This is also the hazard.** Because they do not collide, a write to the
wrong stack does not fail — it silently lands in a second table nobody reads.
An offer created through FastAPI goes to `offers`; the operator's Offers
screen reads `"Offer"` and will never see it. That failure is invisible until
someone asks why a record disappeared.

---

## Ownership

### Prisma owns — the domain (25 tables)

| Table | Notes |
|---|---|
| `User`, `Account`, `Session`, `VerificationToken` | NextAuth. **P-11 repoints FastAPI's identity lookup here.** |
| `Client`, `Problem`, `Offer`, `Playbook`, `Citation` | commercial core |
| `Deliverable`, `Task`, `WealthEvent`, `RiskReviewItem`, `Notification` | delivery and signals |
| `AuditLog` | **operator-facing** audit trail — see the two-surface rule below |
| `AutomationRule`, `AutomationRunLog`, `AIFeedback`, `Partner`, `ExportJob` | added by P-01 |
| `Subscription`, `Invoice`, `Payout` | P-29, Stripe billing |
| `PortalAccess`, `PortalMessage` | P-30, client delivery portal |

Scoped by `userId` (D2 — one operator per instance). A workspace dimension
can be added later without moving anything.

### FastAPI owns — the system layer (40 tables)

Agents and AI (`ai_usage_logs`, `prompt_versions`, `workspace_budgets`),
compliance (`consent_records`, `legal_holds`, `retention_policies`,
`deletion_requests`), messaging (`email_logs`, `drip_statuses`,
`secure_messages`), platform (`workspaces`, `feature_flags`,
`sandbox_environments`, `ontology_extensions`, `scoring_results`),
evidence and search (`evidence`, `household_graphs`, `community_insights`),
plus `audit_logs`, `mfa_configs`, `white_label_configs`,
`playbook_activations`, `crisis_incidents`, `template_versions`,
`onboarding_progress`, `client_portal_access`, `documents`, `referrals`,
`invoices`, `subscriptions`, `risk_reviews`, and the ten legacy domain
duplicates listed below.

Scoped by `workspace_id`. That is **not** a conflict with Prisma's `userId`:
it scopes FastAPI's own tables only.

---

## Two audit surfaces (D5a) — never unified

| | Prisma `AuditLog` | FastAPI `audit_logs` |
|---|---|---|
| **Records** | operator actions in the UI — created an offer, updated a client, exported a PDF, approved a risk item, changed settings | system-layer mutations — agent actions, Celery completions, index operations, ingestion events, prompt executions |
| **Surfaced at** | Settings → Security → Audit Log | operator tooling / compliance export |
| **Written by** | `frontend/src/lib/audit.ts` (P-03) | `AuditMiddleware` (P-03) |
| **Integrity** | `prevHash` / `entryHash` chain | `prev_hash` / `entry_hash` chain, **plus an append-only trigger** |

> **Operator audit trail: Prisma `AuditLog`. System audit trail: FastAPI `audit_logs`. Full compliance export joins both by timestamp range.**

The FastAPI table carries a database-level guard added in revision 003.
Verified against Postgres 16:

```
INSERT ... -> INSERT 0 1
UPDATE ... -> ERROR: audit_logs is append-only: UPDATE is not permitted
DELETE ... -> ERROR: audit_logs is append-only: DELETE is not permitted
```

Append-only is now enforced by the database, so it holds even against a
client with direct credentials — not merely asserted by application code.

---

## The one intentional cross-stack write (D5b)

**`ExportJob`: Prisma owns the state, FastAPI owns the execution.**

1. `POST /api/exports/generate` (BFF) writes a Prisma `ExportJob` row and
   returns its id.
2. The Celery worker picks up that id, renders the document, uploads to S3.
3. The worker writes `status`, `s3Key` and `completedAt` **back to the
   Prisma-owned row**, by direct Postgres write on the shared connection
   string.

The model carries `// status and s3Key written by FastAPI export worker` so
nobody deletes those fields believing them unused. **This is the only
sanctioned cross-stack write.** Any other is a bug.

---

## The ten legacy duplicates — read this before touching them

Ten domain concepts currently exist in **both** stacks:

| Concept | Prisma (source of truth) | FastAPI (legacy) |
|---|---|---|
| User | `User` | `users` |
| Client | `Client` | `clients` |
| Problem | `Problem` | `problems` |
| Offer | `Offer` | `offers` |
| Playbook | `Playbook` | `playbooks` |
| Notification | `Notification` | `notifications` |
| WealthEvent | `WealthEvent` | `wealth_events` |
| RiskReviewItem | `RiskReviewItem` | `risk_reviews` |
| AutomationRule | `AutomationRule` | `automation_rules` |
| AuditLog | `AuditLog` (operator) | `audit_logs` (system — **not** a duplicate, see above) |

### Why P-01 did not delete the FastAPI copies

**This is a deliberate scope decision and a change from P-01's original
card, which said "retire the 11 overlapping SQLAlchemy models".**

Measured on the branch: **27 files import one of these models** — 13 routers,
12 services, plus `core/dependencies.py` and `models/__init__.py`. Deleting
them in P-01 would:

- break `core/dependencies.py` and `api/v1/auth.py`, which **P-11** is
  already rewriting for the identity repoint,
- break 13 routers spread across **P-13 through P-18**,
- break 12 services across P-04, P-09 and others,

— all at once, from a package whose card explicitly forbids touching any
router or service. A 27-file change spanning eight packages' territory is
precisely the cross-package edit this plan exists to prevent.

### What P-01 did instead

`scripts/check_domain_ownership.py` records the current importers and **fails
when the set grows**. New code cannot start depending on a legacy table; the
existing dependants migrate inside the packages that already own those files:

| Files | Migrates in |
|---|---|
| `core/dependencies.py`, `api/v1/auth.py` (User) | **P-11** — already scoped, T-063 |
| `api/v1/{discovery,problems,evidence}.py` | **P-13** |
| `api/v1/{offers,build,sell,household}.py` | **P-14** |
| `api/v1/{lifecycle,compliance,clients_dashboard}.py` | **P-15** |
| `api/v1/{users,profile,workspaces,workspace_settings,audit,mfa}.py` | **P-16** |
| `api/v1/{playbooks,notifications,storage}.py` | **P-17** |
| `services/backbone/*` | the package owning each service |

**P-26 asserts the importer list is empty.** That is when D4 becomes true
rather than intended.

---

## Rules

1. **Read this file before writing a query.** Writing a domain row from the
   wrong stack does not error — it splits the data silently.
2. **Never add an Alembic or Prisma migration.** P-01 owns both chains. Two
   concurrent revisions produce two heads with the same parent and Alembic
   refuses to run. Needing schema is an escalation, not an edit.
3. **Never edit `frontend/prisma/schema.prisma`.** P-01 owns it and five BFF
   packages share it. A missing field is an escalation.
4. **BFF handlers query Prisma directly.** They do not call FastAPI for a
   domain model.
5. **FastAPI services must not write a Prisma-owned table** except the
   `ExportJob` write-back above.

---

## Applying both chains to one database

Prisma refuses `migrate deploy` against a non-empty database (`P3005`), and
Alembic runs first, so the order matters:

```bash
# 1. FastAPI tables
cd backend && alembic upgrade head

# 2. Prisma tables — apply the SQL, then record it as applied
cd ../frontend
psql "$DATABASE_URL" -f prisma/migrations/20260910000000_p01_baseline/migration.sql
npx prisma migrate resolve --applied 20260910000000_p01_baseline

# 3. Seed
npx prisma db seed
```

Verified end to end on Postgres 16: `upgrade head` → `downgrade base` →
`upgrade head` runs clean, then the Prisma baseline applies on top with no
collision.
