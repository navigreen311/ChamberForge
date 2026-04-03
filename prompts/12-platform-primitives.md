# Prompt 12: Layer 8 — Platform Primitives (All 7 SaaS Modules)
Branch: ai-feature/platform-primitives

## Mission
Build all 7 SaaS infrastructure modules: AI Eval Lab, Entitlement & Flags Engine, Rules & Automation Builder, Records Governance Manager, Customer Trust Center, Sandbox Workspace, AI Runtime Governance.

## What to Build

### Backend
1. **services/backbone/ai_eval_lab.py** — Golden test sets per AI agent, prompt version history (store every prompt template with version + timestamp), regression testing runner (compare current vs baseline outputs), accuracy/compliance/hallucination scorecards, one-click rollback to last known good prompt. Weekly automated cycle via background job.
2. **services/backbone/entitlements.py** — Plan-based feature gates: Core/Pro/Enterprise feature map, seat-based permissions, staged rollout percentages, beta access toggles, A/B test variant assignment, feature flag check API
3. **services/backbone/rules_engine.py** — User-configurable if/then triggers: trigger types (wealth_event_detected, client_health_below, regulatory_alert, kpi_below_sla), action types (create_task, send_alert, open_risk_review, trigger_escalation), rule CRUD, rule evaluation engine, execution log
4. **services/backbone/records_governance.py** — Retention schedules by document class, legal hold freezes with audit trail, deletion exception workflows, archival policies, export expiration, jurisdiction-aware lifecycle
5. **services/backbone/trust_center.py** — Customer-facing security portal: uptime history, incident log, subprocessor list, DPA download, pen test summary, security questionnaire library, SOC2 roadmap status
6. **services/backbone/sandbox.py** — Isolated environment: synthetic household graphs, fake client scenarios, demo accounts, enterprise pilot mode. Data isolation from production.
7. **services/backbone/ai_runtime.py** — Operator dashboard: cost per agent/module/workspace, latency by workflow, cache hit rate, model routing rules, usage budgets with alerts, failure monitoring, manual approval thresholds for expensive operations
8. **api/v1/primitives.py** — All platform primitive endpoints
9. **api/v1/admin.py** — Admin-only endpoints for eval lab, entitlements, rules, records, trust center

### Frontend
1. **app/admin/page.tsx** — Platform Admin dashboard
2. **app/admin/eval-lab/page.tsx** — AI Eval Lab: test sets, regression results, prompt versions, rollback
3. **app/admin/entitlements/page.tsx** — Feature flags and plan management
4. **app/admin/rules/page.tsx** — Rules & Automation builder with visual if/then editor
5. **app/admin/records/page.tsx** — Records governance with retention schedules
6. **app/admin/trust-center/page.tsx** — Customer Trust Center editor
7. **app/admin/sandbox/page.tsx** — Sandbox workspace management
8. **app/admin/runtime/page.tsx** — AI Runtime dashboard with cost/latency charts
9. **components/modules/RuleBuilder.tsx** — Visual if/then rule editor
10. **components/modules/RuntimeDashboard.tsx** — Cost, latency, cache charts
11. **components/modules/EvalLabResults.tsx** — Regression test results with pass/fail indicators

## Tests
- test entitlement checks for each plan level
- test rules engine trigger evaluation
- test AI eval lab regression comparison
- test records governance retention logic
- test sandbox data isolation

## Commit
feat: add Platform Primitives — AI Eval Lab, entitlements, rules engine, records governance, trust center, sandbox, runtime
