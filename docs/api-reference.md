# ChamberForge API Reference

Base URL: `http://localhost:8000` (development) | `https://api.chamberforge.com` (production)

Interactive docs: `/api/docs` (Swagger) | `/api/redoc` (ReDoc)

All endpoints require `Authorization: Bearer <token>` unless noted otherwise.

---

## Root Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Root health check (no auth) |

---

## Auth (`/api/v1/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate and get tokens |
| POST | `/refresh` | Refresh access token |
| GET | `/me` | Get current user profile |
| POST | `/logout` | Invalidate current session |

---

## Users (`/api/v1/users`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all users in workspace |
| GET | `/{user_id}` | Get user by ID |
| PUT | `/{user_id}` | Update user |
| DELETE | `/{user_id}` | Delete user |

---

## Workspaces (`/api/v1/workspaces`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/current` | Get current workspace |
| PUT | `/current` | Update current workspace settings |

---

## Layer: Discover

### Problems (`/api/v1/problems`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/trending` | Get trending problems |
| GET | `/` | List problems with filters and pagination |
| POST | `/` | Create a new problem |
| GET | `/{problem_id}` | Get problem by ID |
| PUT | `/{problem_id}` | Update problem |
| DELETE | `/{problem_id}` | Delete problem |

### Discovery (`/api/v1/discovery`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/scan` | AI-powered problem scanning |
| GET | `/lifecycle-distribution` | Get lifecycle stage distribution |
| GET | `/opportunities` | Get high-priority opportunities |

### Evidence (`/api/v1/evidence`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/analyst-queue` | Evidence items needing review |
| GET | `/` | List all evidence |
| POST | `/` | Create evidence record |
| GET | `/{evidence_id}` | Get evidence by ID |
| PUT | `/{evidence_id}` | Update evidence |
| DELETE | `/{evidence_id}` | Delete evidence |
| POST | `/{evidence_id}/link/{problem_id}` | Link evidence to problem |
| POST | `/ingest` | AI-powered evidence ingestion |
| POST | `/recalculate-decay` | Recalculate recency decay scores |

---

## Layer: Qualify

### Qualify (`/api/v1/qualify`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/validate/{problem_id}` | Validate problem quality |
| POST | `/buyer-profile` | Generate buyer profile |
| POST | `/competitive-intel` | Generate competitive intelligence |
| POST | `/feasibility` | Feasibility assessment |
| POST | `/guardrails-check` | Check regulatory guardrails |
| GET | `/geo-rules/{country_code}` | Get geo-specific rules |
| POST | `/geo-compliance` | Check geo compliance |
| GET | `/risk-queue` | Get items in risk review queue |
| POST | `/risk-queue/{item_id}/approve` | Approve risk queue item |
| POST | `/risk-queue/{item_id}/reject` | Reject risk queue item |
| POST | `/risk-queue/{item_id}/escalate` | Escalate risk queue item |
| POST | `/founder-readiness` | Assess founder readiness |

---

## Layer: Build

### Offers (`/api/v1/offers`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List offers |
| POST | `/` | Create offer |
| GET | `/{offer_id}` | Get offer by ID |
| PUT | `/{offer_id}` | Update offer |
| DELETE | `/{offer_id}` | Delete offer |
| POST | `/generate` | AI-generate offer from problem |
| POST | `/{offer_id}/refine` | Refine offer with AI |
| POST | `/{offer_id}/pricing` | Generate pricing model |
| POST | `/simulate-margins` | Simulate profit margins |
| GET | `/benchmarks/{pain_category}` | Get category benchmarks |
| POST | `/{offer_id}/sops` | Generate SOPs for offer |
| POST | `/{offer_id}/journey` | Generate client journey map |

### Build (`/api/v1/build`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/fulfillment/sop-bundle` | Generate SOP bundle |
| POST | `/fulfillment/blueprint` | Generate fulfillment blueprint |
| POST | `/proof/kpi-stack` | Generate KPI stack |
| POST | `/proof/roi` | Generate ROI analysis |
| POST | `/proof/case-study` | Generate case study |
| POST | `/deal-desk/proposal` | Generate proposal |
| POST | `/deal-desk/sow` | Generate statement of work |
| POST | `/deal-desk/nda` | Generate NDA |
| POST | `/trust-pack` | Generate trust pack |
| POST | `/wedge-entry` | Generate wedge entry strategy |

