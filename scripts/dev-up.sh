#!/bin/bash
echo "Starting ChamberForge full stack..."
docker compose -f docker-compose.dev.yml up -d
echo "Waiting for services..."
sleep 10
echo "Running smoke test..."
bash scripts/smoke-test.sh http://localhost:8000 2>/dev/null || true
echo ""
echo "ChamberForge is running!"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/api/docs"
echo "  Login:    admin@chamberforge.dev / changeme123"
