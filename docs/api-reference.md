# ChamberForge API Reference

Base URL: `http://localhost:8000` (development) | `https://api.chamberforge.com` (production)

Interactive docs: `/api/docs` (Swagger) | `/api/redoc` (ReDoc)

All endpoints require `Authorization: Bearer <token>` unless noted otherwise.

**Rate Limiting**: Default 100 requests per 60 seconds per IP per endpoint. Exceeding the limit returns `429 Too Many Requests` with a `Retry-After` header.

---

## Root Health

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| GET | `/api/health` | None | Default | Root health check |

**Response:**
```json
{ "status": "healthy", "version": "0.1.0" }
```

---

## Auth (`/api/v1/auth`)

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| POST | `/register` | None | 10/60s | Register a new user |
| POST | `/login` | None | 20/60s | Authenticate and get tokens |
| POST | `/refresh` | None | 20/60s | Refresh access token |
| GET | `/me` | Bearer | Default | Get current user profile |
| POST | `/logout` | Bearer | Default | Invalidate current session |

### POST `/api/v1/auth/register`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "SecureP@ss123",
  "full_name": "Jane Smith",
  "workspace_name": "Smith Family Office"
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@example.com",
  "full_name": "Jane Smith",
  "role": "admin",
  "workspace_id": "660e8400-e29b-41d4-a716-446655440000",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST `/api/v1/auth/login`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com",
    "full_name": "Jane Smith",
    "role": "admin"
  }
}
```

---

## Users (`/api/v1/users`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Bearer | admin | List all users in workspace |
| GET | `/{user_id}` | Bearer | admin, operator | Get user by ID |
| PUT | `/{user_id}` | Bearer | admin | Update user |
| DELETE | `/{user_id}` | Bearer | admin | Delete user |

---

## Workspaces (`/api/v1/workspaces`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/current` | Bearer | Any | Get current workspace |
| PUT | `/current` | Bearer | admin | Update workspace settings |

---

## Profile (`/api/v1/profile`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Bearer | Any | Get own profile |
| PUT | `/` | Bearer | Any | Update own profile |

---

## Workspace Settings (`/api/v1/workspace-settings`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Bearer | admin | Get workspace settings |
| PUT | `/` | Bearer | admin | Update workspace settings |

---

## Layer: Discover

### Problems (`/api/v1/problems`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/trending` | Bearer | Any | Get trending problems |
| GET | `/` | Bearer | Any | List problems (paginated, filterable) |
| POST | `/` | Bearer | admin, operator | Create a new problem |
| GET | `/{problem_id}` | Bearer | Any | Get problem by ID |
| PUT | `/{problem_id}` | Bearer | admin, operator | Update problem |
| DELETE | `/{problem_id}` | Bearer | admin | Delete problem |

### POST `/api/v1/problems`

**Request:**
```json
{
  "title": "Estate planning coordination failure across jurisdictions",
  "description": "UHNW families with multi-state/multi-country assets face...",
  "pain_category": "estate_planning",
  "severity": "high",
  "source": "client_interview",
  "lifecycle_stage": "validated"
}
```

**Response (201):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "title": "Estate planning coordination failure across jurisdictions",
  "pain_category": "estate_planning",
  "severity": "high",
  "ai_score": null,
  "lifecycle_stage": "validated",
  "workspace_id": "660e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-04-03T10:00:00Z"
}
```

### Discovery (`/api/v1/discovery`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/scan` | Bearer | admin, operator | AI-powered problem scanning |
| GET | `/lifecycle-distribution` | Bearer | Any | Get lifecycle stage distribution |
| GET | `/opportunities` | Bearer | Any | Get high-priority opportunities |

