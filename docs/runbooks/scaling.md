# Scaling Runbook

## ECS Task Scaling

### Manual Scaling
```bash
# Check current task count
aws ecs describe-services \
  --cluster chamberforge-prod \
  --services chamberforge-backend \
  --query 'services[0].{desired:desiredCount,running:runningCount}'

# Scale backend tasks
aws ecs update-service \
  --cluster chamberforge-prod \
  --service chamberforge-backend \
  --desired-count 4

# Scale Celery workers
aws ecs update-service \
  --cluster chamberforge-prod \
  --service chamberforge-worker \
  --desired-count 6
```

### Auto-Scaling Configuration
Auto-scaling is configured via Terraform in `infra/`. Key thresholds:
- **CPU target**: 60% average utilization
- **Memory target**: 70% average utilization
- **Min tasks**: 2 (backend), 2 (worker)
- **Max tasks**: 10 (backend), 8 (worker)

```bash
# Check auto-scaling policies
aws application-autoscaling describe-scaling-policies \
  --service-namespace ecs \
  --resource-id service/chamberforge-prod/chamberforge-backend
```

### When to Scale
- Sustained CPU > 60% for 5+ minutes
- Request latency p95 > 500ms
- Queue depth (Celery) growing consistently
- Memory usage > 70%

## RDS Scaling

### Vertical Scaling (Instance Class)
```bash
# Check current instance class
aws rds describe-db-instances \
  --db-instance-identifier chamberforge-prod \
  --query 'DBInstances[0].DBInstanceClass'

# Modify instance class (causes ~10 min downtime, schedule maintenance window)
aws rds modify-db-instance \
  --db-instance-identifier chamberforge-prod \
  --db-instance-class db.r6g.xlarge \
  --apply-immediately
```

**Instance class recommendations:**
| Users | Recommended | vCPU | RAM |
|-------|------------|------|-----|
| < 100 | db.t3.medium | 2 | 4 GB |
| 100-500 | db.r6g.large | 2 | 16 GB |
| 500-2000 | db.r6g.xlarge | 4 | 32 GB |
| 2000+ | db.r6g.2xlarge | 8 | 64 GB |

### Read Replicas
```bash
# Create read replica
aws rds create-db-instance-read-replica \
  --db-instance-identifier chamberforge-prod-read1 \
  --source-db-instance-identifier chamberforge-prod \
  --db-instance-class db.r6g.large

# Update application to use read replica for read-heavy queries
# Set READ_DATABASE_URL in environment
```

### Storage Scaling
```bash
# Check current storage
aws rds describe-db-instances \
  --db-instance-identifier chamberforge-prod \
  --query 'DBInstances[0].AllocatedStorage'

# Increase storage (no downtime)
aws rds modify-db-instance \
  --db-instance-identifier chamberforge-prod \
  --allocated-storage 200 \
  --apply-immediately
```

## Redis Scaling

### Vertical Scaling
```bash
# Check current node type
aws elasticache describe-cache-clusters \
  --cache-cluster-id chamberforge-prod \
  --query 'CacheClusters[0].CacheNodeType'

# Scale up (causes brief failover)
aws elasticache modify-cache-cluster \
  --cache-cluster-id chamberforge-prod \
  --cache-node-type cache.r6g.large \
  --apply-immediately
```

### Memory Management
Monitor via dashboard. If memory is high:
1. Check key distribution: `redis-cli --bigkeys`
2. Set TTL on transient keys
3. Review cache eviction policy (should be `allkeys-lru`)
4. Consider scaling up node type

**Node type recommendations:**
| Usage | Recommended | RAM |
|-------|------------|-----|
| Dev/Staging | cache.t3.micro | 0.5 GB |
| Small prod | cache.t3.medium | 3 GB |
| Medium prod | cache.r6g.large | 13 GB |
| Large prod | cache.r6g.xlarge | 26 GB |

## Elasticsearch Scaling

### Add Data Nodes
Update the Terraform configuration in `infra/elasticsearch.tf`:
```hcl
resource "aws_opensearch_domain" "main" {
  cluster_config {
    instance_count = 3  # increase from 2
    instance_type  = "r6g.large.search"
  }
}
```

### Index Management
```bash
# Check index sizes
curl -s localhost:9200/_cat/indices?v&s=store.size:desc

# Force merge to reduce segments (during low-traffic)
curl -X POST localhost:9200/chamberforge-problems/_forcemerge?max_num_segments=1
```

## Scaling Checklist
1. Identify the bottleneck (CPU, memory, I/O, network)
2. Check monitoring dashboard for trends
3. Take a database backup before major changes: `make backup`
4. Scale the identified resource
5. Verify via monitoring that the issue is resolved
6. Update Terraform / IaC to make the change permanent
7. Document the scaling event in the incident log