### Household (`/api/v1/household`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/{client_id}` | Create household graph |
| GET | `/{client_id}` | Get household graph |
| PUT | `/{client_id}` | Update household graph |
| POST | `/{client_id}/members` | Add household member |
| POST | `/{client_id}/properties` | Add property |
| POST | `/{client_id}/staff` | Add staff member |
| POST | `/{client_id}/vendors` | Add vendor |
| GET | `/{client_id}/risks` | Get risk exposures |

---

## Layer: Sell

### Sell (`/api/v1/sell`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/copy/positioning` | Generate positioning copy |
| POST | `/copy/outreach` | Generate outreach copy |
| POST | `/copy/authority-content` | Generate authority content |
| POST | `/relationships/gatekeepers` | Map gatekeeper relationships |
| POST | `/relationships/referral-paths` | Map referral paths |
| POST | `/relationships/trust-scores` | Calculate trust scores |
| POST | `/marketing/dream-100` | Generate Dream 100 list |
| POST | `/revenue/project` | Project revenue |
| GET | `/partners/ecosystem/{pain_category}` | Get ecosystem partners |
| GET | `/trust-network/{deal_id}` | Get trust network for deal |
| POST | `/gtm/headline-test` | Test GTM headlines |
| POST | `/gtm/price-anchoring` | Generate price anchoring |
| POST | `/authority/content-plan` | Generate authority content plan |
| POST | `/outcomes/kpi` | Define outcome KPIs |
| POST | `/outcomes/measurement` | Create measurement framework |
| GET | `/outcomes/scorecard` | Get outcomes scorecard |
| POST | `/onboarding/plan` | Generate onboarding plan |
| POST | `/onboarding/welcome` | Generate welcome package |
| POST | `/persona/session` | Start persona simulation |
| POST | `/persona/chat` | Chat in persona simulation |
| GET | `/persona/session/{session_id}` | Get persona session |
| POST | `/persona/score/{session_id}` | Score persona session |
| POST | `/retention/client` | Create retention record |
| PUT | `/retention/client/{client_id}/metrics` | Update retention metrics |
| GET | `/retention/client/{client_id}/health` | Get client health |
| GET | `/retention/clients` | List all retention clients |
| GET | `/retention/client/{client_id}/renewal-cadence` | Get renewal cadence |
| POST | `/decision-room/deal` | Create deal in decision room |

### Billing (`/api/v1/billing`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/customers` | Create Stripe customer |
| POST | `/subscriptions` | Create subscription |
| DELETE | `/subscriptions/{subscription_id}` | Cancel subscription |
| POST | `/invoices` | Create invoice |
| GET | `/invoices` | List invoices |
| GET | `/revenue` | Get revenue dashboard |
| POST | `/referrals` | Create referral |
| GET | `/referrals` | List referrals |
| PUT | `/referrals/{referral_id}/paid` | Mark referral as paid |

---

## Layer: Command & Lifecycle

### Command AI (`/api/v1/command`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/next-action` | Get AI-recommended next action |
| GET | `/dashboard` | Get command dashboard |
| GET | `/opportunities` | Get prioritized opportunities |
| GET | `/daily-brief` | Get daily briefing |
| GET | `/agent-status` | Get AI agent status |

### Lifecycle (`/api/v1/lifecycle`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/intel-brief/{client_id}` | Generate client intel brief |
| POST | `/health/score` | Calculate health score |
| GET | `/health/{client_id}` | Get client health |
| GET | `/health/trend/{client_id}` | Get health trend |
| POST | `/brand/name` | Generate brand name |
| POST | `/brand/positioning` | Generate brand positioning |
| GET | `/alumni` | List alumni clients |
| POST | `/alumni/{client_id}` | Move client to alumni |
| POST | `/alumni/{client_id}/touchpoint` | Record alumni touchpoint |
| GET | `/alumni/{client_id}/reentry` | Get re-entry likelihood |
| GET | `/moat/competitors/{pain_category}` | Competitive analysis |
| POST | `/moat/pricing-check` | Check pricing vs market |
| POST | `/sunset/transition-plan` | Generate sunset transition |
| GET | `/trainer/curriculum/{role}` | Get training curriculum |
| POST | `/trainer/progress` | Update training progress |
| POST | `/scenario` | Run scenario simulation |
| GET | `/mobile/brief/{client_id}` | Get mobile-friendly brief |
| GET | `/mobile/approvals` | Get pending approvals |
| GET | `/mobile/alerts` | Get active alerts |

