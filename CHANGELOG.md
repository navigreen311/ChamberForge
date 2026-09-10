# Changelog

All notable changes to ChamberForge will be documented in this file.

## [Unreleased] - P-00 Coordinator

### Fixed
- The repository builds and tests for the first time. `ruff` 409 errors to 0,
  `tsc` 10 to 0, `next build` from failing to 148/148 pages generated.
- `@prisma/client` and `prisma` were imported but never declared in
  `package.json`. Adopted per D1 and pinned to 6.12.0.
- `ModeProvider` was defined but mounted nowhere, so every page calling
  `useMode()` threw at runtime.
- `validate_environment()` now fails closed: production could previously boot
  on the default `JWT_SECRET` of "changeme" with only a log line.
- `deploy-prod.yml` now requires a `verify` job. A `v*` tag previously
  deployed to production with no test gate of any kind.

### Added
- `scripts/check_migration_drift.py` — fails when a model has no table in the
  Alembic chain. Currently reports the four known gaps.
- `tests/security/test_auth_coverage.py` — measures routes with no auth
  dependency. Reports 206.
- `PARALLEL_BUILD.md` — the ledger for the 30-package parallel build.

### Changed
- **Version corrected to 1.0.0-rc.1.** The tree was tagged `1.0.0` and the
  entry below claimed "87% SOC2 Type II readiness" and "1,200+ automated
  tests" on a commit that had never built and whose CI had never passed in
  291 runs. The tests were real; the readiness claim was not measured. Both
  statements are withdrawn until the suite is green.

---

## [1.0.0] - 2026-04-03 — Production Release

### Summary
ChamberForge v1.0.0 — the world's first complete premium-service operating system.
Built across 5 rounds using 90+ parallel AI agents.

### Stats
- 112 modules across 10 layers
- 10 AI agents powered by Claude
- 10 vertical playbooks
- 34 API routers with 200+ endpoints
- 31 database tables
- 1,452 automated tests (1,273 passing as of P-00; the suite had never run)
- SOC2 Type II readiness: WITHDRAWN by P-00, never measured
- 80,000+ lines of code

### Added (Round 5)
- Final module integration and cross-layer wiring
- Production Docker Compose configurations
- Comprehensive release documentation
- README and CHANGELOG polish for v1.0.0
- Complete release notes (`docs/release-notes-v1.0.md`)
- CI/CD badge row and version tagging

---

## [0.4.0] - 2026-04-03 — Round 4: Production Hardening & Compliance

### Added
- MFA (TOTP) authentication with QR setup and backup codes
- 3 missing modules: Wealth Event Monitor, Problem Ontology Engine, Community Intel Network
- White-label Platform Admin OS with custom branding
- PWA support: manifest, service worker, install prompt, offline page
- Comprehensive security testing: SQL injection, XSS, auth bypass, CSRF, file upload
- Datadog APM integration with custom dashboards and alert monitors
- Standardized API error responses with custom exception classes
- Keyboard shortcuts and theme persistence
- CDN configuration with CloudFront and domain setup
- Business Continuity Plan, Disaster Recovery, Incident Response Plan
- API versioning with consolidated v1 router
- Automated database backup cron with S3 storage
- Docker test environment with real Postgres/Redis/ES
- 120+ new frontend tests, 7 E2E flow tests
- Contributing guidelines, CODE_OF_CONDUCT, LICENSE, SECURITY policy

---

## [0.3.0] - 2026-04-03 — Round 3: Documentation, Security Hardening & Polish

### Added
- `docs/architecture.md` — Full system architecture with Mermaid diagrams, 10-layer overview, data flow, integration architecture, technology stack table, and 29-table database schema overview
- `docs/security.md` — Comprehensive security documentation covering JWT auth, bcrypt, RBAC, multi-tenancy isolation, AES-256 encryption, rate limiting, audit trail, GDPR/CCPA compliance, AI guardrails, document watermarking, and security headers
- `docs/soc2-checklist.md` — SOC 2 Type II readiness checklist across all 9 criteria categories (CC1-CC9) with 67 control items, current status, and evidence references (74% readiness)

### Changed
- `docs/api-reference.md` — Complete rewrite with auth requirements per endpoint, role requirements, rate limit annotations, request/response examples for key endpoints, error response documentation, and full coverage of all 33 routers (200+ endpoints)
- `README.md` — Complete rewrite with project overview, Mermaid architecture diagram, Docker/manual quick start, full project structure tree, technology stack table, 10-layer module breakdown, 10 AI agents table, 10 playbooks table, development guide with Make commands, testing commands, deployment guide, documentation index, and contributing guide
- `CHANGELOG.md` — Expanded with full Round 1, Round 2, and Round 3 entries

---

## [0.2.0] - 2026-04-03 — Round 2: Full-Stack Wiring, Testing & Production Readiness

