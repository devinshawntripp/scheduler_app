#!/bin/sh

# Wait for the database to be ready
echo "Waiting for the database to be ready..."
until nc -z -v -w30 db 5432
do
  echo "Waiting for database connection..."
  sleep 1
done
echo "Database is up and running!"

# Run database migrations
echo "Running database migrations..."
npx prisma db push

# Start the application
echo "Starting the application..."
npm start
