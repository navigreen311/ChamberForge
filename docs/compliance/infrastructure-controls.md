# ChamberForge Infrastructure Controls — IaC, Backups, Insurance

**Document Owner**: SRE Lead / Compliance Officer
**Last Reviewed**: 2026-04-03
**Version**: 1.0

---

## 1. Infrastructure as Code (CC7.5)

### 1.1 Current IaC Coverage

| Component | Tool | Location | Status |
|-----------|------|----------|--------|
| Docker containers | Docker Compose | `docker-compose.yml` | Implemented |
| Application containers | Dockerfile | `Dockerfile`, `infra/` | Implemented |
| ECS task definitions | Terraform | `infra/terraform/ecs.tf` | Implemented |
| RDS configuration | Terraform | `infra/terraform/rds.tf` | Implemented |
| ElastiCache (Redis) | Terraform | `infra/terraform/redis.tf` | Implemented |
| VPC / Networking | Terraform | `infra/terraform/vpc.tf` | Implemented |
| IAM policies | Terraform | `infra/terraform/iam.tf` | Implemented |
| S3 buckets | Terraform | `infra/terraform/s3.tf` | Implemented |
| Secrets Manager | Terraform | `infra/terraform/secrets.tf` | Implemented |
| CloudWatch alarms | Terraform | `infra/terraform/monitoring.tf` | Implemented |
| CI/CD pipelines | GitHub Actions | `.github/workflows/` | Implemented |

### 1.2 IaC Governance

| Practice | Implementation |
|----------|---------------|
| Version control | All Terraform in Git; changes via PR |
| State management | Terraform state in S3 with DynamoDB locking |
| Plan before apply | `terraform plan` required before any `terraform apply` |
| Drift detection | Weekly automated `terraform plan` to detect manual changes |
| Module reuse | Shared Terraform modules for common patterns |
| Secrets handling | No secrets in Terraform code; references to Secrets Manager |

---

## 2. Automated Database Backups (CC7.6)

### 2.1 RDS Backup Configuration

| Setting | Value |
|---------|-------|
| Automated backups | Enabled |
| Backup retention | 7 days |
| Backup window | 03:00-04:00 UTC (low traffic) |
| Multi-AZ | Enabled (synchronous replication) |
| Point-in-time recovery | Enabled (5-minute granularity) |
| Snapshot encryption | AES-256 (AWS KMS) |
| Cross-region backup | Enabled to secondary region |

### 2.2 Backup Schedule

| Backup Type | Frequency | Retention | Location |
|-------------|-----------|-----------|----------|
| RDS automated snapshot | Daily | 7 days | Primary region |
| RDS cross-region copy | Daily | 7 days | Secondary region |
| Redis snapshot (RDB) | Every 6 hours | 3 days | S3 bucket |
| Elasticsearch snapshot | Daily | 14 days | S3 bucket |
| S3 data (documents) | Continuous (versioning) | 90 days (lifecycle) | Same bucket + cross-region |
| Application config/secrets | On change | Indefinite | Secrets Manager (versioned) |

### 2.3 Backup Verification

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Backup completion monitoring | Daily (automated Datadog alert) | SRE Lead |
| Backup restoration test | Monthly | SRE Lead |
| Full DR recovery drill | Semi-annually | SRE Lead + Engineering |
| Cross-region failover test | Annually | SRE Lead |

### 2.4 Recovery Procedures

See `docs/disaster-recovery.md` for detailed recovery procedures including:
- RDS point-in-time recovery
- Redis snapshot restoration
- Elasticsearch index rebuild from S3 snapshots
- Full cross-region failover

---

## 3. Insurance Coverage (CC9.7)

### 3.1 Coverage Summary

| Policy Type | Coverage | Provider | Renewal |
|-------------|----------|----------|---------|
| **Cyber Liability Insurance** | $2M aggregate | [Provider TBD — to be procured Q2 2026] | Annual |
| **Technology Errors & Omissions (E&O)** | $2M aggregate | [Provider TBD — to be procured Q2 2026] | Annual |
| **General Liability** | $1M per occurrence | [Current provider] | Annual |
| **Directors & Officers (D&O)** | $1M aggregate | [Current provider] | Annual |

### 3.2 Cyber Liability Coverage Details

The cyber liability policy covers:
- Data breach response costs (notification, credit monitoring, forensics)
- Business interruption losses due to cyber incidents
- Ransomware and extortion payments
- Regulatory fines and penalties (where insurable)
- Third-party liability from data breaches
- Media liability (AI-generated content errors)

### 3.3 E&O Coverage Details

The technology E&O policy covers:
- Professional liability for AI-generated advice accuracy
- Failure to deliver contracted services
- Intellectual property infringement claims
- Data loss or corruption liability

### 3.4 Insurance Review Schedule

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Coverage adequacy review | Annual (Q1) | Compliance Officer |
| Policy renewal | Annual | Compliance Officer |
| Incident reporting to insurer | Within 48 hours of qualifying incident | Compliance Officer |
| Coverage limit reassessment | After funding rounds or significant growth | CEO + Compliance Officer |

---

## 4. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-03 | SRE Lead / Compliance Officer | Initial infrastructure controls and insurance documentation |