### Evidence (`/api/v1/evidence`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/analyst-queue` | Bearer | Any | Evidence items needing review |
| GET | `/` | Bearer | Any | List all evidence |
| POST | `/` | Bearer | admin, operator | Create evidence record |
| GET | `/{evidence_id}` | Bearer | Any | Get evidence by ID |
| PUT | `/{evidence_id}` | Bearer | admin, operator | Update evidence |
| DELETE | `/{evidence_id}` | Bearer | admin | Delete evidence |
| POST | `/{evidence_id}/link/{problem_id}` | Bearer | admin, operator | Link evidence to problem |
| POST | `/ingest` | Bearer | admin, operator | AI-powered evidence ingestion |
| POST | `/recalculate-decay` | Bearer | admin | Recalculate recency decay scores |

---

## Layer: Qualify

### Qualify (`/api/v1/qualify`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/validate/{problem_id}` | Bearer | admin, operator | Validate problem quality |
| POST | `/buyer-profile` | Bearer | admin, operator | Generate buyer profile |
| POST | `/competitive-intel` | Bearer | admin, operator | Generate competitive intelligence |
| POST | `/feasibility` | Bearer | admin, operator | Feasibility assessment |
| POST | `/guardrails-check` | Bearer | admin, operator | Check regulatory guardrails |
| GET | `/geo-rules/{country_code}` | Bearer | Any | Get geo-specific rules |
| POST | `/geo-compliance` | Bearer | admin, operator | Check geo compliance |
| GET | `/risk-queue` | Bearer | admin, operator | Get items in risk review queue |
| POST | `/risk-queue/{item_id}/approve` | Bearer | admin | Approve risk queue item |
| POST | `/risk-queue/{item_id}/reject` | Bearer | admin | Reject risk queue item |
| POST | `/risk-queue/{item_id}/escalate` | Bearer | admin, operator | Escalate risk queue item |
| POST | `/founder-readiness` | Bearer | admin, operator | Assess founder readiness |

### POST `/api/v1/qualify/guardrails-check`

**Request:**
```json
{
  "content": "We will serve as your family's primary tax advisor...",
  "content_type": "offer_copy",
  "target_jurisdiction": "US"
}
```

**Response (200):**
```json
{
  "passed": false,
  "violations": [
    {
      "rule": "no_licensed_professional_positioning",
      "severity": "critical",
      "message": "Content implies licensed tax advisory role. Reframe as coordination/management.",
      "suggestion": "Replace 'primary tax advisor' with 'tax coordination service that works with your CPA'"
    }
  ]
}
```

---

## Layer: Build

### Offers (`/api/v1/offers`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Bearer | Any | List offers |
| POST | `/` | Bearer | admin, operator | Create offer |
| GET | `/{offer_id}` | Bearer | Any | Get offer by ID |
| PUT | `/{offer_id}` | Bearer | admin, operator | Update offer |
| DELETE | `/{offer_id}` | Bearer | admin | Delete offer |
| POST | `/generate` | Bearer | admin, operator | AI-generate offer from problem |
| POST | `/{offer_id}/refine` | Bearer | admin, operator | Refine offer with AI |
| POST | `/{offer_id}/pricing` | Bearer | admin, operator | Generate pricing model |
| POST | `/simulate-margins` | Bearer | admin, operator | Simulate profit margins |
| GET | `/benchmarks/{pain_category}` | Bearer | Any | Get category benchmarks |
| POST | `/{offer_id}/sops` | Bearer | admin, operator | Generate SOPs for offer |
| POST | `/{offer_id}/journey` | Bearer | admin, operator | Generate client journey map |

### POST `/api/v1/offers/generate`

**Request:**
```json
{
  "problem_id": "770e8400-e29b-41d4-a716-446655440000",
  "playbook_slug": "private-ops-office",
  "target_price_range": { "min": 15000, "max": 30000 }
}
```

**Response (200):**
```json
{
  "offer": {
    "name": "Executive Operations Command Center",
    "tagline": "From chaos to control — your household runs like a company",
    "deliverables": ["..."],
    "pricing_model": { "type": "monthly_retainer", "base": 18000 },
    "sop_count": 12,
    "estimated_margin": 0.72
  },
  "agent": "offer_ai",
  "tokens_used": 2847
}
```