---

## Layer: Trust & Compliance

### Compliance (`/api/v1/compliance`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/consent` | Record consent |
| POST | `/consent/{consent_id}/revoke` | Revoke consent |
| GET | `/consent/client/{client_id}` | Get client consents |
| GET | `/consent/check/{client_id}/{consent_type}` | Check specific consent |
| GET | `/consent/deletion-candidates` | Get deletion candidates |
| POST | `/explainability` | Explain AI decision |
| GET | `/quality/sla/{offer_id}` | Get SLA metrics |
| GET | `/quality/onboarding/{client_id}` | Get onboarding quality |
| GET | `/quality/retention-risks` | Get retention risks |
| POST | `/comms/message` | Send compliant message |
| GET | `/comms/messages` | List messages |
| GET | `/comms/audit-trail` | Get audit trail |
| GET | `/benchmarks/{pain_category}` | Get compliance benchmarks |
| POST | `/benchmarks` | Create benchmark |

### Security (`/api/v1/security`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/deletion-request` | Request data deletion |
| POST | `/deletion-request/{request_id}/execute` | Execute deletion |
| GET | `/deletion-requests` | List deletion requests |
| POST | `/legal-hold` | Create legal hold |
| GET | `/legal-holds` | List legal holds |
| POST | `/legal-hold/{hold_id}/release` | Release legal hold |
| POST | `/check-output` | Check output for PII/compliance |

---

## Layer: Polish & Content

### Polish (`/api/v1/polish`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/versions` | Create template version |
| GET | `/versions/{template_id}` | Get template versions |
| POST | `/versions/{template_id}/rollback/{version}` | Rollback template |
| POST | `/versions/diff` | Diff two versions |
| POST | `/crisis` | Create crisis incident |
| GET | `/crisis` | List crisis incidents |
| GET | `/crisis/{incident_id}` | Get crisis incident |
| POST | `/crisis/{incident_id}/timeline` | Add timeline entry |
| POST | `/crisis/{incident_id}/escalation` | Escalate crisis |
| POST | `/crisis/{incident_id}/lockdown` | Trigger lockdown |
| POST | `/crisis/{incident_id}/resolve` | Resolve crisis |
| POST | `/compose` | AI content composition |
| POST | `/compose/pricing` | Compose pricing content |
| POST | `/red-team` | Red-team content |

---

## Layer: Playbooks

### Playbooks (`/api/v1/playbooks`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all playbooks |
| GET | `/{slug}` | Get playbook by slug |
| POST | `/{slug}/activate` | Activate playbook for workspace |
| PUT | `/activations/{activation_id}/customize` | Customize activation |
| GET | `/activations/{activation_id}/progress` | Get activation progress |
| PUT | `/activations/{activation_id}/sections/{section_name}` | Update section |
| GET | `/activations/{activation_id}/export` | Export activation |

---

## Integrations

### VoiceForge (`/api/v1/voiceforge`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/persona-sim/start` | Start voice persona simulation |
| POST | `/persona-sim/{session_id}/message` | Send message in session |
| POST | `/persona-sim/{session_id}/end` | End persona session |
| POST | `/intel-brief/audio` | Generate audio intel brief |
| POST | `/crisis/escalate` | Voice crisis escalation |
| GET | `/crisis/{escalation_id}/status` | Get escalation status |
| POST | `/health/analyze/{call_id}` | Analyze call health |
| GET | `/health/trends/{client_id}` | Get voice health trends |
| POST | `/trainer/start` | Start voice training session |
| POST | `/trainer/{session_id}/assess` | Assess training session |

