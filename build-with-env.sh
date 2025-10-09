#!/bin/bash

echo "🚀 Building 3DIoT with .env file..."

# Build image (no cache to ensure fresh build)
echo "🔨 Building Docker image..."
docker build --no-cache -t phuongnamdocker/3diot-app:latest .

# Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push phuongnamdocker/3diot-app:latest

echo "✅ Build and push completed!"
echo "📋 Next steps on VPS:"
echo "   cd /opt/3diot"
echo "   docker pull phuongnamdocker/3diot-app:latest"
echo "   docker compose --env-file env.production up -d"
