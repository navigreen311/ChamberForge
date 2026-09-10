#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== ChamberForge Local Setup ==="
echo "Project root: $PROJECT_ROOT"

# Backend
echo ""
echo "--- Backend Setup ---"
cd "$PROJECT_ROOT/backend"
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
else
    echo "Virtual environment already exists."
fi
source .venv/bin/activate
echo "Installing Python dependencies..."
pip install -q -r requirements.txt
echo "Backend dependencies installed."

# Frontend
echo ""
echo "--- Frontend Setup ---"
cd "$PROJECT_ROOT/frontend"
if [ -f "package-lock.json" ]; then
    echo "Installing Node dependencies (npm ci)..."
    npm ci --silent
else
    echo "Installing Node dependencies (npm install)..."
    npm install --silent
fi
echo "Frontend dependencies installed."

# Environment file
echo ""
echo "--- Environment ---"
cd "$PROJECT_ROOT"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "Created .env from .env.example -- fill in your keys."
    else
        echo "No .env.example found. Create .env manually."
    fi
else
    echo ".env already exists."
fi

# Docker services
echo ""
echo "--- Docker Services ---"
if command -v docker &>/dev/null; then
    cd "$PROJECT_ROOT"
    docker compose up -d
    echo "Docker services started."
else
    echo "Docker not found. Install Docker to run supporting services (Postgres, Redis, Elasticsearch)."
fi

echo ""
echo "=== Setup complete ==="
echo "Run backend:  cd backend && source .venv/bin/activate && uvicorn app.main:app --reload"
echo "Run frontend: cd frontend && npm run dev"