### VisionAudioForge (`/api/v1/visionaudio`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/delivery/quarterly-report` | Generate quarterly report |
| POST | `/delivery/kpi-dashboard` | Generate KPI dashboard |
| POST | `/proof/scorecard` | Generate proof scorecard |
| POST | `/proof/walkthrough` | Generate proof walkthrough |
| POST | `/trust-pack/render` | Render trust pack |
| POST | `/trust-pack/credibility-deck` | Generate credibility deck |
| POST | `/brand/identity` | Generate brand identity |
| POST | `/brand/templates` | Generate brand templates |
| POST | `/gtm/video-ad` | Generate video ad |
| POST | `/gtm/landing` | Generate landing page |
| POST | `/authority/clip` | Generate authority clip |
| POST | `/authority/data-story` | Generate data story |
| POST | `/trainer/video` | Generate training video |
| GET | `/trainer/progress/{trainee_id}` | Get trainee progress |
| GET | `/render/{render_id}/status` | Get render status |

---

## Platform Services

### Search (`/api/v1/search`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Global search across entities |
| POST | `/reindex/{index_name}` | Reindex an Elasticsearch index |
| GET | `/health` | Search service health |

### Notifications (`/api/v1/notifications`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List notifications |
| GET | `/unread` | List unread notifications |
| GET | `/count` | Get unread count |
| PUT | `/{notification_id}/read` | Mark as read |
| PUT | `/read-all` | Mark all as read |
| DELETE | `/old` | Clean up old notifications |

### Email (`/api/v1/email`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/send` | Send email |
| POST | `/send-template` | Send templated email |
| GET | `/templates` | List email templates |
| GET | `/history` | Get email history |

### Storage (`/api/v1/storage`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/upload` | Upload file to S3 |
| GET | `/files` | List files |
| GET | `/files/{doc_id}/download` | Download file |
| DELETE | `/files/{doc_id}` | Delete file |

### Exports (`/api/v1/exports`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/offer/{offer_id}` | Export offer as PDF |
| POST | `/trust-pack/{trust_pack_id}` | Export trust pack |
| POST | `/intel-brief/{brief_id}` | Export intel brief |

### Jobs (`/api/v1/jobs`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/status` | Get job queue status |
| POST | `/trigger/{task_name}` | Trigger background task |
| GET | `/history` | Get job history |
| GET | `/result/{task_id}` | Get job result |

### Health (`/api/v1/health`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Full health check |
| GET | `/ready` | Readiness probe |
| GET | `/live` | Liveness probe |

### Metrics (`/api/v1/metrics`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Prometheus-format metrics |

---

## Platform Primitives

### Primitives (`/api/v1/primitives`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/entitlements/check-feature` | Check feature entitlement |
| GET | `/entitlements/plan/{plan}` | Get plan entitlements |
| POST | `/entitlements/check-flag` | Check feature flag |
| GET | `/eval-lab/{agent_name}/history` | Get eval history |
| GET | `/eval-lab/{agent_name}/active` | Get active eval |
| POST | `/eval-lab/{agent_name}/regression` | Run regression test |
| POST | `/rules/process-event` | Process automation event |
| GET | `/rules/{workspace_id}` | Get automation rules |
| GET | `/records/{workspace_id}/holds` | Get legal holds |
| GET | `/records/{workspace_id}/retention` | Get retention policies |
| GET | `/trust-center/overview` | Trust center overview |
| GET | `/trust-center/uptime` | Trust center uptime |
| GET | `/sandbox/{workspace_id}` | Get sandbox state |
| POST | `/runtime/track` | Track AI runtime usage |
| GET | `/runtime/{workspace_id}/dashboard` | AI runtime dashboard |
| POST | `/runtime/budget-check` | Check AI budget |
| GET | `/runtime/{workspace_id}/agent/{agent_name}` | Get agent runtime |

### Admin (`/api/v1/admin`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/prompts/register` | Register prompt version |
| POST | `/prompts/rollback` | Rollback prompt version |
| POST | `/prompts/save-results` | Save prompt eval results |
| POST | `/flags/set` | Set feature flag |
| POST | `/rules/create` | Create automation rule |
| GET | `/rules/{rule_id}/log` | Get rule execution log |
| POST | `/records/retention` | Set retention policy |
| POST | `/records/legal-hold` | Create legal hold |
| POST | `/records/legal-hold/release` | Release legal hold |
| POST | `/sandbox/create` | Create sandbox |
| POST | `/sandbox/{sandbox_id}/reset` | Reset sandbox |
| POST | `/sandbox/{sandbox_id}/load-data` | Load sandbox data |

---

## Webhooks

### Stripe (`/api/v1/webhooks`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/stripe` | Stripe webhook handler |

---

**Total: 31 routers, 200+ endpoints**
