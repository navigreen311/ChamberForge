#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== ChamberForge Docker Integration Tests ==="
echo ""

# Start test services
echo "[1/4] Starting test services..."
docker compose -f "$PROJECT_ROOT/docker-compose.test.yml" up -d

# Wait for services to be healthy
echo "[2/4] Waiting for services to be ready..."
MAX_WAIT=60
ELAPSED=0

# Wait for Postgres
echo "  Waiting for PostgreSQL..."
until docker compose -f "$PROJECT_ROOT/docker-compose.test.yml" exec -T test-db pg_isready -U test -d chamberforge_test 2>/dev/null; do
    sleep 2
    ELAPSED=$((ELAPSED + 2))
    if [ $ELAPSED -ge $MAX_WAIT ]; then
        echo "  ERROR: PostgreSQL did not become ready within ${MAX_WAIT}s"
        docker compose -f "$PROJECT_ROOT/docker-compose.test.yml" logs test-db
        docker compose -f "$PROJECT_ROOT/docker-compose.test.yml" down -v
        exit 1
    fi
done
echo "  PostgreSQL is ready."

# Wait for Redis
echo "  Waiting for Redis..."
until docker compose -f "$PROJECT_ROOT/docker-compose.test.yml" exec -T test-redis redis-cli ping 2>/dev/null | grep -q PONG; do
    sleep 2
    ELAPSED=$((ELAPSED + 2))
    if [ $ELAPSED -ge $MAX_WAIT ]; then
        echo "  ERROR: Redis did not become ready within ${MAX_WAIT}s"
        docker compose -f "$PROJECT_ROOT/docker-compose.test.yml" down -v
        exit 1
    fi
done
echo "  Redis is ready."

# Wait for Elasticsearch
echo "  Waiting for Elasticsearch..."
until curl -sf http://localhost:9201/_cluster/health > /dev/null 2>&1; do
    sleep 3
    ELAPSED=$((ELAPSED + 3))
    if [ $ELAPSED -ge $MAX_WAIT ]; then
        echo "  ERROR: Elasticsearch did not become ready within ${MAX_WAIT}s"
        docker compose -f "$PROJECT_ROOT/docker-compose.test.yml" logs test-es
        docker compose -f "$PROJECT_ROOT/docker-compose.test.yml" down -v
        exit 1
    fi
done
echo "  Elasticsearch is ready."

# Run integration tests
echo ""
echo "[3/4] Running integration tests against real services..."
cd "$PROJECT_ROOT/backend"
DATABASE_URL=postgresql://test:test@localhost:5433/chamberforge_test \
REDIS_URL=redis://localhost:6380 \
ELASTICSEARCH_URL=http://localhost:9201 \
JWT_SECRET=test-secret-key \
APP_ENV=testing \
python -m pytest tests/integration/test_real_postgres.py \
               tests/integration/test_real_redis.py \
               tests/integration/test_real_elasticsearch.py \
               -v --tb=short -c tests/conftest_docker.py

# Cleanup
echo ""
echo "[4/4] Cleaning up test services..."
docker compose -f "$PROJECT_ROOT/docker-compose.test.yml" down -v

echo ""
echo "=== All integration tests passed! ==="
