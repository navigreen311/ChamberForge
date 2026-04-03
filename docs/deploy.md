# ChamberForge Deployment Guide

## Local Development

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker & Docker Compose

### Quick Start
```bash
make setup    # Install dependencies, create .env, start Docker services
make dev      # Start backend + frontend in dev mode
```

### Manual Start
```bash
# Backend
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

### Running Tests
```bash
make test     # Run full test suite
make lint     # Run linters
```

---

## Staging Deployment

Staging deploys automatically when code is pushed to `main`.

### Pipeline
1. CI runs (backend tests + frontend build)
2. Docker images built and pushed to ECR
3. ECS task definitions updated
4. Rolling deployment to staging cluster

### Manual Trigger
Push to main or re-run the workflow from GitHub Actions.

### Environment
- **URL**: https://staging.chamberforge.com
- **Cluster**: `chamberforge-staging` (ECS)
- **Database**: RDS PostgreSQL (staging)

---

## Production Deployment

Production deploys on git tags matching `v*`.

### Deploy Steps
```bash
# 1. Ensure main is stable and staging is verified
git checkout main
git pull origin main

# 2. Create a version tag
git tag v1.2.3
git push origin v1.2.3
```

### Pipeline
1. Docker images built and tagged with version + `latest`
2. Images pushed to ECR
3. Blue/green deployment via AWS CodeDeploy
4. Automated health check verification
5. Traffic shifts to new version after health checks pass

### Environment
- **URL**: https://chamberforge.com / https://api.chamberforge.com
- **Cluster**: `chamberforge-prod` (ECS)
- **Database**: RDS PostgreSQL (production, Multi-AZ)

---

## Rollback

### Staging
Re-deploy the previous commit:
```bash
git revert HEAD
git push origin main
```

### Production
Option 1 -- Roll forward with a new tag:
```bash
git tag v1.2.4   # with the fix
git push origin v1.2.4
```

Option 2 -- CodeDeploy rollback:
```bash
aws deploy stop-deployment --deployment-id <id> --auto-rollback-enabled
```

Option 3 -- Manual ECS rollback:
```bash
# Find the previous task definition revision
aws ecs list-task-definitions --family-prefix chamberforge-backend-prod --sort DESC --max-items 5

# Update service to previous revision
aws ecs update-service \
  --cluster chamberforge-prod \
  --service chamberforge-backend-prod \
  --task-definition chamberforge-backend-prod:<previous-revision>
```

---

## Docker Compose (Self-Hosted)

For self-hosted or single-server deployments:
```bash
# Build and start all services
docker compose -f infra/docker-compose.prod.yml up -d --build

# View logs
docker compose -f infra/docker-compose.prod.yml logs -f

# Stop
docker compose -f infra/docker-compose.prod.yml down
```

Required environment variables in `.env`:
- `DB_PASSWORD`
- `SECRET_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`

---

## CI/CD Workflows Summary

| Workflow | Trigger | Action |
|---|---|---|
| `ci.yml` | Push to any branch, PRs to main | Run tests + lint |
| `deploy-staging.yml` | Push to main | Build, push, deploy to staging |
| `deploy-prod.yml` | Tag `v*` | Build, push, blue/green deploy to prod |
| `ai-feature.yml` | Push to `ai-feature/*` | Run CI, post test results summary |
