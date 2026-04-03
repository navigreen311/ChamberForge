# Prompt 10: Layer 6 — Client Lifecycle (All 9 Modules)
Branch: ai-feature/client-lifecycle

## Mission
Build all 9 Client Lifecycle modules: Pre-Meeting Intel Brief, Client Health Monitor, Offer Brand Studio, Alumni System, Competitive Moat Tracker, Offer Sunset Protocol, Delivery Team Trainer, Mobile Field Access, Scenario Planner.

## What to Build

### Backend
1. **services/backbone/intel_brief.py** — AI-generated 1-page brief before every call: prospect timeline, complexity map, recommended proof assets, key talking points
2. **services/backbone/client_health.py** — Churn signal detection, engagement scoring (0-100), early-warning alerts, health trend over time
3. **services/backbone/offer_brand.py** — Offer naming AI, positioning statement generator, visual identity suggestions
4. **services/backbone/alumni_system.py** — Post-engagement touchpoints, referral cultivation, re-entry path tracking
5. **services/backbone/moat_tracker.py** — New entrant monitoring, pricing compression alerts, repositioning recommendations
6. **services/backbone/sunset_protocol.py** — Graceful wind-down workflows: client transition plan, reputation harvest, final deliverables
7. **services/backbone/team_trainer.py** — Role-specific training curricula, UHNW context certification, progress tracking
8. **services/backbone/mobile_access.py** — API endpoints optimized for mobile: briefs, alerts, approvals, SOP lookups
9. **services/backbone/scenario_planner.py** — What-if modeling: margin, staffing, scale, white-label scenarios with interactive inputs
10. **api/v1/lifecycle.py** — All lifecycle endpoints

### Frontend
1. **app/lifecycle/page.tsx** — Client Lifecycle dashboard
2. **app/lifecycle/intel-brief/[clientId]/page.tsx** — Pre-meeting intel brief viewer
3. **app/lifecycle/health/page.tsx** — Client health monitor with charts
4. **app/lifecycle/scenario/page.tsx** — Scenario planner with what-if sliders
5. **app/lifecycle/trainer/page.tsx** — Team training module browser
6. **app/lifecycle/alumni/page.tsx** — Alumni relationship dashboard
7. **components/modules/HealthScoreChart.tsx** — Time-series health score visualization
8. **components/modules/IntelBriefCard.tsx** — Compact brief card for mobile/desktop
9. **components/modules/ScenarioSliders.tsx** — Interactive what-if sliders with live output

## Tests
- test intel brief generation with mocked AI
- test health scoring algorithm
- test scenario planner calculations
- test lifecycle API endpoints

## Commit
feat: add Client Lifecycle layer — 9 modules including intel briefs, health monitoring, scenario planner
