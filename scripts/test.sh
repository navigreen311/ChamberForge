#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== ChamberForge Test Suite ==="

# Backend Tests
echo ""
echo "=== Backend Tests ==="
cd "$PROJECT_ROOT/backend"
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi
python -m pytest tests/ -v --tb=short

# Frontend Build Check
echo ""
echo "=== Frontend Build Check ==="
cd "$PROJECT_ROOT/frontend"
npm run build

echo ""
echo "=== All tests passed! ==="
