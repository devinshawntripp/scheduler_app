#!/bin/sh
echo "Starting entrypoint.sh"

# Optionally wait for the database to be reachable before continuing.
# Set CHECK_DB_CONNECTION=true to enable this (useful in docker-compose setups).
if [ "$CHECK_DB_CONNECTION" = "true" ]; then
  echo "Waiting for the database to be ready..."
  # Parse host and port from DATABASE_URL
  # Expected format: postgresql://user:pass@host:port/dbname
  DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
  DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/[^/]*$|\1|')
  DB_PORT=${DB_PORT:-5432}
  until nc -z -v -w30 "$DB_HOST" "$DB_PORT"
  do
    echo "Waiting for database connection..."
    sleep 1
  done
  echo "Database is up and running!"
fi

# Deploy migrations
echo "Attempting to deploy migrations..."
npx prisma migrate deploy
echo "Migrations deployed"

# Run seed (roles + optional default admin if missing)
echo "Running database seed..."
npm run db:seed
echo "Seed completed"

# Start the application
npm run start
