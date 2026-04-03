# Prompt 26: Frontend — Discover & Qualify Pages
Branch: ai-feature/frontend-discover-qualify

## Mission
Build all frontend pages for the Discover layer (problems, evidence, trends) and Qualify layer (validation, buyer profiler, guardrails, risk queue, readiness).

## What to Build

### Discover Pages
1. **app/discover/page.tsx** — Problem Discovery hub: search bar, filter panel (tier, pain, lifecycle, urgency), problem card grid, "Run AI Discovery" action button
2. **app/discover/[id]/page.tsx** — Problem detail: description, ontology fields, evidence list, lifecycle timeline, urgency gauge, linked offers, AI scoring breakdown
3. **app/discover/evidence/page.tsx** — Evidence Graph browser: source list sortable by credibility/recency, contradiction alerts banner, analyst queue count badge
4. **app/discover/evidence/[id]/page.tsx** — Evidence detail: source info, extracted claims list, credibility score with breakdown, recency decay visualization, linked problems
5. **app/discover/trends/page.tsx** — Trend Radar: lifecycle distribution chart (pie/donut), emerging opportunities table, geo heat map (if data available)

### Qualify Pages
1. **app/qualify/page.tsx** — Qualify hub: recent validations, buyer profiles, guardrail checks
2. **app/qualify/validate/[problemId]/page.tsx** — 4-point validation scorecard: real (evidence), payable (WTP), deliverable (ops feasibility), ethical (guardrails). Each with score, evidence, AI reasoning.
3. **app/qualify/buyer-profile/page.tsx** — ICP builder: form inputs (tier, life stage, pain) → AI-generated profile with demographics, motivations, objections, trust channels
4. **app/qualify/competitive/page.tsx** — Competitive landscape: market map, gap analysis, blue ocean zones
5. **app/qualify/guardrails/page.tsx** — Guardrails check results: PASS/WARN/BLOCK per rule with explanations
6. **app/qualify/risk-queue/page.tsx** — Risk Review Queue: table with item, risk level, assigned reviewer, approve/reject/escalate actions
7. **app/qualify/readiness/page.tsx** — Founder Readiness Audit: skills radar chart, credential checklist, network score, overall readiness gauge

## Tests
- test discover page filtering logic
- test evidence recency decay visualization
- test validation scorecard rendering
- test guardrails badge display
- test risk queue approve/reject flow

## Commit
feat: add Discover and Qualify frontend pages — problem browser, evidence graph, validation scorecard, buyer profiler, guardrails