### Build (`/api/v1/build`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/fulfillment/sop-bundle` | Bearer | admin, operator | Generate SOP bundle |
| POST | `/fulfillment/blueprint` | Bearer | admin, operator | Generate fulfillment blueprint |
| POST | `/proof/kpi-stack` | Bearer | admin, operator | Generate KPI stack |
| POST | `/proof/roi` | Bearer | admin, operator | Generate ROI analysis |
| POST | `/proof/case-study` | Bearer | admin, operator | Generate case study |
| POST | `/deal-desk/proposal` | Bearer | admin, operator | Generate proposal |
| POST | `/deal-desk/sow` | Bearer | admin, operator | Generate statement of work |
| POST | `/deal-desk/nda` | Bearer | admin, operator | Generate NDA |
| POST | `/trust-pack` | Bearer | admin, operator | Generate trust pack |
| POST | `/wedge-entry` | Bearer | admin, operator | Generate wedge entry strategy |

### Household (`/api/v1/household`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/{client_id}` | Bearer | admin, operator | Create household graph |
| GET | `/{client_id}` | Bearer | Any | Get household graph |
| PUT | `/{client_id}` | Bearer | admin, operator | Update household graph |
| POST | `/{client_id}/members` | Bearer | admin, operator | Add household member |
| POST | `/{client_id}/properties` | Bearer | admin, operator | Add property |
| POST | `/{client_id}/staff` | Bearer | admin, operator | Add staff member |
| POST | `/{client_id}/vendors` | Bearer | admin, operator | Add vendor |
| GET | `/{client_id}/risks` | Bearer | Any | Get risk exposures |

---

## Layer: Sell

### Sell (`/api/v1/sell`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/copy/positioning` | Bearer | admin, operator | Generate positioning copy |
| POST | `/copy/outreach` | Bearer | admin, operator | Generate outreach copy |
| POST | `/copy/authority-content` | Bearer | admin, operator | Generate authority content |
| POST | `/relationships/gatekeepers` | Bearer | admin, operator | Map gatekeeper relationships |
| POST | `/relationships/referral-paths` | Bearer | admin, operator | Map referral paths |
| POST | `/relationships/trust-scores` | Bearer | admin, operator | Calculate trust scores |
| POST | `/marketing/dream-100` | Bearer | admin, operator | Generate Dream 100 list |
| POST | `/revenue/project` | Bearer | admin, operator | Project revenue |
| GET | `/partners/ecosystem/{pain_category}` | Bearer | Any | Get ecosystem partners |
| GET | `/trust-network/{deal_id}` | Bearer | Any | Get trust network for deal |
| POST | `/gtm/headline-test` | Bearer | admin, operator | Test GTM headlines |
| POST | `/gtm/price-anchoring` | Bearer | admin, operator | Generate price anchoring |
| POST | `/authority/content-plan` | Bearer | admin, operator | Generate authority content plan |
| POST | `/outcomes/kpi` | Bearer | admin, operator | Define outcome KPIs |
| POST | `/outcomes/measurement` | Bearer | admin, operator | Create measurement framework |
| GET | `/outcomes/scorecard` | Bearer | Any | Get outcomes scorecard |
| POST | `/onboarding/plan` | Bearer | admin, operator | Generate onboarding plan |
| POST | `/onboarding/welcome` | Bearer | admin, operator | Generate welcome package |
| POST | `/persona/session` | Bearer | admin, operator | Start persona simulation |
| POST | `/persona/chat` | Bearer | admin, operator | Chat in persona simulation |
| GET | `/persona/session/{session_id}` | Bearer | Any | Get persona session |
| POST | `/persona/score/{session_id}` | Bearer | admin, operator | Score persona session |
| POST | `/retention/client` | Bearer | admin, operator | Create retention record |
| PUT | `/retention/client/{client_id}/metrics` | Bearer | admin, operator | Update retention metrics |
| GET | `/retention/client/{client_id}/health` | Bearer | Any | Get client health |
| GET | `/retention/clients` | Bearer | Any | List all retention clients |
| GET | `/retention/client/{client_id}/renewal-cadence` | Bearer | Any | Get renewal cadence |
| POST | `/decision-room/deal` | Bearer | admin, operator | Create deal in decision room |

