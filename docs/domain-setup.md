# Domain Setup Guide

Complete guide for configuring custom domains, TLS certificates, and CDN for ChamberForge.

## Prerequisites

- AWS CLI installed and configured with appropriate IAM permissions
- Domain registered (chamberforge.com) via your registrar
- `jq` installed (`brew install jq` or `apt install jq`)

## Architecture

```
                     ┌─────────────┐
                     │  Route53     │
                     │  DNS Zone    │
                     └──────┬──────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
   app.chamberforge.com  api.chamberforge.com  cdn.chamberforge.com
   portal.chamberforge.com                     │
          │                 │                 │
          ▼                 ▼                 ▼
   ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
   │  ALB (HTTPS)│  │  ALB (HTTPS)│  │  CloudFront  │
   │  Frontend   │  │  Backend API│  │  Static CDN  │
   └─────────────┘  └─────────────┘  └──────────────┘
                                            │
                                     ┌──────────────┐
                                     │  S3 Bucket   │
                                     │  Static      │
                                     └──────────────┘
```

## Step 1: Register Domain

If you haven't registered `chamberforge.com`:

1. Use Route53 Domains or your preferred registrar
2. If using an external registrar, you'll update nameservers in Step 3

## Step 2: Configure Route53 Hosted Zone

### Automated

```bash
./scripts/setup-domain.sh --domain chamberforge.com --region us-east-1
```

### Manual

```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name chamberforge.com \
  --caller-reference "chamberforge-$(date +%s)"

# Note the 4 nameserver records from the output
```

Update your domain registrar with the NS records from the hosted zone.

## Step 3: Request ACM Certificate

ACM provides free TLS certificates. The certificate **must** be in `us-east-1` for CloudFront.

```bash
# Request wildcard certificate
aws acm request-certificate \
  --domain-name chamberforge.com \
  --subject-alternative-names "*.chamberforge.com" \
  --validation-method DNS \
  --region us-east-1

# Create DNS validation record (output from ACM)
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch file://validation-record.json

# Wait for validation (up to 30 minutes)
aws acm wait certificate-validated \
  --certificate-arn YOUR_CERT_ARN \
  --region us-east-1
```

## Step 4: Set Up CloudFront

Deploy the CloudFront distribution using the CloudFormation template:

```bash
aws cloudformation deploy \
  --template-file infra/aws/cloudfront.json \
  --stack-name chamberforge-cdn \
  --parameter-overrides \
    S3BucketName=chamberforge-static-assets \
    AcmCertificateArn=YOUR_CERT_ARN \
    CustomDomainName=cdn.chamberforge.com \
  --region us-east-1
```

After deployment, create the cdn.chamberforge.com DNS record pointing to the CloudFront distribution domain.

## Step 5: Update ALB with HTTPS

Add an HTTPS listener to the ALB using the same ACM certificate:

```bash
aws elbv2 create-listener \
  --load-balancer-arn YOUR_ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=YOUR_CERT_ARN \
  --default-actions Type=forward,TargetGroupArn=YOUR_TARGET_GROUP_ARN

# Redirect HTTP to HTTPS
aws elbv2 create-listener \
  --load-balancer-arn YOUR_ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=redirect,RedirectConfig='{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}'
```

## Step 6: Verify SSL

```bash
# Check certificate is served correctly
curl -vI https://app.chamberforge.com 2>&1 | grep "SSL certificate"

# Verify all subdomains
for sub in app api portal cdn; do
  echo "--- ${sub}.chamberforge.com ---"
  curl -sI "https://${sub}.chamberforge.com" | head -2
done
```

## Step 7: Update Application Config

1. Set environment variables:
   ```bash
   CDN_URL=https://cdn.chamberforge.com
   CUSTOM_DOMAIN=chamberforge.com
   ```

2. The frontend `next.config.js` automatically uses `CDN_URL` as the asset prefix in production.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Certificate stuck in PENDING_VALIDATION | Verify DNS validation CNAME record exists and NS records point to Route53 |
| CloudFront returns 403 | Check S3 bucket policy allows OAI access |
| Mixed content warnings | Ensure all resources use HTTPS; check `CDN_URL` starts with `https://` |
| DNS not resolving | Allow up to 48h for registrar NS propagation; check with `dig +trace` |
| Certificate not valid for domain | Ensure cert is in us-east-1 and includes the wildcard SAN |
