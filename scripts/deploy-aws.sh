#!/bin/bash
set -euo pipefail

# =============================================================================
# ChamberForge AWS Deployment Script
# Usage: ./scripts/deploy-aws.sh [environment] [tag]
#   environment: staging (default) | production
#   tag: Docker image tag (default: latest)
# =============================================================================

ENVIRONMENT=${1:-staging}
TAG=${2:-latest}
REGION=${AWS_REGION:-us-east-1}
ACCOUNT_ID=${AWS_ACCOUNT_ID:?'AWS_ACCOUNT_ID is required'}
ECR_REPO="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
CLUSTER="chamberforge-${ENVIRONMENT}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[deploy]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }
err()  { echo -e "${RED}[error]${NC} $*" >&2; }

# Validation
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  err "Invalid environment: ${ENVIRONMENT}. Must be 'staging' or 'production'."
  exit 1
fi

if [[ "$ENVIRONMENT" == "production" ]]; then
  warn "Deploying to PRODUCTION. Press Ctrl+C within 5 seconds to abort."
  sleep 5
fi

log "Deploying ChamberForge to ${ENVIRONMENT} (tag: ${TAG}, region: ${REGION})"

# ------ Build Docker images ------
log "Building Docker images..."
docker build -f infra/Dockerfile.backend -t "chamberforge-backend:${TAG}" .
docker build -f infra/Dockerfile.frontend -t "chamberforge-frontend:${TAG}" .

# ------ Tag images ------
log "Tagging images for ECR..."
docker tag "chamberforge-backend:${TAG}" "${ECR_REPO}/chamberforge-backend:${TAG}"
docker tag "chamberforge-frontend:${TAG}" "${ECR_REPO}/chamberforge-frontend:${TAG}"

# ------ Push to ECR ------
log "Authenticating with ECR..."
aws ecr get-login-password --region "${REGION}" | docker login --username AWS --password-stdin "${ECR_REPO}"

log "Pushing images..."
docker push "${ECR_REPO}/chamberforge-backend:${TAG}"
docker push "${ECR_REPO}/chamberforge-frontend:${TAG}"

# ------ Register new task definitions ------
log "Registering task definitions..."

for TASK_DEF in backend frontend worker; do
  TASK_FILE="infra/aws/ecs-task-${TASK_DEF}.json"
  if [[ -f "$TASK_FILE" ]]; then
    # Substitute environment variables in task definition
    RENDERED=$(sed \
      -e "s|\${ECR_REPO}|${ECR_REPO}|g" \
      -e "s|\${TAG}|${TAG}|g" \
      -e "s|\${REGION}|${REGION}|g" \
      -e "s|\${ACCOUNT}|${ACCOUNT_ID}|g" \
      "$TASK_FILE")

    echo "$RENDERED" | aws ecs register-task-definition \
      --cli-input-json file:///dev/stdin \
      --region "${REGION}" > /dev/null

    log "Registered task definition: chamberforge-${TASK_DEF}"
  fi
done

# ------ Update ECS services ------
log "Updating ECS services..."
aws ecs update-service \
  --cluster "${CLUSTER}" \
  --service backend \
  --force-new-deployment \
  --region "${REGION}" > /dev/null

aws ecs update-service \
  --cluster "${CLUSTER}" \
  --service frontend \
  --force-new-deployment \
  --region "${REGION}" > /dev/null

aws ecs update-service \
  --cluster "${CLUSTER}" \
  --service worker \
  --force-new-deployment \
  --region "${REGION}" > /dev/null

log "Deployment initiated for all services."

# ------ Wait for stability (optional) ------
if [[ "${WAIT_FOR_STABLE:-false}" == "true" ]]; then
  log "Waiting for services to stabilize (timeout: 10 minutes)..."
  aws ecs wait services-stable \
    --cluster "${CLUSTER}" \
    --services backend frontend worker \
    --region "${REGION}"
  log "All services are stable."
fi

echo ""
log "Deployment complete!"
log "Monitor with: aws ecs describe-services --cluster ${CLUSTER} --services backend frontend worker --region ${REGION}"
log "View logs:    aws logs tail /ecs/chamberforge-backend --region ${REGION} --follow"
