#!/bin/bash
# =============================================================================
# ChamberForge — Full Database Reset
# =============================================================================
# Drops all tables, recreates them, and runs the seed script.
# WARNING: This will delete ALL data. Use with caution.
# =============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo "  ChamberForge Database Reset"
echo "========================================"
echo ""
echo "WARNING: This will DELETE ALL DATA in the database."
echo "Press Ctrl+C within 3 seconds to cancel..."
sleep 3
echo ""

cd "$PROJECT_ROOT/backend"

# Activate virtualenv if present
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
elif [ -f ".venv/Scripts/activate" ]; then
    source .venv/Scripts/activate
fi

echo "--- Dropping and recreating all tables ---"
python -c "
import sys
sys.path.insert(0, '.')
from app.db.session import engine, Base

# Import all models so metadata knows every table
from app.models.user import User
from app.models.workspace import Workspace
from app.models.playbook import Playbook
from app.models.problem import Problem
from app.models.offer import Offer
from app.models.client import Client
from app.models.household_graph import HouseholdGraph
from app.models.evidence import Evidence
from app.models.notification import Notification

print('Dropping all tables...')
Base.metadata.drop_all(engine)
print('Creating all tables...')
Base.metadata.create_all(engine)
print('Database schema reset complete.')
"

echo ""
echo "--- Running seed script ---"
cd "$PROJECT_ROOT"
python -m scripts.seed

echo ""
echo "========================================"
echo "  Database reset and seeded successfully"
echo "========================================"
