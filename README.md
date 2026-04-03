# ChamberForge

> The world's first complete premium-service operating system for entrepreneurs and boutique firms serving HNW/UHNW individuals and families.

**109 Modules · 10 AI Agents · 10 Vertical Playbooks · 3 Integrated Platforms**

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | PostgreSQL + Prisma |
| Cache/Queue | Redis + Bull |
| AI Core | Anthropic Claude API (10 specialized agents) |
| Auth | NextAuth.js + JWT + RBAC |
| Storage | AWS S3 + CloudFront |
| Search | Elasticsearch |
| Realtime | Pusher / WebSockets |
| Payments | Stripe |
| Email | Resend |
| Deploy | AWS ECS + RDS + Docker |
| CI/CD | GitHub Actions |
| Monitoring | Datadog + Sentry |

## Quick Start

```bash
# Clone
git clone https://github.com/navigreen311/ChamberForge.git
cd ChamberForge

# Environment
cp .env.example .env
# Fill in your API keys

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Project Structure

```
ChamberForge/
├── frontend/          # Next.js 14 + TypeScript
│   └── src/
│       ├── app/       # App Router pages (dashboard, discover, qualify, build, sell, etc.)
│       ├── components/ # React components (ui, layout, modules)
│       ├── lib/       # Utilities, API client, constants
│       ├── hooks/     # Custom React hooks
│       └── types/     # TypeScript type definitions
├── backend/           # FastAPI Python
│   └── app/
│       ├── api/v1/    # REST endpoints
│       ├── core/      # Config, security, dependencies
│       ├── models/    # SQLAlchemy/Prisma models
│       ├── schemas/   # Pydantic schemas
│       ├── services/  # Business logic
│       │   ├── agents/    # 10 AI agents
│       │   ├── backbone/  # Core services
│       │   └── integrations/ # VoiceForge, VisionAudioForge
│       ├── db/        # Database setup, migrations
│       ├── jobs/      # Background job processors
│       └── utils/     # Shared utilities
├── docs/              # Feature documentation
├── infra/             # Docker, IaC, deployment configs
├── scripts/           # Automation scripts
├── prompts/           # 30 parallel build prompts
└── .claude/commands/  # Claude Code commands
```

## 10 Platform Layers

1. **Discover** — Find real problems before the market does (8 modules)
2. **Qualify** — Prove the problem is real, payable, and winnable (8 modules)
3. **Build** — Design the offer end-to-end (11 modules)
4. **Sell & Retain** — Close, deliver, expand, and protect (13 modules)
5. **Trust & Compliance** — Ethical and legal backbone (5 modules)
6. **Client Lifecycle** — From first call to final exit (9 modules)
7. **Polish** — The final 5% that makes this feel elite (4 modules)
8. **Platform Primitives** — SaaS operating infrastructure (7 modules)
9. **VoiceForge Integration** — Verified comms, training, crisis (6 touchpoints)
10. **VisionAudioForge Integration** — Multimedia, brand, visual proof (8 touchpoints)

## AI Agents

| Agent | Role |
|-------|------|
| Problem AI | Discovers and scores premium pain points |
| Research AI | Ingests sources, extracts claims, scores credibility |
| Validator AI | Evidence scoring, false-positive detection |
| Offer AI | Generates premium offer architectures |
| Pricing AI | Benchmark logic, anchor construction |
| Fulfillment AI | SOP bundles, staffing plans, delivery risk maps |
| Copy AI | Positioning copy, outreach, objection handling |
| Relationship AI | Gatekeeper mapping, referral paths, trust scoring |
| Proof AI | KPI stacks, ROI proof, case study frameworks |
| Command AI | Orchestration brain — next-best-action guidance |

## License

Confidential · © 2026 Green Companies LLC · All Rights Reserved
