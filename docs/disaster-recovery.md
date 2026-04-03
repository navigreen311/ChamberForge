# ChamberForge Disaster Recovery Procedures

**Document Owner**: Infrastructure Lead / CTO
**Last Updated**: 2026-04-03
**Review Cycle**: Annual (next review: 2027-04-03)
**Classification**: Internal — Confidential

---

## 1. RDS PostgreSQL

### 1.1 Automated Backups

**Configuration**:
- Automated backups: **Enabled**
- Backup retention period: **35 days**
- Backup window: **03:00-04:00 UTC** (low-traffic period)
- Multi-AZ deployment: **Enabled**
- Storage: **gp3 with encryption at rest (AES-256)**

**Point-in-Time Recovery**:
- RDS maintains transaction logs enabling restore to any second within the retention period
- Recovery granularity: **5 minutes** (RPO target: 1 hour, actual capability: ~5 minutes)

### 1.2 Point-in-Time Recovery Procedure

```bash
# 1. Identify the target recovery time
TARGET_TIME="2026-04-03T10:00:00Z"

# 2. Restore to a new instance
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier chamberforge-prod \
  --target-db-instance-identifier chamberforge-prod-restored \
  --restore-time "$TARGET_TIME" \
  --db-instance-class db.r6g.large \
  --multi-az \
  --publicly-accessible false \
  --vpc-security-group-ids sg-xxxxxxxx

# 3. Wait for instance to become available
aws rds wait db-instance-available \
  --db-instance-identifier chamberforge-prod-restored

# 4. Verify data integrity
psql -h chamberforge-prod-restored.xxxxx.rds.amazonaws.com \
  -U chamberforge -d chamberforge -c "
  SELECT COUNT(*) FROM workspaces;
  SELECT COUNT(*) FROM users;
  SELECT MAX(created_at) FROM audit_logs;
"

# 5. Update application configuration to use restored instance
aws ssm put-parameter \
  --name "/prod/db/host" \
  --value "chamberforge-prod-restored.xxxxx.rds.amazonaws.com" \
  --overwrite

# 6. Force ECS service redeployment to pick up new connection
aws ecs update-service \
  --cluster chamberforge-prod \
  --service api \
  --force-new-deployment
```

### 1.3 Cross-Region Replication

**Configuration**:
- Cross-region read replica: **us-west-2** (secondary region)
- Replication lag monitoring: CloudWatch `ReplicaLag` metric
- Alert threshold: Replica lag > 60 seconds

**Promotion Procedure**:
```bash
# 1. Promote read replica to standalone instance
aws rds promote-read-replica \
  --db-instance-identifier chamberforge-replica-us-west-2

# 2. Wait for promotion to complete
aws rds wait db-instance-available \
  --db-instance-identifier chamberforge-replica-us-west-2 \
  --region us-west-2

# 3. Enable Multi-AZ on promoted instance
aws rds modify-db-instance \
  --db-instance-identifier chamberforge-replica-us-west-2 \
  --multi-az \
  --apply-immediately \
  --region us-west-2

# 4. Update application configuration in secondary region
aws ssm put-parameter \
  --name "/prod/db/host" \
  --value "chamberforge-replica-us-west-2.xxxxx.rds.amazonaws.com" \
  --overwrite \
  --region us-west-2
```

### 1.4 Manual Snapshot Management

```bash
# Create manual snapshot before major changes
aws rds create-db-snapshot \
  --db-instance-identifier chamberforge-prod \
  --db-snapshot-identifier chamberforge-pre-migration-$(date +%Y%m%d)

# Copy snapshot to secondary region
aws rds copy-db-snapshot \
  --source-db-snapshot-identifier arn:aws:rds:us-east-1:ACCOUNT:snapshot:chamberforge-pre-migration-20260403 \
  --target-db-snapshot-identifier chamberforge-pre-migration-20260403 \
  --region us-west-2
```

---

## 2. Redis (ElastiCache)

### 2.1 Persistence Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| Snapshot retention | 7 days | Point-in-time restore |
| Snapshot window | 04:00-05:00 UTC | Off-peak backup |
| AOF (Append Only File) | Enabled | Durability between snapshots |
| Multi-AZ | Enabled | Automatic failover |
| At-rest encryption | AES-256 | Data protection |
| In-transit encryption | TLS | Data protection |

### 2.2 Failover Procedure

**Automatic failover** (Multi-AZ):
- ElastiCache promotes replica to primary within ~30 seconds
- Application reconnects automatically via the primary endpoint (DNS-based)
- No manual intervention required for single-node failure

**Manual failover** (if automatic fails):
```bash
# 1. Check replication group status
aws elasticache describe-replication-groups \
  --replication-group-id chamberforge-prod-redis

# 2. Force failover to specific replica
aws elasticache test-failover \
  --replication-group-id chamberforge-prod-redis \
  --node-group-id 0001

# 3. If cluster is unrecoverable, restore from snapshot
aws elasticache create-replication-group \
  --replication-group-id chamberforge-prod-redis-restored \
  --snapshot-name chamberforge-redis-daily-20260403 \
  --replication-group-description "Restored from snapshot" \
  --cache-node-type cache.r6g.large \
  --num-cache-clusters 2 \
  --multi-az-enabled \
  --at-rest-encryption-enabled \
  --transit-encryption-enabled
```

