#!/bin/bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8000}"

echo "=== ChamberForge Load Tests ==="
echo "Backend target: ${BASE_URL}"
echo ""

# Obtain auth token
echo "Obtaining auth token..."
TOKEN=$(curl -sf -X POST "${BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chamberforge.dev","password":"changeme123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  echo "WARNING: Could not obtain auth token. Authenticated tests may fail."
else
  echo "Auth token obtained."
fi

export BASE_URL
export AUTH_TOKEN="${TOKEN}"

FAILED=0

for test in health auth problems search dashboard; do
  echo ""
  echo "--- Running ${test} load test ---"
  if k6 run "tests/load/${test}.js"; then
    echo "--- ${test}: PASSED ---"
  else
    echo "--- ${test}: FAILED ---"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "=== Load Tests Complete ==="
if [ "$FAILED" -gt 0 ]; then
  echo "${FAILED} test(s) had threshold failures."
  exit 1
else
  echo "All tests passed thresholds."
fi
