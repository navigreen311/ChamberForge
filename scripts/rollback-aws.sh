#!/bin/bash
set -euo pipefail

# =============================================================================
# ChamberForge AWS Rollback Script
# Usage: ./scripts/rollback-aws.sh [environment] [service] [revision]
#   environment: staging (default) | production
#   service: backend | frontend | worker | all (default)
#   revision: specific task def revision (default: previous)
# =============================================================================

ENVIRONMENT=${1:-staging}
SERVICE=${2:-all}
REVISION=${3:-}
REGION=${AWS_REGION:-us-east-1}
CLUSTER="chamberforge-${ENVIRONMENT}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[rollback]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }
err()  { echo -e "${RED}[error]${NC} $*" >&2; }

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  err "Invalid environment: ${ENVIRONMENT}. Must be 'staging' or 'production'."
  exit 1
fi

if [[ "$ENVIRONMENT" == "production" ]]; then
  warn "Rolling back PRODUCTION. Press Ctrl+C within 5 seconds to abort."
  sleep 5
fi

rollback_service() {
  local svc_name="$1"
  local task_family="chamberforge-${svc_name}"

  # Get current task definition
  CURRENT_TASK_DEF=$(aws ecs describe-services \
    --cluster "${CLUSTER}" \
    --services "${svc_name}" \
    --region "${REGION}" \
    --query "services[0].taskDefinition" \
    --output text)

  CURRENT_REVISION=$(echo "$CURRENT_TASK_DEF" | grep -o '[0-9]*$')

  if [[ -n "$REVISION" ]]; then
    TARGET_REVISION="$REVISION"
  else
    TARGET_REVISION=$((CURRENT_REVISION - 1))
    if [[ "$TARGET_REVISION" -lt 1 ]]; then
      err "No previous revision available for ${svc_name}."
      return 1
    fi
  fi

  TARGET_TASK_DEF="${task_family}:${TARGET_REVISION}"
  log "Rolling back ${svc_name}: revision ${CURRENT_REVISION} -> ${TARGET_REVISION}"

  # Verify target task definition exists
  if ! aws ecs describe-task-definition \
    --task-definition "${TARGET_TASK_DEF}" \
    --region "${REGION}" > /dev/null 2>&1; then
    err "Task definition ${TARGET_TASK_DEF} does not exist."
    return 1
  fi

  # Update service to previous revision
  aws ecs update-service \
    --cluster "${CLUSTER}" \
    --service "${svc_name}" \
    --task-definition "${TARGET_TASK_DEF}" \
    --region "${REGION}" > /dev/null

  log "Service ${svc_name} updated to ${TARGET_TASK_DEF}"
}

SERVICES=()
if [[ "$SERVICE" == "all" ]]; then
  SERVICES=(backend frontend worker)
else
  SERVICES=("$SERVICE")
fi

log "Rolling back ${SERVICE} in ${ENVIRONMENT} (cluster: ${CLUSTER})"

for svc in "${SERVICES[@]}"; do
  rollback_service "$svc"
done

echo ""
log "Rollback initiated."
log "Monitor with: aws ecs describe-services --cluster ${CLUSTER} --services ${SERVICES[*]} --region ${REGION}"

# Optionally wait for stability
if [[ "${WAIT_FOR_STABLE:-false}" == "true" ]]; then
  log "Waiting for services to stabilize..."
  aws ecs wait services-stable \
    --cluster "${CLUSTER}" \
    --services "${SERVICES[@]}" \
    --region "${REGION}"
  log "All services are stable."
fi