### 2.3 Cold Start

If Redis is completely lost and no snapshot is available:
- Application handles cache misses gracefully (reads from PostgreSQL)
- Cache warms organically as users access the platform
- Session tokens are JWT-based and do not depend on Redis
- Background tasks (Celery) use Redis as broker — workers will reconnect when Redis is available

---

## 3. Elasticsearch

### 3.1 Snapshot Configuration

**Repository**: S3 bucket `chamberforge-es-snapshots`
**Schedule**: Daily at 02:00 UTC
**Retention**: 30 days

```bash
# Register snapshot repository
PUT _snapshot/s3_backup
{
  "type": "s3",
  "settings": {
    "bucket": "chamberforge-es-snapshots",
    "region": "us-east-1",
    "server_side_encryption": true
  }
}

# Snapshot lifecycle policy
PUT _slm/policy/daily-snapshot
{
  "schedule": "0 0 2 * * ?",
  "name": "<chamberforge-snap-{now/d}>",
  "repository": "s3_backup",
  "config": {
    "indices": ["contacts-*", "properties-*", "communications-*", "documents-*"],
    "ignore_unavailable": true,
    "include_global_state": false
  },
  "retention": {
    "expire_after": "30d",
    "min_count": 7,
    "max_count": 30
  }
}
```

### 3.2 Restore Procedure

```bash
# 1. List available snapshots
GET _snapshot/s3_backup/_all

# 2. Close indices before restore (if they exist)
POST /contacts-*/_close
POST /properties-*/_close

# 3. Restore from snapshot
POST _snapshot/s3_backup/chamberforge-snap-2026.04.03/_restore
{
  "indices": "contacts-*,properties-*,communications-*,documents-*",
  "ignore_unavailable": true,
  "include_global_state": false
}

# 4. Verify cluster health
GET _cluster/health?wait_for_status=green&timeout=5m

# 5. Verify document counts
GET /contacts-*/_count
GET /properties-*/_count
```

### 3.3 Full Reindex from Database

If no Elasticsearch snapshot is available, rebuild the search index from PostgreSQL:

```bash
# Trigger full reindex via admin API
curl -X POST https://api.chamberforge.com/api/v1/admin/search/reindex-all \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}'
```

- Full reindex takes approximately 2-4 hours depending on data volume
- Search is available in degraded mode during reindex (partial results)
- Background Celery workers handle the reindex in batches

---

## 4. S3 (File Storage)

### 4.1 Versioning and Protection

| Setting | Value |
|---------|-------|
| Versioning | Enabled |
| MFA Delete | Enabled (production bucket) |
| Lifecycle rules | Transition to IA after 90 days, Glacier after 365 days |
| Cross-region replication | Enabled (us-east-1 to us-west-2) |
| Server-side encryption | AES-256 (SSE-S3) |
| Object lock | Enabled for audit/compliance buckets |

### 4.2 Cross-Region Replication

```json
{
  "Role": "arn:aws:iam::ACCOUNT:role/s3-replication-role",
  "Rules": [
    {
      "ID": "replicate-all",
      "Status": "Enabled",
      "Priority": 1,
      "Filter": {},
      "Destination": {
        "Bucket": "arn:aws:s3:::chamberforge-prod-files-us-west-2",
        "StorageClass": "STANDARD_IA",
        "EncryptionConfiguration": {
          "ReplicaKmsKeyID": "arn:aws:kms:us-west-2:ACCOUNT:key/KEY_ID"
        }
      },
      "DeleteMarkerReplication": {
        "Status": "Enabled"
      }
    }
  ]
}
```

### 4.3 Recovery Procedure

**Accidental deletion** (single object):
```bash
# List versions to find the deleted object
aws s3api list-object-versions \
  --bucket chamberforge-prod-files \
  --prefix "uploads/workspace-123/document.pdf"

# Restore by deleting the delete marker
aws s3api delete-object \
  --bucket chamberforge-prod-files \
  --key "uploads/workspace-123/document.pdf" \
  --version-id "DELETE_MARKER_VERSION_ID"
```

**Bucket-level recovery** (cross-region):
```bash
# Sync from replica bucket
aws s3 sync \
  s3://chamberforge-prod-files-us-west-2 \
  s3://chamberforge-prod-files \
  --source-region us-west-2 \
  --region us-east-1
```

---

## 5. ECS (Application Services)

### 5.1 Service Auto-Recovery

| Setting | Value |
|---------|-------|
| Desired count (API) | 3 |
| Minimum healthy percent | 66% |
| Maximum percent | 200% |
| Health check grace period | 60 seconds |
| Deployment circuit breaker | Enabled with rollback |
| Task placement strategy | Spread across AZs |

