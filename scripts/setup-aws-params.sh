#!/bin/bash
set -euo pipefail

# =============================================================================
# ChamberForge AWS SSM Parameter Setup
# Usage: ./scripts/setup-aws-params.sh [environment]
#   environment: staging (default) | production
#
# Creates SecureString parameters in AWS SSM Parameter Store.
# You must replace placeholder values before running.
# =============================================================================

ENVIRONMENT=${1:-staging}
REGION=${AWS_REGION:-us-east-1}
PREFIX="/chamberforge/${ENVIRONMENT}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[setup]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }
err()  { echo -e "${RED}[error]${NC} $*" >&2; }

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  err "Invalid environment: ${ENVIRONMENT}. Must be 'staging' or 'production'."
  exit 1
fi

log "Setting up SSM parameters for ${ENVIRONMENT} (prefix: ${PREFIX})"

put_param() {
  local name="$1"
  local value="$2"
  local description="${3:-}"

  if aws ssm get-parameter --name "${PREFIX}/${name}" --region "${REGION}" > /dev/null 2>&1; then
    warn "Parameter ${PREFIX}/${name} already exists. Use --overwrite to update."
    aws ssm put-parameter \
      --name "${PREFIX}/${name}" \
      --type SecureString \
      --value "${value}" \
      --description "${description}" \
      --overwrite \
      --region "${REGION}" > /dev/null
    log "Updated: ${PREFIX}/${name}"
  else
    aws ssm put-parameter \
      --name "${PREFIX}/${name}" \
      --type SecureString \
      --value "${value}" \
      --description "${description}" \
      --region "${REGION}" > /dev/null
    log "Created: ${PREFIX}/${name}"
  fi
}

# ==== Database ====
put_param "DATABASE_URL" \
  "${DATABASE_URL:-postgresql://chamberforge_admin:CHANGE_ME@localhost:5432/chamberforge}" \
  "PostgreSQL connection string"

# ==== Application Secrets ====
put_param "JWT_SECRET" \
  "${JWT_SECRET:-CHANGE_ME_GENERATE_RANDOM_SECRET}" \
  "JWT signing secret"

put_param "SECRET_KEY" \
  "${SECRET_KEY:-CHANGE_ME_GENERATE_RANDOM_SECRET}" \
  "Application secret key"

# ==== AI ====
put_param "ANTHROPIC_API_KEY" \
  "${ANTHROPIC_API_KEY:-CHANGE_ME}" \
  "Anthropic API key for Claude"

# ==== Payments ====
put_param "STRIPE_SECRET_KEY" \
  "${STRIPE_SECRET_KEY:-CHANGE_ME}" \
  "Stripe secret API key"

put_param "STRIPE_WEBHOOK_SECRET" \
  "${STRIPE_WEBHOOK_SECRET:-CHANGE_ME}" \
  "Stripe webhook signing secret"

# ==== Email ====
put_param "RESEND_API_KEY" \
  "${RESEND_API_KEY:-CHANGE_ME}" \
  "Resend email service API key"

# ==== Redis / Cache ====
put_param "REDIS_URL" \
  "${REDIS_URL:-redis://chamberforge-cache.xxxxx.use1.cache.amazonaws.com:6379}" \
  "ElastiCache Redis connection string"

# ==== Realtime / Pusher ====
put_param "PUSHER_APP_ID" \
  "${PUSHER_APP_ID:-CHANGE_ME}" \
  "Pusher application ID"

put_param "PUSHER_KEY" \
  "${PUSHER_KEY:-CHANGE_ME}" \
  "Pusher public key"

put_param "PUSHER_SECRET" \
  "${PUSHER_SECRET:-CHANGE_ME}" \
  "Pusher secret key"

# ==== S3 ====
put_param "AWS_S3_BUCKET" \
  "${AWS_S3_BUCKET:-chamberforge-${ENVIRONMENT}-assets}" \
  "S3 bucket for file uploads"

# ==== Frontend ====
put_param "API_URL" \
  "${API_URL:-https://api.chamberforge.com}" \
  "Backend API URL for frontend"

echo ""
log "SSM parameter setup complete for ${ENVIRONMENT}."
log "List parameters: aws ssm get-parameters-by-path --path ${PREFIX} --region ${REGION} --with-decryption"
warn "Remember to replace all CHANGE_ME placeholder values!"
