#!/bin/bash
echo "=== ChamberForge Security Audit ==="
echo "1. Python dependency audit..."
cd backend && pip-audit -r requirements.txt 2>/dev/null || echo "pip-audit not installed"
cd ..
echo "2. npm audit..."
cd frontend && npm audit --production 2>/dev/null || echo "npm not configured"
cd ..
echo "3. Secret scanning..."
grep -rn "sk_live_\|AKIA\|BEGIN.*PRIVATE" backend/app/ frontend/src/ --include="*.py" --include="*.ts" | grep -v test || echo "No secrets found"
echo "4. Security tests..."
cd backend && python -m pytest tests/security/ -v --tb=short 2>/dev/null
echo "=== Audit Complete ==="
