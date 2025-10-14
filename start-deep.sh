#!/bin/bash

# 3DIoT Project - Deep Fix Startup Script
# For fixing database authentication issues and complete rebuild
# Use this when you encounter database connection problems

echo "🔧 Starting 3DIoT Project (Deep Fix Mode)..."

# Stop existing containers and remove volumes
echo "Stopping containers and removing volumes..."
docker compose down -v

# Clean up Docker system
echo "Cleaning up Docker system..."
docker system prune -f

# Build and start services with complete rebuild
echo "Building containers from scratch (this may take a while)..."
docker compose build --no-cache
echo "Starting services..."
docker compose up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 15

# Wait for app container to be ready
echo "Waiting for app container to be ready..."
until docker compose exec app echo "App container is ready" 2>/dev/null; do
    echo "Waiting for app container..."
    sleep 3
done

# Run database migrations
echo "Applying database migrations..."
docker compose exec --user root app npx prisma migrate deploy

# Restart app to apply migrations
echo "Restarting app to apply migrations..."
docker compose restart app

echo "✅ Project is running with deep fix applied!"
echo "🌐 Access your app at: http://localhost:3000"
echo "🗄️ PostgreSQL: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker compose logs -f"
echo "  Stop: docker compose down"
echo "  Quick restart: ./start.sh"
echo "  Deep fix again: ./start-deep.sh"
