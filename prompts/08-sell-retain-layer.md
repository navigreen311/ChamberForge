# Prompt 08: Layer 4 — Sell & Retain (All 13 Modules)
Branch: ai-feature/sell-retain-layer

## Mission
Build all 13 Sell & Retain modules: Marketing Engine, Revenue Projector, Partner Builder, Trust Network Mapper, Go-To-Market Lab, Authority Positioning, Outcome Intelligence, Client Onboarding Designer, Persona Simulator, Client Retention Engine, Decision Room, Proof-to-Reputation Engine, Vetted Expert Network.

## What to Build

### Backend
1. **services/agents/copy_ai.py** — CopyAI agent: positioning copy, PAS outreach, objection handling, authority content
2. **services/agents/relationship_ai.py** — RelationshipAI agent: gatekeeper personas, referral paths, trust channel scoring, intro scripts
3. **services/backbone/marketing_engine.py** — positioning one-liners, Dream 100 strategy, PAS copy generation
4. **services/backbone/revenue_projector.py** — ARR modeling, client funnel scenarios, break-even analysis
5. **services/backbone/partner_builder.py** — ecosystem mapping, vet workflows, rev-share modeling
6. **services/backbone/trust_network.py** — gatekeeper persona maps, referral paths, introduction scripts
7. **services/backbone/gtm_lab.py** — headline testing, price anchors, objection handling, referral scripts
8. **services/backbone/authority_positioning.py** — thought leadership architecture, media placements, content plan
9. **services/backbone/outcome_intelligence.py** — live KPI tracking, quarterly scorecards, renewal justification
10. **services/backbone/client_onboarding.py** — first 90-day experience, welcome protocol, value demos
11. **services/backbone/persona_simulator.py** — AI-powered UHNW buyer roleplay for practice
12. **services/backbone/client_retention.py** — health scoring, upsell triggers, referral harvesting, renewal cadence
13. **services/backbone/decision_room.py** — stakeholder maps, multi-party approvals, committee materials
14. **services/backbone/proof_reputation.py** — case study builder, testimonial flows, media-proof snippets
15. **services/backbone/expert_network.py** — licensed operator directory, credential verification, handoff
16. **api/v1/sell.py** — All sell & retain endpoints

### Frontend
1. **app/sell/page.tsx** — Sell & Retain dashboard
2. **app/sell/marketing/page.tsx** — Marketing Engine with copy generator
3. **app/sell/revenue/page.tsx** — Revenue projector with interactive charts
4. **app/sell/persona-sim/page.tsx** — Persona Simulator roleplay interface
5. **app/sell/onboarding/page.tsx** — Client onboarding designer
6. **app/sell/retention/page.tsx** — Client retention dashboard with health scores
7. **app/sell/decision-room/page.tsx** — Decision room with stakeholder map

## Tests
- test CopyAI and RelationshipAI with mocked responses
- test revenue projector calculations
- test persona simulator conversation flow
- test client retention health scoring

## Commit
feat: add complete Sell & Retain layer — 13 modules including marketing, persona simulator, retention engine
