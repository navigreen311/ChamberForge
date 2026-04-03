# Prompt 23: CI/CD Pipeline — GitHub Actions
Branch: ai-feature/ci-cd-pipeline

## Mission
Build the complete CI/CD pipeline using GitHub Actions for linting, testing, building, and deploying both backend and frontend.

## What to Build

### GitHub Actions Workflows
1. **.github/workflows/ci.yml** — On push to any branch and PRs to main:
   - Backend: install deps → lint (ruff) → type check (mypy) → unit tests → integration tests → coverage report
   - Frontend: install deps → lint (eslint) → type check (tsc) → unit tests → build
   - Upload coverage artifacts
2. **.github/workflows/deploy-staging.yml** — On push to main:
   - Run full CI → build Docker images → push to ECR → deploy to ECS staging → run smoke tests
3. **.github/workflows/deploy-prod.yml** — On tag v*:
   - Run full CI → build Docker images → push to ECR → deploy to ECS production (blue-green) → run smoke tests → notify team
4. **.github/workflows/ai-feature.yml** — On push to ai-feature/* branches:
   - Run CI only (no deploy) → post test results as PR comment

### Docker
1. **infra/Dockerfile.backend** — Multi-stage build for FastAPI backend
2. **infra/Dockerfile.frontend** — Multi-stage build for Next.js frontend
3. **infra/docker-compose.prod.yml** — Production docker-compose with all services

### Scripts
1. **scripts/setup.sh** — One-command local setup: create venv, install deps, copy env, start docker services, run migrations
2. **scripts/test.sh** — Run all tests (backend + frontend) with coverage
3. **scripts/deploy.sh** — Manual deploy script with environment selection

### Config
1. **backend/pyproject.toml** — Ruff linter configuration
2. **backend/mypy.ini** — Mypy type checking configuration
3. **Makefile** — Common targets: setup, dev, test, lint, build, deploy, clean

## Tests
- Validate all workflow YAML syntax
- Test Dockerfiles build successfully
- Test setup script is idempotent

## Commit
feat: add CI/CD pipeline — GitHub Actions, Dockerfiles, setup/test/deploy scripts, Makefile
