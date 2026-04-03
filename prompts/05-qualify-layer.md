# Prompt 05: Layer 2 — Qualify (All 8 Modules)
Branch: ai-feature/qualify-layer

## Mission
Build all 8 Qualify modules: Problem Validator, Buyer Profiler, Competitive Intel, Offer Feasibility Lab, Guardrails Engine, Geo Intelligence, Risk Review Queue, Founder Readiness Audit.

## What to Build

### Backend
1. **services/agents/validator_ai.py** — ValidatorAI agent:
   - validate_problem(problem_id) → ValidationResult — 4-point check: real, payable, deliverable, ethical
   - score_wtp_confidence(problem_id) → float — willingness-to-pay confidence
   - detect_false_positives(problem_id) → list[FalsePositiveFlag]
2. **services/backbone/buyer_profiler.py** — ICP builder by wealth tier, life stage, pain fingerprint
3. **services/backbone/competitive_intel.py** — Gap analysis, blue ocean detector, market map
4. **services/backbone/offer_feasibility.py** — Margin simulation, ops complexity, liability, founder fit scoring
5. **services/backbone/guardrails_engine.py** — Ethics rules check, regulated-domain flags, surveillance risk, consent needs. Returns PASS/WARN/BLOCK with reasons.
6. **services/backbone/geo_intelligence.py** — Jurisdiction overlay: licensing reqs, GDPR/CCPA, cross-border rules by country
7. **services/backbone/risk_review_queue.py** — Human-in-the-loop queue: items requiring manual review before proceeding
8. **services/backbone/founder_readiness.py** — Skills gap, credential map, network assessment, readiness score (0-100)
9. **api/v1/qualify.py** — Endpoints for all 8 modules

### Frontend
1. **app/qualify/page.tsx** — Qualify dashboard showing validation status, buyer profile, competitive landscape
2. **app/qualify/validate/[problemId]/page.tsx** — Problem validation detail with 4-point score
3. **app/qualify/buyer-profile/page.tsx** — ICP builder form and results
4. **app/qualify/guardrails/page.tsx** — Guardrails check results with PASS/WARN/BLOCK indicators
5. **app/qualify/risk-queue/page.tsx** — Risk Review Queue table with approve/reject actions
6. **components/modules/ValidationScorecard.tsx** — 4-point validation visual
7. **components/modules/GuardrailsBadge.tsx** — PASS(green)/WARN(yellow)/BLOCK(red)
8. **components/modules/ReadinessGauge.tsx** — Circular gauge 0-100 for founder readiness

## Tests
- test ValidatorAI 4-point check logic
- test GuardrailsEngine with edge cases (regulated domains, surveillance detection)
- test API endpoints with various inputs

## Commit
feat: add complete Qualify layer — 8 modules including validation, buyer profiling, guardrails, and risk review
