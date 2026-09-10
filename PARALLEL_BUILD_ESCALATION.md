# P-01 — Escalations

Filed per the per-package protocol: a package that needs a file outside its
allowed list, or that changes its own scope, records what and why rather than
doing it silently.

---

## 1. P-01 did NOT delete the ten legacy SQLAlchemy models

**This is a deliberate scope reduction from P-01's card**, which said
"RETIRE the 11 overlapping SQLAlchemy models". Full reasoning is in
`docs/data-architecture.md`; the short version:

Measured on this branch, **25 files import a Prisma-owned model** — 13
routers, 12 services, plus `core/dependencies.py`. Deleting the models here
would break, in one commit:

- `core/dependencies.py` and `api/v1/auth.py`, which **P-11** is already
  rewriting for the identity repoint (T-063),
- 13 routers spread across **P-13 through P-18**,
- 12 services across P-04, P-09 and others.

P-01's card explicitly forbids touching any router or service. A 25-file
change across eight packages' territory is precisely the cross-package edit
this plan exists to prevent.

**What P-01 did instead:** `scripts/check_domain_ownership.py` records the
current importers and **fails when the set grows**. New code cannot join the
list; existing dependants migrate inside the packages that already own those
files, each deleting its own lines. Verified that the guard catches a
simulated new import and exits 1.

**Action for the coordinator:** the per-package migration table is in
`docs/data-architecture.md`. **P-26 must assert
`scripts/domain_ownership_baseline.txt` is empty** — that is when D4 becomes
true rather than intended. This should be added to P-26's card.

---

## 2. Two files outside the card, both required by the acceptance criteria

| File | Owner in the plan | Why P-01 had to touch it |
|---|---|---|
| `backend/alembic/env.py` | P-01 (migrations) — in scope, noted for visibility | `DATABASE_URL` always beat an explicitly-configured URL, so `tests/test_migrations.py` had its `tmp_path` database silently ignored and ran against whatever the environment held. That is why **all five** of its tests failed. Precedence is now `config.attributes` → `DATABASE_URL` → `alembic.ini`. |
| `backend/tests/test_migrations.py` | P-01 — its 4 failures are assigned here | Uses `cfg.attributes` to select its database, and its `EXPECTED_TABLES` now includes the eight tables revisions 003 and 004 add. **5/5 pass.** |

Also reverted: `ruff --fix` on `scripts/` had incidentally reordered imports
in `seed.py` and `seed_playbooks.py`. CI does not lint `scripts/`, so those
changes were unnecessary and are backed out.

---

## 3. Prisma cannot `migrate deploy` onto an Alembic-managed database

`prisma migrate deploy` refuses a non-empty schema (`P3005`), and Alembic
runs first. The supported pattern for a shared database is to apply the SQL
directly and then record it:

```bash
psql "$DATABASE_URL" -f prisma/migrations/20260910000000_p01_baseline/migration.sql
npx prisma migrate resolve --applied 20260910000000_p01_baseline
```

Documented in `docs/data-architecture.md`. **Any package or deploy script
that provisions a database must follow that order** — running
`prisma migrate deploy` first will fail, and running it after Alembic without
`resolve` leaves Prisma believing the migration is pending.

---

## 4. Money units differ between the old and new models — deliberate

Existing models store whole dollars (`monthlyRetainer: 22000`). The billing
models P-01 added store **cents** (`amountCents`), because Stripe does, and
converting once at the boundary is safer than converting on every read.

**Action for P-29:** do not "fix" this to match the older convention. The
seed sets both correctly.

---

## 5. Not done, deliberately

**The FastAPI export worker's write-back to `ExportJob` is not implemented.**
P-01 created the model, annotated the field, and documented the contract.
The worker itself is **P-08**'s (`jobs/tasks/` is its exclusive directory).
P-08's card should note that this is the one sanctioned cross-stack write.

---

## Open question for Ivan — not blocking

The Prisma baseline migration was generated with `migrate diff --from-empty`,
so it creates all 25 tables. On a database that already has Prisma tables
from an earlier `db push`, it must be `resolve --applied` rather than run.
**If any environment already has Prisma tables, say so** — that environment
needs baselining rather than migrating, and getting it the wrong way round
would attempt to recreate live tables.
