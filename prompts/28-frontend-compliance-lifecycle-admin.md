# Prompt 28: Frontend — Compliance, Lifecycle & Admin Pages
Branch: ai-feature/frontend-compliance-lifecycle-admin

## Mission
Build all remaining frontend pages for Compliance, Lifecycle, and Admin sections.

## What to Build

### Compliance Pages
1. **app/compliance/page.tsx** — Compliance hub: consent status overview, pending reviews, quality score
2. **app/compliance/consent/page.tsx** — Consent ledger: client table with NDA status, consent types, revocation actions
3. **app/compliance/explainability/[outputId]/page.tsx** — AI output explainability: evidence chain visualization, confidence score breakdown, source freshness timeline, assumption flags
4. **app/compliance/quality/page.tsx** — Service quality: SLA adherence charts, onboarding quality scores, retention risk heatmap
5. **app/compliance/comms/page.tsx** — Secure comms hub: encrypted message list, identity verification status, audit trail viewer

### Lifecycle Pages
1. **app/lifecycle/page.tsx** — Lifecycle hub: upcoming meetings, health alerts, training status
2. **app/lifecycle/intel-brief/[clientId]/page.tsx** — Intel brief viewer: one-page brief, audio player, visual snapshot
3. **app/lifecycle/health/page.tsx** — Client health monitor: sortable table, trend charts per client, early warning alerts
4. **app/lifecycle/scenario/page.tsx** — Scenario planner: what-if sliders (margin, staffing, scale, white-label), live output charts
5. **app/lifecycle/trainer/page.tsx** — Team trainer: curriculum browser, video modules, certification progress, assessment scores
6. **app/lifecycle/alumni/page.tsx** — Alumni system: past clients, touchpoint timeline, referral status, re-entry path

### Admin Pages
1. **app/admin/page.tsx** — Admin dashboard: system health, user count, job status, AI costs
2. **app/admin/users/page.tsx** — User management: CRUD table, role assignment, workspace membership
3. **app/admin/workspaces/page.tsx** — Workspace management: list, settings, plan management
4. **app/admin/eval-lab/page.tsx** — AI Eval Lab: test set browser, regression results, prompt version history, rollback button
5. **app/admin/entitlements/page.tsx** — Feature flag management: toggles per plan/workspace, A/B test configuration
6. **app/admin/rules/page.tsx** — Rules builder: visual if/then editor, execution log, active rules list
7. **app/admin/runtime/page.tsx** — AI Runtime: cost charts per agent, latency percentiles, cache hit rate, budget alerts

## Tests
- test compliance page renders consent data
- test scenario planner slider interactions
- test admin user management CRUD
- test entitlement toggle behavior

## Commit
feat: add Compliance, Lifecycle, and Admin frontend pages — consent ledger, health monitor, scenario planner, eval lab, runtime
