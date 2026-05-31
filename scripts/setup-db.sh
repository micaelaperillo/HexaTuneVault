#!/usr/bin/env bash
set -e

# Load .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DB_USER="${DB_USER:-postgres}"
CONTAINER="hexatunevault-db"
MAX_ATTEMPTS=30

echo "Starting PostgreSQL container..."
docker compose up -d db

echo "Waiting for PostgreSQL to be ready..."
attempt=0

until docker exec "$CONTAINER" pg_isready -U "$DB_USER" > /dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
    echo "PostgreSQL did not become ready after $MAX_ATTEMPTS attempts."
    exit 1
  fi
  echo "  Attempt $attempt/$MAX_ATTEMPTS..."
  sleep 1
done

echo "PostgreSQL is ready!"
