#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=${BACKUP_DIR:-/tmp/chamberforge-backups}
DB_URL=${DATABASE_URL:-postgresql://chamberforge:localdev@localhost:5432/chamberforge}
mkdir -p $BACKUP_DIR
echo "Backing up ChamberForge database..."
pg_dump "$DB_URL" | gzip > "${BACKUP_DIR}/chamberforge_${TIMESTAMP}.sql.gz"
echo "Backup saved: ${BACKUP_DIR}/chamberforge_${TIMESTAMP}.sql.gz"
# Cleanup: keep last 30 backups
ls -t ${BACKUP_DIR}/chamberforge_*.sql.gz | tail -n +31 | xargs -r rm
echo "Old backups cleaned."