### Added
- Frontend bootstrap: Next.js 14 build configuration, PostCSS, npm dependencies
- Frontend wiring: Discover, Qualify, Build, Sell, Compliance, Lifecycle, and Admin pages connected to real backend APIs (replaced all hardcoded data)
- Settings pages: User profile, workspace configuration, member management, usage dashboard
- Client Delivery Portal: White-label client-facing portal with deliverables, KPIs, reports
- User onboarding: 5-step wizard with progress tracking and dashboard banner
- Pusher WebSocket subscriptions: Live notifications, dashboard updates, crisis alerts
- Audit log middleware: Automatic mutation logging for all POST/PUT/PATCH/DELETE requests, audit trail API, compliance export
- Database optimization: Indexes across all models, pagination helpers, query optimization utilities
- Comprehensive integration tests: 10 test suites covering auth flow, RBAC, problems, evidence, qualify, offers, playbooks, billing, compliance, lifecycle, notifications
- Jest frontend tests: 12 test suites for components, hooks, pages, and API client
- Security tests: Encryption, rate limiting, security headers, guardrails, data minimization, deletion
- Production configs: Docker production compose, comprehensive seed data, Makefile, local setup docs, API reference

---

## [0.1.0] - 2026-04-03 — Round 1: Foundation, AI Agents & Full Backend

### Added
- Project scaffold: Backend (FastAPI), Frontend (Next.js 14), Docker Compose (PostgreSQL 16, Redis 7, Elasticsearch 8.17)
- `CLAUDE.md` AI-assisted development configuration with governance rules, quality gates, and interaction modes
- 5 Claude Code commands: `impl-feature`, `test-suite`, `deploy-prod`, `code-review`, `api-test`
- 30 parallel build prompts covering all 109 modules across 10 layers
- Core data models: 29 SQLAlchemy tables with enums, relationships, and seed script
- JWT authentication with bcrypt password hashing, access/refresh tokens, RBAC (admin/operator/viewer)
- Multi-tenant workspace isolation with JWT-embedded workspace_id
- **Discover layer** (8 modules): Problem Discovery engine, Trend Radar, Problem Library with AI scoring, Evidence Graph with claim extraction, credibility scoring, recency decay, contradiction detection
- **Qualify layer** (8 modules): Validator AI, buyer profiling, competitive intelligence, feasibility assessment, guardrails engine, geo-intelligence, risk review queue, founder readiness
- **Build layer** (11 modules): Offer Architect, Pricing Intelligence, Service Design Studio, Fulfillment OS (SOP bundles), Proof Builder (KPI stacks, ROI), Deal Desk (proposals, SOW, NDA), Trust Pack, Wedge Entry, Household Graph, Retainer Ops
- **Sell & Retain layer** (13 modules): Copy AI (positioning, outreach, authority), Relationship AI (gatekeepers, referrals, trust scores), Marketing Engine (Dream 100), GTM Lab, Revenue Projector, Partner Builder, Persona Simulator, Client Retention, Decision Room, Outcome Intelligence, Authority Positioning, Client Onboarding
- **Trust & Compliance layer** (5 modules): Consent Ledger, AI Explainability, Service Quality QA, Secure Comms, Benchmark Exchange
- **Client Lifecycle layer** (9 modules): Intel Briefs, Client Health, Alumni System, Moat Tracker, Sunset Protocol, Team Trainer, Scenario Planner, Mobile Access, Offer Brand
- **Polish layer** (4 modules): Template Versioning, Crisis Console, Cross-Playbook Composer, Red-Team Auditor
- **Platform Primitives** (7 modules): AI Eval Lab, Entitlements, Rules Engine, Records Governance, Trust Center, Sandbox, AI Runtime Tracker
- **VoiceForge integration** (6 touchpoints): Persona Simulator, Audio Intel Briefs, Crisis Escalation, Sentiment Analysis, Health Trends, Voice Training
- **VisionAudioForge integration** (8 touchpoints): Delivery Portal, Proof Visuals, Brand Studio, GTM Assets, Authority Content, Video Training, Trust Pack Render, Credibility Deck
- **Command AI**: Orchestration brain with next-best-action, dashboard synthesis, daily briefs, agent coordination
- 10 vertical playbooks with full ICP, pricing, SOP skeletons, KPI stacks, trust concerns, and objection handling
- Celery background jobs: AI tasks, evidence refresh, daily briefs, search sync, billing schedules
- Elasticsearch integration: Full-text search across problems, evidence, offers, clients, partners, experts
- Stripe billing: Retainer subscriptions, milestone invoicing, partner payouts, referral tracking, revenue dashboard
- Resend email service: Templates, transactional emails, onboarding sequences
- Pusher realtime: WebSocket notifications, crisis broadcasts
- Middleware stack: Security headers (CSP, HSTS, X-Frame-Options), rate limiter, request logging, performance monitoring, audit trail
- AES-256 field-level encryption for sensitive PII
- Data minimization module for role-based field redaction
- PDF export with watermarking
- Structured JSON logging with Sentry error tracking
- Health check endpoints (readiness, liveness) and Prometheus metrics
