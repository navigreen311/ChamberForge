.PHONY: setup dev test lint build seed migrate db-reset docker-up docker-down dev-up dev-down backup restore health-check clean help security-test

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

dev-up: ## Boot full stack via docker-compose.dev.yml (one command)
	bash scripts/dev-up.sh

dev-down: ## Tear down full dev stack and remove volumes
	bash scripts/dev-down.sh

deploy-staging: ## Deploy to staging (requires AWS credentials)
	@echo "Triggering staging deploy via git push to main..."
	git push origin main

backup: ## Backup ChamberForge database
	bash scripts/backup-db.sh

restore: ## Restore database from backup (usage: make restore BACKUP=<file>)
	bash scripts/restore-db.sh $(BACKUP)

health-check: ## Check system health via API
	@curl -sf http://localhost:8000/api/v1/metrics/detailed | python -m json.tool || echo "Health check failed - is the server running?"

security-test: ## Run security test suite
	cd backend && python -m pytest tests/security/ -v

clean: ## Remove all generated files, containers, and volumes
	docker compose down -v 2>/dev/null || true
	docker compose -f infra/docker-compose.prod.yml down -v 2>/dev/null || true
	rm -rf backend/.venv frontend/node_modules frontend/.next
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	@echo "Cleaned."
