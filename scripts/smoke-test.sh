#!/bin/bash
set -e
BASE_URL=${1:-http://localhost:8000}
PASS=0; FAIL=0; SKIP=0

check() {
  local name=$1 method=$2 url=$3 expected=$4 data=$5
  if [ "$method" = "GET" ]; then
    status=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "$BASE_URL$url")
  else
    status=$(curl -s -o /dev/null -w '%{http_code}' -X $method -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$data" "$BASE_URL$url")
  fi
  if [ "$status" = "$expected" ]; then
    echo "  ✓ $name ($status)"; PASS=$((PASS+1))
  else
    echo "  ✗ $name (expected $expected, got $status)"; FAIL=$((FAIL+1))
  fi
}

echo "=== ChamberForge Smoke Test ==="
echo "Target: $BASE_URL"

# 1. Health
echo "--- Health ---"
check "Health check" GET "/api/health" 200
check "Readiness" GET "/api/v1/health/ready" 200
check "Liveness" GET "/api/v1/health/live" 200

# 2. Auth
echo "--- Auth ---"
REGISTER=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" -H "Content-Type: application/json" -d '{"email":"smoke@test.com","password":"SmokeTest123!","name":"Smoke Test","workspace_name":"Smoke WS"}')
echo "  Register: $(echo $REGISTER | python3 -c 'import sys,json; d=json.load(sys.stdin); print("OK" if "access_token" in d else d.get("detail","FAIL"))' 2>/dev/null || echo 'FAIL')"

TOKEN=$(echo $REGISTER | python3 -c 'import sys,json; print(json.load(sys.stdin).get("access_token",""))' 2>/dev/null)
if [ -z "$TOKEN" ]; then
  # Try login instead
  LOGIN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@chamberforge.dev","password":"changeme123"}')
  TOKEN=$(echo $LOGIN | python3 -c 'import sys,json; print(json.load(sys.stdin).get("access_token",""))' 2>/dev/null)
fi

if [ -z "$TOKEN" ]; then echo "  ✗ No auth token — skipping authenticated tests"; exit 1; fi
echo "  ✓ Auth token obtained"

# 3. Core CRUD
echo "--- Problems ---"
check "List problems" GET "/api/v1/problems" 200
check "Create problem" POST "/api/v1/problems" 200 '{"title":"Smoke Test Problem","description":"Test","wealth_tier":"HNWI","pain_category":"Coordination","urgency_score":5}'

echo "--- Playbooks ---"
check "List playbooks" GET "/api/v1/playbooks" 200

echo "--- Offers ---"
check "List offers" GET "/api/v1/offers" 200

echo "--- Command AI ---"
check "Dashboard" GET "/api/v1/command/dashboard" 200
check "Next action" GET "/api/v1/command/next-action" 200

echo "--- Search ---"
check "Search" GET "/api/v1/search?q=test" 200

echo "--- Notifications ---"
check "List notifications" GET "/api/v1/notifications" 200

echo "--- Billing ---"
check "Revenue" GET "/api/v1/billing/revenue" 200

echo "--- Compliance ---"
check "Quality" GET "/api/v1/compliance/quality/retention-risks" 200

echo "--- Lifecycle ---"
check "Health" GET "/api/v1/lifecycle/health" 200

echo "--- Admin ---"
check "Metrics" GET "/api/v1/metrics" 200
check "Jobs" GET "/api/v1/jobs/status" 200

echo ""
echo "=== Results: $PASS passed, $FAIL failed, $SKIP skipped ==="
[ $FAIL -eq 0 ] && echo "ALL SMOKE TESTS PASSED" || echo "SOME TESTS FAILED"
exit $FAIL
