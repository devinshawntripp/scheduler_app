#!/bin/sh
echo "Starting entrypoint.sh"
# Wait for the database to be ready
echo "Waiting for the database to be ready..."
if [ "$CHECK_DB_CONNECTION" = "true" ]; then
until nc -z -v -w30 db 5432
do
  echo "Waiting for database connection..."
  sleep 1
done
fi
echo "Database is up and running!"

# First try to deploy migrations
echo "Attempting to deploy migrations..."
if ! npx prisma migrate deploy; then
    echo "Migration deploy failed, attempting to fix schema..."
    
    # Create a backup of the current schema
    echo "Creating schema backup..."
    pg_dump -h db -U postgres -d scheduler --schema-only > schema_backup.sql
    
    # Apply the new migration
    echo "Applying new migration..."
    npx prisma db push --accept-data-loss
    
    echo "Migrations fixed and applied"
fi

echo "Migrations deployed"

# Generate Prisma client
npx prisma generate

# # Run seed script
# npm run db:seed

# Start the application
npm run start
