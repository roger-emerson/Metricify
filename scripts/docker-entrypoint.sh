#!/bin/sh
# Docker Entrypoint Script
# Initializes the database schema before starting the application

set -e

echo "🚀 Metricify Docker Entrypoint"
echo "==============================="

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h postgres -U metricify_user; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run database initialization
echo "📊 Initializing database schema..."
if npm run db:init; then
  echo "✅ Database schema initialized successfully!"
else
  echo "⚠️  Database initialization failed or already exists"
fi

# Start the Next.js application
echo "🚀 Starting Metricify..."
exec "$@"
