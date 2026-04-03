# Prompt 01: Core Data Models & Database Foundation
Branch: ai-feature/core-models-db

## Mission
Build the foundational SQLAlchemy models and Pydantic schemas for the entire ChamberForge platform. This is the data layer everything else depends on.

## What to Build

### SQLAlchemy Models (backend/app/models/)
1. **user.py** — User model: id, email, name, hashed_password, role (admin/operator/viewer), workspace_id, created_at, updated_at
2. **workspace.py** — Multi-tenant workspace: id, name, slug, plan (core/pro/enterprise), owner_id, settings (JSON), created_at
3. **problem.py** — Problem entity (Problem Ontology): id, workspace_id, title, description, wealth_tier (enum: HNWI/UHNWI/FamilyOffice/Dynasty), buyer_type (enum), life_stage (enum), trigger_event (enum), pain_category (enum), urgency_score (1-10), wtp_profile (enum), trust_channel (enum), compliance_risk (enum), delivery_model (enum), proof_metric (enum), lifecycle_stage (enum: Emerging/Accelerating/Proven/Saturated/Declining), status, created_by, timestamps
4. **evidence.py** — Evidence Graph: id, problem_id, source_url, source_type (enum: peer_reviewed/regulatory/industry_report/enforcement_action), publication_date, credibility_score (1-10), extracted_claims (JSON array), contradiction_flags (JSON), recency_decay_score (computed), created_at
5. **offer.py** — Offer entity: id, workspace_id, problem_id, name, value_stack (JSON), delivery_model, guarantee_framework (JSON), pricing_model (JSON), status (draft/active/sunset), created_by, timestamps
6. **client.py** — Client/prospect: id, workspace_id, name, company, wealth_tier, buyer_type, life_stage, status (prospect/active/alumni), onboarded_at, health_score, timestamps
7. **household_graph.py** — HouseholdGraph: id, client_id, members (JSON — family members + roles), properties (JSON — addresses + risk profiles), staff (JSON — names + access levels), vendors (JSON — vendor + vetting status), entities (JSON — trusts + legal entities), risk_exposures (JSON), jurisdictions (JSON)
8. **playbook.py** — Playbook template: id, slug, name, target_buyer, price_range_min, price_range_max, core_pain, icp (JSON), pain_triggers (JSON), pricing_model (JSON), sop_skeleton (JSON), trust_concerns (JSON), kpi_stack (JSON)
9. **audit_log.py** — AuditLog: id, workspace_id, user_id, action, resource_type, resource_id, details (JSON), ip_address, timestamp

### Pydantic Schemas (backend/app/schemas/)
For each model, create: Create, Read, Update, and List schemas with proper validation.

### Database Setup (backend/app/db/)
- Update session.py to import all models
- Create alembic.ini and initial migration
- Add a seed script at scripts/seed_playbooks.py that seeds the 10 vertical playbooks from the blueprint

### Enums (backend/app/models/enums.py)
All enum types used across models: WealthTier, BuyerType, LifeStage, TriggerEvent, PainCategory, WTPProfile, TrustChannel, ComplianceRisk, DeliveryModel, ProofMetric, LifecycleStage, UserRole, WorkspacePlan, OfferStatus, ClientStatus, SourceType

## Tests
- backend/tests/unit/test_models.py — test all model creation, enum validation, relationships
- backend/tests/unit/test_schemas.py — test Pydantic validation, required fields, enum coercion

## Commands
```bash
cd backend && python -m pytest tests/unit/test_models.py tests/unit/test_schemas.py -v
```

## Commit
feat: add core data models, schemas, enums, and seed script for all 109-module foundation
