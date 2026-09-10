#!/bin/bash
BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then echo "Usage: ./restore-db.sh <backup_file.sql.gz>"; exit 1; fi
DB_URL=${DATABASE_URL:-postgresql://chamberforge:localdev@localhost:5432/chamberforge}
echo "WARNING: This will OVERWRITE the current database. Press Ctrl+C to cancel."
sleep 5
gunzip -c "$BACKUP_FILE" | psql "$DB_URL"
echo "Database restored from $BACKUP_FILE"
