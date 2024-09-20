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

# Deploy migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Run seed script
npm run db:seed

# Start the application
npm run start
