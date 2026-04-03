# Prompt 16: Vertical Playbooks Engine (10 Playbooks)
Branch: ai-feature/playbooks-engine

## Mission
Build the Playbook system that ships 10 prebuilt premium offer templates, each a complete business-in-a-box. Users activate a playbook and have a complete offer framework in under 60 minutes.

## What to Build

### Backend
1. **services/backbone/playbook_engine.py** — PlaybookEngine:
   - activate_playbook(workspace_id, playbook_slug) → ActivatedPlaybook — instantiate all components from template
   - customize_playbook(activation_id, overrides) → ActivatedPlaybook — adjust ICP, pricing, SOPs
   - get_playbook_progress(activation_id) → PlaybookProgress — completion % across all sections
   - export_playbook(activation_id, format) → file — export as PDF or structured JSON
2. **services/backbone/playbook_data.py** — Complete data for all 10 playbooks:
   - Private Ops Office ($15-30K/mo, newly wealthy founders, coordination overload)
   - Ecosystem Orchestrator ($20-40K/mo, multi-residence UHNW, fragmented vendors)
   - Family Cyber Command ($10-25K/mo, family offices, AI impersonation/wire fraud)
   - Footprint Reduction ($8-18K/mo, public-facing executives, data broker exposure)
   - Household Workforce ($12-22K/mo, principals with large staff, insider risk)
   - Family Risk Council ($15-35K/qtr, investment-focused FOs, non-investment risk)
   - Next-Gen Studio ($25-60K project, multigenerational wealth, succession conflict)
   - Medical Navigation ($8-20K/mo, UHNW health-focused, fragmented records)
   - Property Resilience ($10-20K/yr, high-value property owners, insurance gaps)
   - Travel Reliability Desk ($6-15K/mo, frequent multi-gen travelers, disruption)
   Each playbook includes: full ICP, pain triggers, evidence citations, pricing model, required partners, SOP skeleton, trust concerns, objection handling scripts, KPI stack, VoiceForge/VisionAudioForge asset recommendations
3. **api/v1/playbooks.py** — List playbooks, activate, customize, get progress, export

### Frontend
1. **app/build/playbooks/page.tsx** — Playbook gallery with cards for each of the 10 playbooks
2. **app/build/playbooks/[slug]/page.tsx** — Playbook detail: ICP, pricing, SOPs, pain triggers, KPIs
3. **app/build/playbooks/[slug]/activate/page.tsx** — Playbook activation wizard with customization steps
4. **components/modules/PlaybookCard.tsx** — Card: name, target buyer, price range, core pain, activation CTA
5. **components/modules/PlaybookProgress.tsx** — Completion progress bar with section breakdown
6. **components/modules/PlaybookCustomizer.tsx** — Form for adjusting ICP, pricing, SOPs from template

## Tests
- test all 10 playbook data completeness
- test activation and customization flow
- test progress tracking calculation
- test export functionality

## Commit
feat: add Playbook Engine with 10 complete premium offer templates — activate-to-offer in under 60 minutes
