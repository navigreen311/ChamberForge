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

## AWS Infrastructure Overview

ChamberForge runs on AWS with the following architecture:

| Component | Service | Config |
|---|---|---|
| Backend API | ECS Fargate | `infra/aws/ecs-task-backend.json` |
| Frontend | ECS Fargate | `infra/aws/ecs-task-frontend.json` |
| Celery Worker | ECS Fargate | `infra/aws/ecs-task-worker.json` |
| Load Balancer | ALB | `infra/aws/alb.json` |
| Database | RDS PostgreSQL 16 | `infra/aws/rds.json` |
| Cache/Broker | ElastiCache Redis 7 | `infra/aws/elasticache.json` |
| Secrets | SSM Parameter Store | `scripts/setup-aws-params.sh` |
| Container Registry | ECR | — |

### Network Topology
```
Internet -> ALB (443/80)
              |-> /api/*, /ws/* -> Backend TG (port 8000)
              |-> /*            -> Frontend TG (port 3000)

Backend -> RDS PostgreSQL (port 5432)
Backend -> ElastiCache Redis (port 6379)
Worker  -> RDS PostgreSQL + Redis (same)
```

---

## AWS Prerequisites

Before first deployment, ensure you have:

1. **AWS CLI v2** configured with appropriate IAM credentials
2. **Docker** installed and running
3. **AWS Account ID** exported: `export AWS_ACCOUNT_ID=123456789012`
4. **AWS Region** set (defaults to us-east-1): `export AWS_REGION=us-east-1`
5. **ECR repositories** created:
   ```bash
   aws ecr create-repository --repository-name chamberforge-backend
   aws ecr create-repository --repository-name chamberforge-frontend
   ```
6. **ECS cluster** created:
   ```bash
   aws ecs create-cluster --cluster-name chamberforge-staging
   aws ecs create-cluster --cluster-name chamberforge-prod
   ```
7. **VPC, subnets, security groups** configured
8. **ACM certificate** for your domain (for HTTPS on ALB)
9. **IAM roles** for ECS task execution and task roles

### First-Time Setup

#### 1. Set up SSM Parameters (secrets)
```bash
# Set environment variables with real values, then run:
export DATABASE_URL="postgresql://user:pass@host:5432/chamberforge"
export JWT_SECRET="$(openssl rand -hex 32)"
export ANTHROPIC_API_KEY="sk-ant-..."
# ... set all required values

./scripts/setup-aws-params.sh staging
./scripts/setup-aws-params.sh production
```

See `scripts/setup-aws-params.sh` for the full list of required parameters.

#### 2. Provision RDS
Use the config in `infra/aws/rds.json` as reference. Key settings:
- **Production**: db.t3.medium, Multi-AZ, 14-day backups, Performance Insights
- **Staging**: db.t3.micro, single-AZ, 7-day backups

#### 3. Provision ElastiCache
Use `infra/aws/elasticache.json` as reference. Key settings:
- **Production**: cache.t3.micro with 1 replica, encryption at rest + in transit
- **Staging**: cache.t3.micro, single node

#### 4. Create ALB and Target Groups
Use `infra/aws/alb.json` as reference for ALB setup with:
- HTTPS listener (443) with path-based routing to backend/frontend
- HTTP listener (80) redirecting to HTTPS
- Health checks on `/api/health` (backend) and `/` (frontend)

#### 5. Create ECS Services
```bash
# Register task definitions
aws ecs register-task-definition --cli-input-json file://infra/aws/ecs-task-backend.json
aws ecs register-task-definition --cli-input-json file://infra/aws/ecs-task-frontend.json
aws ecs register-task-definition --cli-input-json file://infra/aws/ecs-task-worker.json

# Create services (adjust subnet/sg/tg ARNs)
aws ecs create-service --cluster chamberforge-staging \
  --service-name backend --task-definition chamberforge-backend \
  --desired-count 1 --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:...,containerName=backend,containerPort=8000"
```

---

## Staging Deployment