### Billing (`/api/v1/billing`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/customers` | Bearer | admin | Create Stripe customer |
| POST | `/subscriptions` | Bearer | admin | Create subscription |
| DELETE | `/subscriptions/{subscription_id}` | Bearer | admin | Cancel subscription |
| POST | `/invoices` | Bearer | admin | Create invoice |
| GET | `/invoices` | Bearer | admin, operator | List invoices |
| GET | `/revenue` | Bearer | admin | Get revenue dashboard |
| POST | `/referrals` | Bearer | admin, operator | Create referral |
| GET | `/referrals` | Bearer | admin, operator | List referrals |
| PUT | `/referrals/{referral_id}/paid` | Bearer | admin | Mark referral as paid |

---

## Layer: Command & Lifecycle

### Command AI (`/api/v1/command`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/next-action` | Bearer | Any | Get AI-recommended next action |
| GET | `/dashboard` | Bearer | Any | Get command dashboard |
| GET | `/opportunities` | Bearer | Any | Get prioritized opportunities |
| GET | `/daily-brief` | Bearer | Any | Get daily briefing |
| GET | `/agent-status` | Bearer | admin | Get AI agent status |

### GET `/api/v1/command/next-action`

**Response (200):**
```json
{
  "action": "Follow up on proposal for Smith Family Office",
  "priority": "high",
  "reasoning": "Proposal sent 5 days ago, no response. Trust score trending down.",
  "related_entities": {
    "deal_id": "880e8400-e29b-41d4-a716-446655440000",
    "client_id": "990e8400-e29b-41d4-a716-446655440000"
  },
  "suggested_playbook": "private-ops-office",
  "agent": "command_ai"
}
```

### Lifecycle (`/api/v1/lifecycle`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/intel-brief/{client_id}` | Bearer | admin, operator | Generate client intel brief |
| POST | `/health/score` | Bearer | admin, operator | Calculate health score |
| GET | `/health/{client_id}` | Bearer | Any | Get client health |
| GET | `/health/trend/{client_id}` | Bearer | Any | Get health trend |
| POST | `/brand/name` | Bearer | admin, operator | Generate brand name |
| POST | `/brand/positioning` | Bearer | admin, operator | Generate brand positioning |
| GET | `/alumni` | Bearer | Any | List alumni clients |
| POST | `/alumni/{client_id}` | Bearer | admin, operator | Move client to alumni |
| POST | `/alumni/{client_id}/touchpoint` | Bearer | admin, operator | Record alumni touchpoint |
| GET | `/alumni/{client_id}/reentry` | Bearer | Any | Get re-entry likelihood |
| GET | `/moat/competitors/{pain_category}` | Bearer | Any | Competitive analysis |
| POST | `/moat/pricing-check` | Bearer | admin, operator | Check pricing vs market |
| POST | `/sunset/transition-plan` | Bearer | admin, operator | Generate sunset transition |
| GET | `/trainer/curriculum/{role}` | Bearer | Any | Get training curriculum |
| POST | `/trainer/progress` | Bearer | admin, operator | Update training progress |
| POST | `/scenario` | Bearer | admin, operator | Run scenario simulation |
| GET | `/mobile/brief/{client_id}` | Bearer | Any | Get mobile-friendly brief |
| GET | `/mobile/approvals` | Bearer | Any | Get pending approvals |
| GET | `/mobile/alerts` | Bearer | Any | Get active alerts |

---

## Layer: Trust & Compliance

