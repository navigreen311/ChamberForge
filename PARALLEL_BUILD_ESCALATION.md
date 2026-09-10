# P-00 — Escalations

Filed per the per-package protocol: a package that needs a file outside its
allowed list records what it needed and why rather than editing silently.

P-00's exit criteria are `ruff` 0, `tsc` 0 and a passing `next build`. Those
are repository-wide by nature, so a handful of fixes landed in files the
coordination plan assigns to other packages. All are import-only or
type-shape changes with no behaviour impact, and none touch a file another
package holds *exclusively* for the whole window.

---

## 1. Two `F821` forward references — files owned by P-30 and P-14

| File | Owner in the plan | What P-00 did |
|---|---|---|
| `backend/app/api/v1/portal.py:68` | **P-30** | added a `TYPE_CHECKING` import for `ClientPortalAccess` |
| `backend/app/services/backbone/playbook_engine.py:201` | **P-14** | added a `TYPE_CHECKING` import for `Offer` |

**Why it could not wait.** `ruff check .` exiting 0 is P-00's gate, and
these two were the only remaining errors after the autofix pass. Leaving
them would mean no agent could use a clean ruff run as a signal, which is
the whole point of landing P-00 first.

**Action for the coordinator:** P-14 and P-30's cards each say "fixes the
F821 forward ref". **Strike that line from both** — it is done, and an
agent that goes looking for it will find nothing and may invent work.

---

## 2. Type-shape fixes in components owned by BFF packages

| File | Owner in the plan | What P-00 did |
|---|---|---|
| `src/app/components/shared/JargonTooltip.tsx` | P-20 (callers) | declared **and honoured** the `bare` prop two callers already passed |
| `src/app/components/dashboard/CommandAICard.tsx` | P-19 | `open=` → `isOpen=`, matching `EvidenceDrawerProps` |
| `src/app/components/discover/ProblemOfferDrawer.tsx` | P-21 | made the extended presentation block optional |
| `src/app/sandbox/page.tsx` | P-23 | widened `useState` from the inferred literal to `string` |
| `src/app/automation/page.tsx` | P-23 | renamed `useTemplate` → `applyTemplate` (a click handler, not a Hook) |
| `src/app/offers/page.tsx`, `playbooks/page.tsx`, `components/playbooks/ActivatePlaybookModal.tsx` | P-21 / P-22 | escaped five JSX entities |

**Why it could not wait.** `next build` runs typecheck and lint, and fails
on any of these. Without them the frontend does not build, so no frontend
package can validate its own work.

**None of these change rendered output** except `JargonTooltip`, where
`bare` now actually suppresses the dotted underline instead of being
silently ignored — the behaviour the callers already assumed.

---

## 3. `frontend/src/app/layout.tsx` — claimed by P-11 and P-25

`ModeProvider` was defined but mounted nowhere, so every page calling
`useMode()` threw and the build died prerendering `/settings/mode`. Fixing
it required the root layout.

Rather than leave `layout.tsx` contended, P-00 **froze it** and created
`src/app/components/providers/AppProviders.tsx` as a client-side seam.

**Action for the coordinator — this changes two cards:**

- **P-11** must nest `SessionProvider` inside `AppProviders`, **not** open
  `layout.tsx`. Its card currently says "mount SessionProvider in
  `app/layout.tsx`".
- **P-25** likewise for the top-level error boundary.

`layout.tsx` is now on the P-00-frozen list in `PARALLEL_BUILD.md`.

---

## 4. `tests/test_env_validator.py` — P-00's own regression

Not a scope exception; recorded so the count is auditable. Making
`validate_environment()` fail closed broke three of its own tests: the
mocked settings carry no `APP_ENV`, and a `MagicMock`'s `.lower()` is not a
string, so the new guard fired inside every one. Fixed here — 6/6 pass.

**139 observed failures − 3 mine = 136 pre-existing**, which is the number
triaged in `PARALLEL_BUILD.md`.

---

## 5. Prisma pinned to `6.12.0`, not `^6` — needs a decision at P-27

`6.19.x` pulls a vulnerable `@prisma/config → deepmerge-ts` chain
(stack exhaustion), and `npm audit` names `6.12.0` as the fix. 6.12's config
API also requires `earlyAccess: true` in `prisma.config.ts`, which signals
an unstable surface.

**Action for P-27:** revisit the pin. If a later 6.x drops the vulnerable
chain, move to it and remove `earlyAccess`. Do not bump it blind — the
config file will break.

---

## 6. Not fixed, deliberately — 5 npm vulnerabilities

`npm audit` went 13 → 5. The remaining five (1 critical in `next`, plus
`postcss`, `glob`, `eslint-config-next`) all require **Next 14 → 16**, which
is **P-27's** scope. Smuggling a framework major into P-00 would put every
downstream package on an untested baseline.

---

## Open question for Ivan — not blocking

`/api/v1/health/dependencies` and `/api/v1/metrics/detailed` are
**deliberately not** on the auth-coverage allowlist. Both disclose
infrastructure state, so they are counted as open routes and a router
package will have to gate them. If either is scraped by an unauthenticated
collector, say so and they move to the allowlist with a reason recorded.
