#!/bin/bash

echo "🚀 Updating 3DIoT Production..."

# Build new image
echo "🔨 Building new image..."
docker build -t phuongnamdocker/3diot-app:latest .

# Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push phuongnamdocker/3diot-app:latest

echo "✅ Build and push completed!"
echo "📋 Next steps on VPS:"
echo "   cd /opt/3diot"
echo "   docker pull phuongnamdocker/3diot-app:latest"
echo "   docker compose restart app"
echo "   # Important: Sync database schema after deployment"
echo "   docker compose exec --user root app npx prisma db push"
