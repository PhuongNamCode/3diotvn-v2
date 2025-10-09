#!/bin/bash

echo "🚀 Deploying 3DIoT to Production..."

# Backup Caddy config
echo "💾 Backing up Caddy config..."
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d_%H%M%S)

# Update Caddy config
echo "🔧 Updating Caddy config..."
cp Caddyfile /etc/caddy/Caddyfile
systemctl reload caddy

# Deploy containers
echo "📦 Deploying containers..."
docker compose --env-file env.production up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 15

# Run migrations
echo "🗄️ Running migrations..."
docker compose --env-file env.production exec --user root app npx prisma migrate deploy

# Restart app
echo "🔄 Restarting app..."
docker compose --env-file env.production restart app

echo "✅ Deployment completed!"
echo "🌐 Check your app at: https://3diot.vn"
