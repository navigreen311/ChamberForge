#!/bin/bash
set -euo pipefail

echo "=== ChamberForge Security Scan ==="
echo ""

echo "Running security tests..."
cd backend && python -m pytest tests/security/ -v --tb=short
echo ""

echo "Checking for known vulnerabilities in Python deps..."
pip audit 2>/dev/null || echo "pip-audit not installed. Run: pip install pip-audit"
echo ""

echo "Checking for secrets in code..."
grep -r "sk_live_\|sk_test_\|AKIA\|password\s*=" backend/app/ --include="*.py" | grep -v "YOUR_\|PLACEHOLDER\|changeme\|example\|test" || echo "No hardcoded secrets found."
echo ""

echo "Security scan complete."
