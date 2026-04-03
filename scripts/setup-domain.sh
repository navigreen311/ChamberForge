#!/usr/bin/env bash
# =============================================================================
# ChamberForge — Domain Setup & TLS Provisioning
# =============================================================================
# Automates: Route53 hosted zone, ACM certificate, DNS records, CloudFront
# Prerequisites: AWS CLI configured, jq installed
# Usage: ./scripts/setup-domain.sh [--domain chamberforge.com] [--region us-east-1]
# =============================================================================
set -euo pipefail

# --- Defaults ----------------------------------------------------------------
DOMAIN="${DOMAIN:-chamberforge.com}"
REGION="${REGION:-us-east-1}"
S3_BUCKET="${S3_BUCKET:-chamberforge-static-assets}"
ALB_DNS_NAME="${ALB_DNS_NAME:-}"
ALB_HOSTED_ZONE_ID="${ALB_HOSTED_ZONE_ID:-}"

# --- Parse arguments ---------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case $1 in
    --domain) DOMAIN="$2"; shift 2 ;;
    --region) REGION="$2"; shift 2 ;;
    --alb-dns) ALB_DNS_NAME="$2"; shift 2 ;;
    --alb-zone-id) ALB_HOSTED_ZONE_ID="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

echo "============================================="
echo "ChamberForge Domain Setup"
echo "Domain:  ${DOMAIN}"
echo "Region:  ${REGION}"
echo "============================================="

# --- Step 1: Create Route53 Hosted Zone --------------------------------------
echo ""
echo "[1/5] Creating Route53 hosted zone for ${DOMAIN}..."

HOSTED_ZONE_OUTPUT=$(aws route53 create-hosted-zone \
  --name "${DOMAIN}" \
  --caller-reference "chamberforge-$(date +%s)" \
  --hosted-zone-config Comment="ChamberForge production hosted zone" \
  --region "${REGION}" 2>&1) || {
    echo "  Hosted zone may already exist. Attempting to retrieve..."
    HOSTED_ZONE_OUTPUT=$(aws route53 list-hosted-zones-by-name \
      --dns-name "${DOMAIN}" --max-items 1)
  }

HOSTED_ZONE_ID=$(echo "${HOSTED_ZONE_OUTPUT}" | jq -r '.HostedZone.Id // .HostedZones[0].Id' | sed 's|/hostedzone/||')
echo "  Hosted Zone ID: ${HOSTED_ZONE_ID}"

NS_RECORDS=$(aws route53 get-hosted-zone --id "${HOSTED_ZONE_ID}" | jq -r '.DelegationSet.NameServers[]')
echo "  Name servers (update your registrar with these):"
echo "${NS_RECORDS}" | sed 's/^/    /'

# --- Step 2: Request ACM Certificate ----------------------------------------
echo ""
echo "[2/5] Requesting ACM wildcard certificate for *.${DOMAIN}..."

CERT_ARN=$(aws acm request-certificate \
  --domain-name "${DOMAIN}" \
  --subject-alternative-names "*.${DOMAIN}" \
  --validation-method DNS \
  --region "${REGION}" \
  --query 'CertificateArn' --output text)

echo "  Certificate ARN: ${CERT_ARN}"

# --- Step 3: DNS Validation --------------------------------------------------
echo ""
echo "[3/5] Setting up DNS validation records..."

# Wait briefly for ACM to generate validation records
sleep 5

VALIDATION_RECORDS=$(aws acm describe-certificate \
  --certificate-arn "${CERT_ARN}" \
  --region "${REGION}" \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord')

VALIDATION_NAME=$(echo "${VALIDATION_RECORDS}" | jq -r '.Name')
VALIDATION_VALUE=$(echo "${VALIDATION_RECORDS}" | jq -r '.Value')

if [[ -n "${VALIDATION_NAME}" && "${VALIDATION_NAME}" != "null" ]]; then
  aws route53 change-resource-record-sets \
    --hosted-zone-id "${HOSTED_ZONE_ID}" \
    --change-batch '{
      "Changes": [{
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "'"${VALIDATION_NAME}"'",
          "Type": "CNAME",
          "TTL": 300,
          "ResourceRecords": [{"Value": "'"${VALIDATION_VALUE}"'"}]
        }
      }]
    }' > /dev/null
  echo "  Validation CNAME record created."
else
  echo "  WARNING: Could not retrieve validation records. Check ACM console."
fi

# --- Step 4: Wait for Certificate Validation ---------------------------------
echo ""
echo "[4/5] Waiting for certificate validation (this may take several minutes)..."

aws acm wait certificate-validated \
  --certificate-arn "${CERT_ARN}" \
  --region "${REGION}" 2>/dev/null || {
    echo "  Certificate not yet validated. You can check status with:"
    echo "    aws acm describe-certificate --certificate-arn ${CERT_ARN} --region ${REGION}"
    echo "  Continuing with setup..."
  }

CERT_STATUS=$(aws acm describe-certificate \
  --certificate-arn "${CERT_ARN}" \
  --region "${REGION}" \
  --query 'Certificate.Status' --output text)
echo "  Certificate status: ${CERT_STATUS}"

# --- Step 5: Create DNS A Records -------------------------------------------
echo ""
echo "[5/5] Creating DNS records..."

SUBDOMAINS=("app" "api" "portal")

if [[ -n "${ALB_DNS_NAME}" && -n "${ALB_HOSTED_ZONE_ID}" ]]; then
  for SUB in "${SUBDOMAINS[@]}"; do
    echo "  Creating A record: ${SUB}.${DOMAIN} → ALB"
    aws route53 change-resource-record-sets \
      --hosted-zone-id "${HOSTED_ZONE_ID}" \
      --change-batch '{
        "Changes": [{
          "Action": "UPSERT",
          "ResourceRecordSet": {
            "Name": "'"${SUB}.${DOMAIN}"'",
            "Type": "A",
            "AliasTarget": {
              "DNSName": "'"${ALB_DNS_NAME}"'",
              "HostedZoneId": "'"${ALB_HOSTED_ZONE_ID}"'",
              "EvaluateTargetHealth": true
            }
          }
        }]
      }' > /dev/null
  done
  echo "  ALB A records created."
else
  echo "  Skipping ALB records (--alb-dns and --alb-zone-id not provided)."
  echo "  Run again with: --alb-dns <ALB_DNS> --alb-zone-id <ALB_ZONE_ID>"
fi

# --- Summary -----------------------------------------------------------------
echo ""
echo "============================================="
echo "Domain Setup Complete"
echo "============================================="
echo "Hosted Zone ID:   ${HOSTED_ZONE_ID}"
echo "Certificate ARN:  ${CERT_ARN}"
echo "Certificate:      ${CERT_STATUS}"
echo ""
echo "Next steps:"
echo "  1. Update your domain registrar nameservers to:"
echo "${NS_RECORDS}" | sed 's/^/       /'
echo "  2. Deploy CloudFront with the certificate ARN above"
echo "  3. Update .env with CDN_URL=https://cdn.${DOMAIN}"
echo "  4. Update ALB listener to use the certificate for HTTPS"
echo "============================================="