Staging deploys automatically when code is pushed to `main`.

### Pipeline
1. CI runs (backend tests + frontend build)
2. Docker images built and pushed to ECR
3. ECS task definitions updated
4. Rolling deployment to staging cluster

### Manual Deploy
```bash
./scripts/deploy-aws.sh staging latest
```

### Manual Trigger
Push to main or re-run the workflow from GitHub Actions.

### Environment
- **URL**: https://staging.chamberforge.com
- **Cluster**: `chamberforge-staging` (ECS)
- **Database**: RDS PostgreSQL (staging)

---

## Production Deployment

Production deploys on git tags matching `v*`.

### Deploy via Git Tag (Recommended)
```bash
# 1. Ensure main is stable and staging is verified
git checkout main
git pull origin main

# 2. Create a version tag
git tag v1.2.3
git push origin v1.2.3
```

### Deploy via Script
```bash
./scripts/deploy-aws.sh production v1.2.3

# Wait for services to stabilize
WAIT_FOR_STABLE=true ./scripts/deploy-aws.sh production v1.2.3
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

### Quick Rollback (All Services)
```bash
./scripts/rollback-aws.sh staging      # Rollback all staging services
./scripts/rollback-aws.sh production   # Rollback all production services
```

### Rollback Specific Service
```bash
./scripts/rollback-aws.sh production backend        # Rollback only backend
./scripts/rollback-aws.sh production worker          # Rollback only worker
./scripts/rollback-aws.sh production backend 5       # Rollback to specific revision 5
```

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
aws ecs list-task-definitions --family-prefix chamberforge-backend --sort DESC --max-items 5

# Update service to previous revision
aws ecs update-service \
  --cluster chamberforge-prod \
  --service backend \
  --task-definition chamberforge-backend:<previous-revision>
```

---

## Monitoring

### ECS Service Status
```bash
aws ecs describe-services --cluster chamberforge-prod --services backend frontend worker
```

### Container Logs
```bash
# Tail live logs
aws logs tail /ecs/chamberforge-backend --follow
aws logs tail /ecs/chamberforge-frontend --follow
aws logs tail /ecs/chamberforge-worker --follow

# Search logs
aws logs filter-log-events --log-group-name /ecs/chamberforge-backend \
  --filter-pattern "ERROR" --start-time $(date -d '1 hour ago' +%s)000
```

### RDS Monitoring
```bash
aws rds describe-db-instances --db-instance-identifier chamberforge-prod
aws cloudwatch get-metric-statistics --namespace AWS/RDS \
  --metric-name CPUUtilization --dimensions Name=DBInstanceIdentifier,Value=chamberforge-prod \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) --period 300 --statistics Average
```

### Health Check
```bash
curl -f https://api.chamberforge.com/api/health
```

---

## Cost Estimate (Monthly)

| Resource | Staging | Production |
|---|---|---|
| ECS Fargate (3 tasks) | ~$30 | ~$60 |
| RDS PostgreSQL | ~$15 (t3.micro) | ~$70 (t3.medium, Multi-AZ) |
| ElastiCache Redis | ~$12 (t3.micro) | ~$25 (t3.micro + replica) |
| ALB | ~$20 | ~$25 |
| ECR Storage | ~$1 | ~$1 |
| CloudWatch Logs | ~$5 | ~$10 |
| Data Transfer | ~$5 | ~$15 |
| **Total** | **~$88/mo** | **~$206/mo** |

*Estimates based on us-east-1 pricing as of 2024. Actual costs vary with traffic.*

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

---

## Scripts Reference

| Script | Purpose |
|---|---|
| `scripts/deploy-aws.sh` | Build, push, and deploy to ECS |
| `scripts/rollback-aws.sh` | Rollback ECS services to previous task def |
| `scripts/setup-aws-params.sh` | Create/update SSM Parameter Store secrets |
| `scripts/migrate.sh` | Run database migrations |
| `scripts/setup.sh` | Local development setup |
| `scripts/test.sh` | Run test suite |