### Compliance (`/api/v1/compliance`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/consent` | Bearer | admin, operator | Record consent |
| POST | `/consent/{consent_id}/revoke` | Bearer | admin | Revoke consent |
| GET | `/consent/client/{client_id}` | Bearer | admin, operator | Get client consents |
| GET | `/consent/check/{client_id}/{consent_type}` | Bearer | Any | Check specific consent |
| GET | `/consent/deletion-candidates` | Bearer | admin | Get deletion candidates |
| POST | `/explainability` | Bearer | admin, operator | Explain AI decision |
| GET | `/quality/sla/{offer_id}` | Bearer | Any | Get SLA metrics |
| GET | `/quality/onboarding/{client_id}` | Bearer | Any | Get onboarding quality |
| GET | `/quality/retention-risks` | Bearer | Any | Get retention risks |
| POST | `/comms/message` | Bearer | admin, operator | Send compliant message |
| GET | `/comms/messages` | Bearer | Any | List messages |
| GET | `/comms/audit-trail` | Bearer | admin | Get audit trail |
| GET | `/benchmarks/{pain_category}` | Bearer | Any | Get compliance benchmarks |
| POST | `/benchmarks` | Bearer | admin | Create benchmark |

### Security (`/api/v1/security`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/deletion-request` | Bearer | admin | Request data deletion |
| POST | `/deletion-request/{request_id}/execute` | Bearer | admin | Execute deletion |
| GET | `/deletion-requests` | Bearer | admin | List deletion requests |
| POST | `/legal-hold` | Bearer | admin | Create legal hold |
| GET | `/legal-holds` | Bearer | admin | List legal holds |
| POST | `/legal-hold/{hold_id}/release` | Bearer | admin | Release legal hold |
| POST | `/check-output` | Bearer | admin, operator | Check output for PII/compliance |

---

## Layer: Polish & Content

### Polish (`/api/v1/polish`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/versions` | Bearer | admin, operator | Create template version |
| GET | `/versions/{template_id}` | Bearer | Any | Get template versions |
| POST | `/versions/{template_id}/rollback/{version}` | Bearer | admin | Rollback template |
| POST | `/versions/diff` | Bearer | Any | Diff two versions |
| POST | `/crisis` | Bearer | admin, operator | Create crisis incident |
| GET | `/crisis` | Bearer | Any | List crisis incidents |
| GET | `/crisis/{incident_id}` | Bearer | Any | Get crisis incident |
| POST | `/crisis/{incident_id}/timeline` | Bearer | admin, operator | Add timeline entry |
| POST | `/crisis/{incident_id}/escalation` | Bearer | admin | Escalate crisis |
| POST | `/crisis/{incident_id}/lockdown` | Bearer | admin | Trigger lockdown |
| POST | `/crisis/{incident_id}/resolve` | Bearer | admin | Resolve crisis |
| POST | `/compose` | Bearer | admin, operator | AI content composition |
| POST | `/compose/pricing` | Bearer | admin, operator | Compose pricing content |
| POST | `/red-team` | Bearer | admin, operator | Red-team content |

---

## Layer: Playbooks

### Playbooks (`/api/v1/playbooks`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Bearer | Any | List all 10 playbooks |
| GET | `/{slug}` | Bearer | Any | Get playbook by slug |
| POST | `/{slug}/activate` | Bearer | admin | Activate playbook for workspace |
| PUT | `/activations/{activation_id}/customize` | Bearer | admin, operator | Customize activation |
| GET | `/activations/{activation_id}/progress` | Bearer | Any | Get activation progress |
| PUT | `/activations/{activation_id}/sections/{section_name}` | Bearer | admin, operator | Update section |
| GET | `/activations/{activation_id}/export` | Bearer | Any | Export activation |

---

## Integrations

### VoiceForge (`/api/v1/voiceforge`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/persona-sim/start` | Bearer | admin, operator | Start voice persona simulation |
| POST | `/persona-sim/{session_id}/message` | Bearer | admin, operator | Send message in session |
| POST | `/persona-sim/{session_id}/end` | Bearer | admin, operator | End persona session |
| POST | `/intel-brief/audio` | Bearer | admin, operator | Generate audio intel brief |
| POST | `/crisis/escalate` | Bearer | admin | Voice crisis escalation |
| GET | `/crisis/{escalation_id}/status` | Bearer | Any | Get escalation status |
| POST | `/health/analyze/{call_id}` | Bearer | admin, operator | Analyze call health |
| GET | `/health/trends/{client_id}` | Bearer | Any | Get voice health trends |
| POST | `/trainer/start` | Bearer | admin, operator | Start voice training session |
| POST | `/trainer/{session_id}/assess` | Bearer | admin, operator | Assess training session |

