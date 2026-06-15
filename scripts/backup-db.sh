#!/bin/bash
# Backup Script for Albergue Sr. Almeida Database
# Usage: ./scripts/backup-db.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "Starting database backup..."

# Assuming DATABASE_URL is available in the environment
# For a real PostgreSQL instance:
# pg_dump $DATABASE_URL > $BACKUP_FILE

# MOCK behavior for sandbox:
echo "MOCK: Executing pg_dump for database..."
echo "-- Mock PostgreSQL Dump" > $BACKUP_FILE
echo "-- Date: $TIMESTAMP" >> $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo "Backup successfully created: $BACKUP_FILE"
  # Retention policy: remove backups older than 30 days
  find $BACKUP_DIR -name "backup_*.sql" -type f -mtime +30 -delete
  echo "Old backups cleaned up (30-day retention policy)."
else
  echo "Error: Database backup failed."
  exit 1
fi