### 5.2 ALB Health Checks

```
Health check path: /api/health
Interval: 15 seconds
Timeout: 5 seconds
Healthy threshold: 2
Unhealthy threshold: 3
```

### 5.3 Recovery Procedure

```bash
# 1. Check service status
aws ecs describe-services \
  --cluster chamberforge-prod \
  --services api worker beat

# 2. Check stopped task reasons
aws ecs list-tasks \
  --cluster chamberforge-prod \
  --service-name api \
  --desired-status STOPPED | \
  xargs -I {} aws ecs describe-tasks \
  --cluster chamberforge-prod \
  --tasks {}

# 3. Force new deployment (picks up latest config)
aws ecs update-service \
  --cluster chamberforge-prod \
  --service api \
  --force-new-deployment

# 4. Rollback to previous task definition
CURRENT_TD=$(aws ecs describe-services \
  --cluster chamberforge-prod \
  --services api \
  --query 'services[0].taskDefinition' --output text)

# Get previous revision
PREV_REVISION=$(($(echo $CURRENT_TD | grep -o '[0-9]*$') - 1))
PREV_TD="${CURRENT_TD%:*}:${PREV_REVISION}"

aws ecs update-service \
  --cluster chamberforge-prod \
  --service api \
  --task-definition "$PREV_TD"

# 5. Scale up if needed
aws ecs update-service \
  --cluster chamberforge-prod \
  --service api \
  --desired-count 5
```

---

## 6. Secrets Management (SSM Parameter Store)

### 6.1 Parameter Inventory

| Parameter Path | Type | Rotation Schedule |
|---------------|------|------------------|
| `/prod/db/host` | String | On infrastructure change |
| `/prod/db/password` | SecureString | Every 90 days |
| `/prod/redis/url` | SecureString | Every 90 days |
| `/prod/jwt/secret` | SecureString | Every 90 days |
| `/prod/encryption/key` | SecureString | Annually (requires data re-encryption) |
| `/prod/anthropic/api-key` | SecureString | Every 90 days |
| `/prod/stripe/secret-key` | SecureString | Every 90 days |
| `/prod/resend/api-key` | SecureString | Every 90 days |
| `/prod/pusher/*` | SecureString | Every 90 days |
| `/prod/sentry/dsn` | String | On change |

### 6.2 Backup Procedure

```bash
# Export all parameters (encrypted values remain encrypted)
aws ssm get-parameters-by-path \
  --path "/prod/" \
  --recursive \
  --with-decryption \
  --query 'Parameters[*].{Name:Name,Value:Value,Type:Type}' \
  --output json > /tmp/ssm-backup-$(date +%Y%m%d).json

# Encrypt the backup file
gpg --symmetric --cipher-algo AES256 \
  /tmp/ssm-backup-$(date +%Y%m%d).json

# Upload to secure backup location
aws s3 cp /tmp/ssm-backup-$(date +%Y%m%d).json.gpg \
  s3://chamberforge-secrets-backup/ \
  --sse AES256

# Clean up plaintext
rm /tmp/ssm-backup-$(date +%Y%m%d).json
```

### 6.3 Rotation Schedule

| Frequency | Secrets |
|-----------|---------|
| 90 days | Database password, Redis URL, JWT secret, third-party API keys |
| Annually | Encryption master key (requires coordinated re-encryption) |
| On incident | All secrets potentially exposed in a breach |

### 6.4 Rotation Procedure

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# 2. Update in SSM
aws ssm put-parameter \
  --name "/prod/db/password" \
  --value "$NEW_SECRET" \
  --type SecureString \
  --overwrite

# 3. Update the actual service (e.g., RDS password)
aws rds modify-db-instance \
  --db-instance-identifier chamberforge-prod \
  --master-user-password "$NEW_SECRET" \
  --apply-immediately

# 4. Force ECS redeployment to pick up new secrets
aws ecs update-service \
  --cluster chamberforge-prod \
  --service api \
  --force-new-deployment

# 5. Verify application connectivity
curl -f https://api.chamberforge.com/api/health
```

---

## 7. DR Testing Checklist

Use this checklist during quarterly and annual DR tests:

- [ ] RDS failover test: Trigger Multi-AZ failover, measure recovery time
- [ ] RDS restore test: Restore from point-in-time backup, verify data integrity
- [ ] Redis failover test: Simulate node failure, verify automatic failover
- [ ] Elasticsearch restore test: Restore from S3 snapshot, verify search results
- [ ] S3 recovery test: Restore a deleted object from version history
- [ ] ECS recovery test: Kill tasks, verify auto-replacement
- [ ] Secret rotation test: Rotate one secret, verify application continuity
- [ ] Cross-region test (annual): Deploy full stack in secondary region
- [ ] Communication test: Execute notification chain, measure response times

---

## Document History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-04-03 | 1.0 | Engineering | Initial DR procedures |
