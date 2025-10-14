#!/bin/bash

# 3DIoT Project - Development Startup Script
# For normal development with code changes - fast build and startup

echo "🚀 Starting 3DIoT Project (Development Mode)..."

# Stop existing containers
echo "Stopping existing containers..."
docker compose down

# Build and start services (with build for code changes)
echo "Building and starting services..."
docker compose up -d --build

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Wait for app container to be ready
echo "Waiting for app container to be ready..."
until docker compose exec app echo "App container is ready" 2>/dev/null; do
    echo "Waiting for app container..."
    sleep 2
done

# Sync database schema (important for schema changes)
echo "Syncing database schema..."
docker compose exec --user root app npx prisma db push || echo "⚠️ Schema sync failed, continuing..."

echo "✅ Project is running!"
echo "🌐 Access your app at: http://localhost:3000"
echo "🗄️ PostgreSQL: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker compose logs -f"
echo "  Stop: docker compose down"
echo "  Restart: docker compose restart"
echo "  Deep fix: ./start-deep.sh"