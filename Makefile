.PHONY: setup dev test lint build seed migrate db-reset docker-up docker-down worker beat clean help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

setup: ## Run idempotent local setup (venv, deps, docker, env)
	bash scripts/setup.sh

dev: ## Start all services for local development
	docker compose up -d
	@echo "Waiting for services to be healthy..."
	@sleep 3
	@echo "Starting backend..."
	cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000 &
	@echo "Starting frontend..."
	cd frontend && npm run dev

test: ## Run full test suite (backend + frontend)
	bash scripts/test.sh

lint: ## Run linters on backend and frontend
	cd backend && ruff check .
	cd frontend && npx next lint

build: ## Build production Docker images
	docker compose -f infra/docker-compose.prod.yml build

seed: ## Seed database with demo data (idempotent)
	python -m scripts.seed

migrate: ## Run database migrations (Alembic)
	cd backend && alembic upgrade head

db-reset: ## Reset database and re-seed (DESTRUCTIVE)
	bash scripts/reset_db.sh

docker-up: ## Start Docker infrastructure services
	docker compose up -d
	@echo "Waiting for healthchecks..."
	@docker compose ps

docker-down: ## Stop Docker infrastructure services
	docker compose down

deploy-staging: ## Deploy to staging (requires AWS credentials)
	@echo "Triggering staging deploy via git push to main..."
	git push origin main

worker: ## Start Celery worker (default, ai, notifications queues)
	cd backend && celery -A app.jobs.worker.celery worker --loglevel=info -Q default,ai,notifications

beat: ## Start Celery beat scheduler
	cd backend && celery -A app.jobs.worker.celery beat --loglevel=info

clean: ## Remove all generated files, containers, and volumes
	docker compose down -v 2>/dev/null || true
	docker compose -f infra/docker-compose.prod.yml down -v 2>/dev/null || true
	rm -rf backend/.venv frontend/node_modules frontend/.next
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	@echo "Cleaned."
