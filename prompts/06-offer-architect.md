# Prompt 06: Layer 3 — Offer Architect + Pricing Intelligence + Service Design
Branch: ai-feature/offer-architect

## Mission
Build Offer Architect (value stack, delivery model, guarantee framework), Pricing Intelligence (benchmarks, anchors, packaging), and Service Design Studio (SOPs, client journeys, touchpoints).

## What to Build

### Backend
1. **services/agents/offer_ai.py** — OfferAI agent:
   - generate_offer(problem_id, buyer_profile) → OfferDraft — structured offer with value stack, delivery model, guarantee framework
   - refine_offer(offer_id, feedback) → OfferDraft — iterate based on user feedback
   - generate_value_stack(pain_category, delivery_model) → list[ValueLayer]
2. **services/agents/pricing_ai.py** — PricingAI agent:
   - generate_pricing(offer_id) → PricingRecommendation — benchmark logic, anchor construction, packaging
   - simulate_margins(offer_id, pricing_model) → MarginSimulation
   - compare_market_benchmarks(pain_category, geo) → list[Benchmark]
3. **services/backbone/service_design.py** — ServiceDesignStudio:
   - generate_sops(offer_id) → list[SOP]
   - map_client_journey(offer_id) → JourneyMap (stages, touchpoints, escalation paths)
   - design_touchpoints(offer_id) → list[Touchpoint]
4. **api/v1/offers.py** — Full CRUD + AI generation + pricing + service design endpoints
5. **models/offer.py** — Update with: value_stack_json, guarantee_json, pricing_json, sop_json, journey_map_json

### Frontend
1. **app/build/page.tsx** — Build layer dashboard
2. **app/build/offer/new/page.tsx** — AI-powered offer creation wizard (step: problem → value stack → delivery → guarantees → pricing)
3. **app/build/offer/[id]/page.tsx** — Offer detail with all components
4. **app/build/pricing/[offerId]/page.tsx** — Pricing configuration with margin simulator
5. **components/modules/ValueStackBuilder.tsx** — Interactive value stack editor
6. **components/modules/PricingCalculator.tsx** — Real-time pricing with margin preview
7. **components/modules/JourneyMapViewer.tsx** — Visual client journey map

## Tests
- test OfferAI generation with mocked Claude
- test PricingAI benchmark and margin logic
- test offer CRUD API

## Commit
feat: add Offer Architect, Pricing Intelligence, and Service Design Studio with AI generation
