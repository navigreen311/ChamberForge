# Load Testing Guide

## Overview

ChamberForge uses [k6](https://k6.io/) for API load and performance testing. Tests live in `tests/load/` and cover health checks, authentication, CRUD operations, search, AI generation, and full user scenarios.

## Prerequisites

### Install k6

**macOS:**
```bash
brew install k6
```

**Windows:**
```bash
choco install k6
# or
winget install k6
```

**Linux (Debian/Ubuntu):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

**Docker:**
```bash
docker pull grafana/k6
```

## Running Tests

### Quick start (all tests)

```bash
make load-test
```

### Individual test

```bash
# Set env vars
export BASE_URL=http://localhost:8000
export AUTH_TOKEN=<your-token>

# Run a specific test
k6 run tests/load/health.js
k6 run tests/load/auth.js
k6 run tests/load/problems.js
k6 run tests/load/search.js
k6 run tests/load/dashboard.js
k6 run tests/load/offers.js
k6 run tests/load/full-scenario.js
```

### Custom VUs or duration

```bash
k6 run --vus 100 --duration 5m tests/load/search.js
```

### Against staging

```bash
BASE_URL=https://staging.chamberforge.dev make load-test
```

## Test Descriptions

| Test | VUs | Duration | p95 Target | What it tests |
|------|-----|----------|------------|---------------|
| `health.js` | 10 | 30s | < 100ms | `/api/health` smoke test |
| `auth.js` | 50 | 60s | < 500ms | Login endpoint under load |
| `problems.js` | 30 | 60s | < 300ms | Problems list + create |
| `search.js` | 50 | 60s | < 200ms | Full-text search |
| `dashboard.js` | 20 | 60s | < 1000ms | Command AI dashboard |
| `offers.js` | 10 | 60s | < 5000ms | AI-powered offer generation |
| `full-scenario.js` | 20 | 120s | < 2000ms | Realistic multi-step user flow |

## Target SLAs

| Metric | Target | Notes |
|--------|--------|-------|
| Health endpoint p95 | < 100ms | Basic availability |
| Auth endpoint p95 | < 500ms | Includes bcrypt hashing |
| CRUD endpoints p95 | < 300ms | Standard DB operations |
| Search p95 | < 200ms | Full-text search with indexing |
| Dashboard p95 | < 1000ms | Aggregated/synthesized view |
| AI generation p95 | < 5000ms | LLM calls are inherently slower |
| Error rate | < 1% | For non-AI endpoints |
| AI error rate | < 5% | Allows for occasional timeouts |

## Interpreting Results

k6 outputs a summary after each run. Key metrics to watch:

- **http_req_duration**: Response time distribution (avg, p90, p95, p99, max)
- **http_reqs**: Total requests made and requests/second throughput
- **http_req_failed**: Percentage of requests that returned non-2xx status
- **checks**: Pass/fail ratio of assertion checks
- **iterations**: How many complete test iterations were executed

A test **fails** if any threshold is breached (marked with a cross in output).

## CI Integration

To run in CI, ensure k6 is installed and the backend is reachable:

```yaml
# Example GitHub Actions step
- name: Run load tests
  env:
    BASE_URL: http://localhost:8000
  run: |
    curl -sL https://github.com/grafana/k6/releases/download/v0.49.0/k6-v0.49.0-linux-amd64.tar.gz | tar xz
    export PATH=$PWD/k6-v0.49.0-linux-amd64:$PATH
    make load-test
```
