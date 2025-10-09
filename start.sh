#!/bin/bash

echo "🚀 Starting 3DIoT Project..."

# Stop existing containers
echo "Stopping existing containers..."
docker compose down

# Build and start services
echo "Building and starting services..."
docker compose up -d --build

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker compose exec --user root app npx prisma migrate deploy

# Restart app to apply migrations
echo "Restarting app..."
docker compose restart app

echo "✅ Project is running!"
echo "🌐 Access your app at: http://localhost:3000"
echo "🗄️ PostgreSQL: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker compose logs -f"
echo "  Stop: docker compose down"
echo "  Restart: docker compose restart"
