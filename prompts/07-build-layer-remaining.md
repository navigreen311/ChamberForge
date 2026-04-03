# Prompt 07: Layer 3 Remaining — Proof Builder, Fulfillment OS, Execution Blueprint, Deal Desk, Trust Pack, Wedge Entry, Retainer Ops
Branch: ai-feature/build-layer-remaining

## Mission
Complete Layer 3 (Build) with the remaining 8 modules: Proof Builder, Fulfillment OS, Execution Blueprint, Deal Desk, Trust Pack Studio, Wedge Entry Builder, Household Graph OS, Retainer Ops.

## What to Build

### Backend
1. **services/agents/fulfillment_ai.py** — FulfillmentAI agent:
   - generate_sop_bundle(offer_id) → SOPBundle — staffing plan, tooling stack, service calendar, delivery risk map
   - generate_execution_blueprint(offer_id) → ExecutionBlueprint — role map, QA checklist
   - assess_delivery_risk(offer_id) → list[DeliveryRisk]
2. **services/agents/proof_ai.py** — ProofAI agent:
   - design_kpi_stack(offer_id) → list[KPI]
   - generate_roi_framework(offer_id) → ROIFramework
   - build_case_study_template(offer_id) → CaseStudyTemplate
3. **services/backbone/deal_desk.py** — proposals, scope-of-work generation, retainer packaging, NDA/confidentiality templates
4. **services/backbone/trust_pack.py** — due diligence packs, credibility sheets, privacy statements
5. **services/backbone/wedge_entry.py** — first-client sequencing, minimum viable offer, upsell path
6. **services/backbone/household_graph.py** — CRUD for per-client household graphs (members, properties, staff, vendors, entities, risks, jurisdictions)
7. **services/backbone/retainer_ops.py** — Stripe integration: recurring billing, milestone invoicing, partner payouts, referral tracking
8. **api/v1/build.py** — Endpoints for all modules
9. **api/v1/household.py** — Household Graph CRUD + search
10. **api/v1/billing.py** — Stripe billing endpoints

### Frontend
1. **app/build/proof/page.tsx** — KPI designer and ROI framework builder
2. **app/build/fulfillment/page.tsx** — Fulfillment OS with SOP viewer and delivery risk map
3. **app/build/deal-desk/page.tsx** — Proposal and scope-of-work generator
4. **app/build/trust-pack/page.tsx** — Trust pack builder and preview
5. **app/build/household/[clientId]/page.tsx** — Household Graph interactive editor
6. **app/build/billing/page.tsx** — Retainer billing dashboard with Stripe integration
7. **components/modules/HouseholdGraphViewer.tsx** — Interactive graph visualization of household members, properties, staff
8. **components/modules/SOPViewer.tsx** — SOP display with checklist tracking

## Tests
- test FulfillmentAI SOP generation
- test ProofAI KPI stack
- test Household Graph CRUD
- test Stripe billing integration (mocked)

## Commit
feat: add Proof Builder, Fulfillment OS, Deal Desk, Trust Pack, Wedge Entry, Household Graph, and Retainer Ops
