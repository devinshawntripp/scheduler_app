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
    
    # Apply the migration directly using psql
    echo "Applying migration directly..."
    PGPASSWORD=postgres psql -h db -U postgres -d scheduler -c "
        ALTER TABLE \"Booking\" ADD COLUMN IF NOT EXISTS \"customerEmail\" TEXT;
        UPDATE \"Booking\" SET \"customerEmail\" = 'no-email@example.com' WHERE \"customerEmail\" IS NULL;
        ALTER TABLE \"Booking\" ALTER COLUMN \"customerEmail\" SET NOT NULL;
    "
    
    # Mark migration as applied
    echo "Marking migration as applied..."
    npx prisma migrate resolve --applied 20240326_add_customer_email
    
    echo "Migration fixed and applied"
fi

echo "Migrations deployed"

# Generate Prisma client
npx prisma generate

# # Run seed script
# npm run db:seed

# Start the application
npm run start
