#!/bin/sh
echo "Starting entrypoint.sh"
# Wait for the database to be ready
echo "Waiting for the database to be ready..."
until nc -z -v -w30 db 5432
do
  echo "Waiting for database connection..."
  sleep 1
done
echo "Database is up and running!"

# Reset the database (this will drop all tables and recreate them)
npx prisma db push --force-reset

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Run seed script
npm run db:seed

# Start the application
npm run start
