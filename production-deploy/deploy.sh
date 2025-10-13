#!/bin/bash

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

# Deploy containers
echo "📦 Deploying containers..."
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

# Run migrations
echo "🗄️ Running migrations..."
docker compose --env-file env.production exec --user root app npx prisma migrate deploy

# Restart app
echo "🔄 Restarting app..."
docker compose --env-file env.production restart app

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
