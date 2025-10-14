#!/bin/bash

# 3DIoT Production Deployment Script
# This script rebuilds containers to avoid database authentication issues
# that can occur when environment variables change or Prisma client is outdated

# Exit on any error
set -e

echo "🚀 Deploying 3DIoT to Production..."

# Backup Caddy config
echo "💾 Backing up Caddy config..."
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d_%H%M%S)

# Update Caddy config
echo "🔧 Updating Caddy config..."
cp Caddyfile /etc/caddy/Caddyfile
systemctl reload caddy

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker compose --env-file env.production down

# Pull latest images
echo "📥 Pulling latest images..."
docker compose --env-file env.production pull

# Remove unused images and containers
echo "🧹 Cleaning up unused resources..."
docker system prune -f

# Deploy containers with deep rebuild to ensure clean state
echo "📦 Building containers from scratch (production deep fix)..."
docker compose --env-file env.production build --no-cache
echo "📦 Starting containers..."
docker compose --env-file env.production up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 15

# Check database connection
echo "🔍 Checking database connection..."
until docker compose --env-file env.production exec -T db pg_isready -U postgres; do
    echo "Waiting for database..."
    sleep 2
done

# Wait for app container to be ready
echo "⏳ Waiting for app container to be ready..."
until docker compose --env-file env.production exec app echo "App container is ready" 2>/dev/null; do
    echo "Waiting for app container..."
    sleep 3
done

# Run database migrations (production safety)
echo "🗄️ Running database migrations..."
docker compose --env-file env.production exec --user root app npx prisma migrate deploy || echo "⚠️ Migration failed, continuing..."

# Sync database schema (fallback for schema changes)
echo "🔄 Syncing database schema..."
docker compose --env-file env.production exec --user root app npx prisma db push || echo "⚠️ Schema sync failed, continuing..."

# No need to restart app since Prisma client is already generated during build

# Health check
echo "🏥 Performing health check..."
sleep 10
if curl -f -s https://3diot.vn > /dev/null; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed! App may not be running properly."
    exit 1
fi

echo "✅ Deployment completed!"
echo "🌐 Check your app at: https://3diot.vn"
