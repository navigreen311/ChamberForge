# Prompt 27: Frontend — Build & Sell Pages
Branch: ai-feature/frontend-build-sell

## Mission
Build all frontend pages for the Build layer (offers, pricing, fulfillment, playbooks, household graph, billing) and Sell layer (marketing, revenue, persona sim, retention).

## What to Build

### Build Pages
1. **app/build/page.tsx** — Build hub: active offers summary, playbook activations, billing overview
2. **app/build/offer/new/page.tsx** — Offer creation wizard: step 1 (select problem) → step 2 (value stack builder) → step 3 (delivery model) → step 4 (guarantees) → step 5 (pricing) → step 6 (review & create)
3. **app/build/offer/[id]/page.tsx** — Offer detail: all sections editable, linked evidence, service design, fulfillment plan
4. **app/build/pricing/[offerId]/page.tsx** — Pricing studio: benchmark comparison, anchor construction, margin simulator with sliders, packaging options
5. **app/build/fulfillment/[offerId]/page.tsx** — Fulfillment dashboard: SOP viewer, staffing plan, delivery calendar, risk map
6. **app/build/playbooks/page.tsx** — Playbook gallery: 10 cards with activation CTA
7. **app/build/playbooks/[slug]/page.tsx** — Playbook detail and activation flow
8. **app/build/household/[clientId]/page.tsx** — Interactive household graph: draggable nodes for family, properties, staff, vendors, entities. Click to expand details.

### Sell Pages
1. **app/sell/page.tsx** — Sell & Retain hub: pipeline view, active outreach, client health summary
2. **app/sell/marketing/page.tsx** — Marketing Engine: copy generator (positioning, PAS, objections), Dream 100 list
3. **app/sell/revenue/page.tsx** — Revenue Projector: interactive ARR model with scenario tabs, funnel visualization
4. **app/sell/persona-sim/page.tsx** — Persona Simulator: select persona type, start roleplay, live transcript, performance scoring
5. **app/sell/onboarding/[clientId]/page.tsx** — Client onboarding: 90-day timeline, welcome checklist, value demo schedule
6. **app/sell/retention/page.tsx** — Retention dashboard: client health table, churn risk alerts, upsell opportunities, renewal calendar

## Tests
- test offer wizard step navigation
- test pricing margin calculator
- test household graph node rendering
- test revenue projector chart data
- test persona simulator UI states

## Commit
feat: add Build and Sell frontend pages — offer wizard, pricing studio, playbooks, household graph, persona simulator, retention