### VisionAudioForge (`/api/v1/visionaudio`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/delivery/quarterly-report` | Bearer | admin, operator | Generate quarterly report |
| POST | `/delivery/kpi-dashboard` | Bearer | admin, operator | Generate KPI dashboard |
| POST | `/proof/scorecard` | Bearer | admin, operator | Generate proof scorecard |
| POST | `/proof/walkthrough` | Bearer | admin, operator | Generate proof walkthrough |
| POST | `/trust-pack/render` | Bearer | admin, operator | Render trust pack |
| POST | `/trust-pack/credibility-deck` | Bearer | admin, operator | Generate credibility deck |
| POST | `/brand/identity` | Bearer | admin, operator | Generate brand identity |
| POST | `/brand/templates` | Bearer | admin, operator | Generate brand templates |
| POST | `/gtm/video-ad` | Bearer | admin, operator | Generate video ad |
| POST | `/gtm/landing` | Bearer | admin, operator | Generate landing page |
| POST | `/authority/clip` | Bearer | admin, operator | Generate authority clip |
| POST | `/authority/data-story` | Bearer | admin, operator | Generate data story |
| POST | `/trainer/video` | Bearer | admin, operator | Generate training video |
| GET | `/trainer/progress/{trainee_id}` | Bearer | Any | Get trainee progress |
| GET | `/render/{render_id}/status` | Bearer | Any | Get render status |

---

## Platform Services

### Search (`/api/v1/search`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Bearer | Any | Global search across entities |
| POST | `/reindex/{index_name}` | Bearer | admin | Reindex an Elasticsearch index |
| GET | `/health` | Bearer | admin | Search service health |

### GET `/api/v1/search?q=estate+planning&type=problems&limit=10`

**Response (200):**
```json
{
  "results": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "type": "problem",
      "title": "Estate planning coordination failure",
      "score": 0.92,
      "highlight": "...multi-jurisdiction <em>estate planning</em> challenges..."
    }
  ],
  "total": 1,
  "query": "estate planning",
  "took_ms": 12
}
```

### Notifications (`/api/v1/notifications`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Bearer | Any | List notifications |
| GET | `/unread` | Bearer | Any | List unread notifications |
| GET | `/count` | Bearer | Any | Get unread count |
| PUT | `/{notification_id}/read` | Bearer | Any | Mark as read |
| PUT | `/read-all` | Bearer | Any | Mark all as read |
| DELETE | `/old` | Bearer | Any | Clean up old notifications |

### Email (`/api/v1/email`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/send` | Bearer | admin, operator | Send email |
| POST | `/send-template` | Bearer | admin, operator | Send templated email |
| GET | `/templates` | Bearer | Any | List email templates |
| GET | `/history` | Bearer | admin | Get email history |

### Storage (`/api/v1/storage`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/upload` | Bearer | admin, operator | Upload file to S3 |
| GET | `/files` | Bearer | Any | List files |
| GET | `/files/{doc_id}/download` | Bearer | Any | Download file |
| DELETE | `/files/{doc_id}` | Bearer | admin | Delete file |

### Exports (`/api/v1/exports`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/offer/{offer_id}` | Bearer | admin, operator | Export offer as PDF |
| POST | `/trust-pack/{trust_pack_id}` | Bearer | admin, operator | Export trust pack |
| POST | `/intel-brief/{brief_id}` | Bearer | admin, operator | Export intel brief |

### Jobs (`/api/v1/jobs`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/status` | Bearer | admin | Get job queue status |
| POST | `/trigger/{task_name}` | Bearer | admin | Trigger background task |
| GET | `/history` | Bearer | admin | Get job history |
| GET | `/result/{task_id}` | Bearer | admin | Get job result |

