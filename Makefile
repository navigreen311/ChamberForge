.PHONY: setup dev test lint build deploy-staging clean help migrate seed db-reset

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

setup: ## Run idempotent local setup
	bash scripts/setup.sh

dev: ## Start all services for local development
	docker compose up -d
	@echo "Starting backend..."
	cd backend && source .venv/bin/activate && uvicorn app.main:app --reload &
	@echo "Starting frontend..."
	cd frontend && npm run dev

test: ## Run full test suite
	bash scripts/test.sh

lint: ## Run linters on backend and frontend
	cd backend && ruff check .
	cd frontend && npx next lint

build: ## Build production Docker images
	docker compose -f infra/docker-compose.prod.yml build

deploy-staging: ## Deploy to staging (requires AWS credentials)
	@echo "Triggering staging deploy via git push to main..."
	git push origin main

migrate: ## Run Alembic migrations to head
	cd backend && alembic upgrade head

seed: ## Seed database with demo data and playbooks
	python scripts/seed.py

db-reset: ## Reset DB: downgrade, upgrade, and re-seed
	cd backend && alembic downgrade base && alembic upgrade head && cd .. && python scripts/seed.py

clean: ## Remove all generated files and containers
	docker compose down -v 2>/dev/null || true
	docker compose -f infra/docker-compose.prod.yml down -v 2>/dev/null || true
	rm -rf backend/.venv frontend/node_modules frontend/.next
	@echo "Cleaned."
