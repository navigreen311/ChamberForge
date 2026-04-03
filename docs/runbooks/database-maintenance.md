# Database Maintenance Runbook

## Backup

### Automated Backup
```bash
# Run backup (saves to /tmp/chamberforge-backups by default)
make backup

# Custom backup directory
BACKUP_DIR=/path/to/backups bash scripts/backup-db.sh

# Custom database URL
DATABASE_URL=postgresql://user:pass@host:5432/db bash scripts/backup-db.sh
```

Backups are gzipped SQL dumps. The script automatically retains the last 30 backups.

### Scheduled Backups (Cron)
```bash
# Add to crontab: backup every 6 hours
0 */6 * * * cd /path/to/chamberforge && bash scripts/backup-db.sh >> /var/log/chamberforge-backup.log 2>&1
```

### Verify Backup Integrity
```bash
# List recent backups
ls -la /tmp/chamberforge-backups/

# Test decompression (does not restore)
gunzip -t /tmp/chamberforge-backups/chamberforge_YYYYMMDD_HHMMSS.sql.gz
```

## Restore

### From Backup File
```bash
# Restore from a specific backup (WARNING: overwrites current data)
make restore BACKUP=/tmp/chamberforge-backups/chamberforge_YYYYMMDD_HHMMSS.sql.gz

# Or directly
bash scripts/restore-db.sh /path/to/backup.sql.gz
```

**Important**: The restore script has a 5-second delay before executing. Press Ctrl+C to cancel.

### Point-in-Time Recovery (RDS)
For AWS RDS instances, use the AWS Console or CLI:
```bash
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier chamberforge-prod \
  --target-db-instance-identifier chamberforge-restore \
  --restore-time "2026-01-15T10:00:00Z"
```

## Vacuum & Analyze

### When to Vacuum
- After large DELETE operations
- When `pg_stat_user_tables.n_dead_tup` is high
- When query performance degrades

```sql
-- Check dead tuples per table
SELECT relname, n_dead_tup, n_live_tup,
       round(n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100, 2) as dead_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- Vacuum and analyze a specific table
VACUUM ANALYZE ai_usage_logs;

-- Full vacuum (locks table, use during maintenance window)
VACUUM FULL ai_usage_logs;
```

### Autovacuum Monitoring
```sql
-- Check autovacuum activity
SELECT schemaname, relname, last_vacuum, last_autovacuum, last_analyze
FROM pg_stat_user_tables
ORDER BY last_autovacuum DESC NULLS LAST;
```

## Reindex

### When to Reindex
- After VACUUM FULL
- When index bloat exceeds 30%
- When query plans show unexpected sequential scans

```sql
-- Check index bloat
SELECT
  schemaname, tablename, indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- Reindex a specific table (non-blocking in PG 12+)
REINDEX INDEX CONCURRENTLY idx_ai_usage_logs_created_at;

-- Reindex entire database (maintenance window)
REINDEX DATABASE chamberforge;
```

## Migrations

```bash
# Run pending migrations
make migrate

# Check migration status
cd backend && alembic current
cd backend && alembic history --verbose

# Create new migration
cd backend && alembic revision --autogenerate -m "description"

# Rollback last migration
cd backend && alembic downgrade -1
```

## Connection Pool Monitoring

Check via the monitoring dashboard or API:
```bash
curl -s http://localhost:8000/api/v1/metrics/detailed | python -m json.tool | grep -A5 db_pool
```

If connections are exhausted:
1. Check for connection leaks (unclosed sessions)
2. Increase pool size in database configuration
3. Check for long-running queries: `SELECT * FROM pg_stat_activity WHERE state = 'active';`
