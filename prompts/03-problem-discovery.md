# Prompt 03: Layer 1 — Problem Discovery Engine + Problem Library
Branch: ai-feature/problem-discovery

## Mission
Build the Problem Discovery module (AI scans wealth reports, FBI/FTC alerts, regulatory feeds), Trend Radar, and Problem Library with full CRUD, search, and lifecycle tracking.

## What to Build

### Backend
1. **services/agents/problem_ai.py** — ProblemAI agent class:
   - discover_problems(data_sources: list[str]) → list[Problem] — uses Claude API to analyze text sources and extract premium pain points
   - score_problem(problem_id) → urgency_score, wtp_confidence — multi-factor scoring
   - classify_lifecycle(problem_id) → LifecycleStage — Emerging/Accelerating/Proven/Saturated/Declining
2. **services/backbone/problem_library.py** — ProblemLibrary service:
   - create, read, update, delete, list with filtering (by tier, pain_category, lifecycle_stage, urgency)
   - search_problems(query) — Elasticsearch full-text search
   - get_trending(limit) — top problems by urgency + recency
3. **services/backbone/trend_radar.py** — TrendRadar service:
   - map_trends_to_opportunities(geo, tier) — maps macro trends to micro premium opportunities
   - get_lifecycle_distribution() — counts by lifecycle stage
4. **api/v1/problems.py** — Full REST API: CRUD + search + trending + lifecycle classification
5. **api/v1/discovery.py** — POST /discover (trigger AI scan), GET /discovery/status

### Frontend
1. **app/discover/page.tsx** — Problem Discovery dashboard with search, filters, lifecycle badges
2. **app/discover/[id]/page.tsx** — Problem detail view with evidence, scoring, lifecycle
3. **components/modules/ProblemCard.tsx** — Card showing problem summary, tier, urgency, lifecycle
4. **components/modules/TrendRadar.tsx** — Visual trend radar showing lifecycle distribution
5. **components/modules/LifecycleBadge.tsx** — Color-coded badge: Emerging(green)/Accelerating(blue)/Proven(gold)/Saturated(orange)/Declining(red)

## Tests
- test ProblemAI agent with mocked Claude responses
- test ProblemLibrary CRUD and search
- test API endpoints with auth

## Commit
feat: add Problem Discovery engine, Trend Radar, Problem Library with AI scoring and Elasticsearch search
