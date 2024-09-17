#!/bin/bash
echo "Starting entrypoint.sh"
# Wait for the database to be ready
./wait-for-it.sh db:5432 -t 60

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