### Health (`/api/v1/health`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Bearer | admin | Full health check (DB, Redis, ES) |
| GET | `/ready` | None | - | Readiness probe (Kubernetes) |
| GET | `/live` | None | - | Liveness probe (Kubernetes) |

### Metrics (`/api/v1/metrics`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | None | - | Prometheus-format metrics |

### Audit (`/api/v1/audit`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Bearer | admin | Query audit logs (filterable by date, user, resource) |

---

## Platform Primitives

### Primitives (`/api/v1/primitives`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/entitlements/check-feature` | Bearer | Any | Check feature entitlement |
| GET | `/entitlements/plan/{plan}` | Bearer | Any | Get plan entitlements |
| POST | `/entitlements/check-flag` | Bearer | Any | Check feature flag |
| GET | `/eval-lab/{agent_name}/history` | Bearer | admin | Get eval history |
| GET | `/eval-lab/{agent_name}/active` | Bearer | admin | Get active eval |
| POST | `/eval-lab/{agent_name}/regression` | Bearer | admin | Run regression test |
| POST | `/rules/process-event` | Bearer | admin, operator | Process automation event |
| GET | `/rules/{workspace_id}` | Bearer | admin | Get automation rules |
| GET | `/records/{workspace_id}/holds` | Bearer | admin | Get legal holds |
| GET | `/records/{workspace_id}/retention` | Bearer | admin | Get retention policies |
| GET | `/trust-center/overview` | Bearer | Any | Trust center overview |
| GET | `/trust-center/uptime` | Bearer | Any | Trust center uptime |
| GET | `/sandbox/{workspace_id}` | Bearer | admin | Get sandbox state |
| POST | `/runtime/track` | Bearer | admin, operator | Track AI runtime usage |
| GET | `/runtime/{workspace_id}/dashboard` | Bearer | admin | AI runtime dashboard |
| POST | `/runtime/budget-check` | Bearer | admin | Check AI budget |
| GET | `/runtime/{workspace_id}/agent/{agent_name}` | Bearer | admin | Get agent runtime |

### Admin (`/api/v1/admin`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/prompts/register` | Bearer | admin | Register prompt version |
| POST | `/prompts/rollback` | Bearer | admin | Rollback prompt version |
| POST | `/prompts/save-results` | Bearer | admin | Save prompt eval results |
| POST | `/flags/set` | Bearer | admin | Set feature flag |
| POST | `/rules/create` | Bearer | admin | Create automation rule |
| GET | `/rules/{rule_id}/log` | Bearer | admin | Get rule execution log |
| POST | `/records/retention` | Bearer | admin | Set retention policy |
| POST | `/records/legal-hold` | Bearer | admin | Create legal hold |
| POST | `/records/legal-hold/release` | Bearer | admin | Release legal hold |
| POST | `/sandbox/create` | Bearer | admin | Create sandbox |
| POST | `/sandbox/{sandbox_id}/reset` | Bearer | admin | Reset sandbox |
| POST | `/sandbox/{sandbox_id}/load-data` | Bearer | admin | Load sandbox data |

---

## Onboarding (`/api/v1/onboarding`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/progress` | Bearer | Any | Get onboarding progress |
| PUT | `/progress` | Bearer | Any | Update onboarding step |

---

## Client Portal (`/api/v1/portal`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/access` | Bearer | admin, operator | Create portal access token |
| GET | `/deliverables` | Portal Token | - | List client deliverables |
| GET | `/kpis` | Portal Token | - | Get client KPIs |
| GET | `/reports` | Portal Token | - | Get client reports |

---

## Webhooks

### Stripe (`/api/v1/webhooks`)

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| POST | `/stripe` | Stripe Signature | Excluded | Stripe webhook handler |

---

## Error Responses

All errors follow a consistent format:

```json
{
  "detail": "Human-readable error message"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request — invalid input |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — insufficient role |
| 404 | Not Found — resource does not exist |
| 409 | Conflict — duplicate or state conflict |
| 422 | Validation Error — Pydantic schema failure |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error |

---

**Total: 33 routers, 200+ endpoints**
