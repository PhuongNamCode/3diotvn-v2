#!/bin/bash

echo "🎬 3DIoT YouTube API Setup Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ File .env not found!${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Current YouTube API configuration:${NC}"
echo ""

# Show current values
echo "YOUTUBE_API_KEY: $(grep 'YOUTUBE_API_KEY=' .env | cut -d'=' -f2)"
echo "YOUTUBE_CLIENT_ID: $(grep 'YOUTUBE_CLIENT_ID=' .env | cut -d'=' -f2)"
echo "YOUTUBE_CLIENT_SECRET: $(grep 'YOUTUBE_CLIENT_SECRET=' .env | cut -d'=' -f2)"
echo ""

echo -e "${YELLOW}🔧 Setup Instructions:${NC}"
echo ""
echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable YouTube Data API v3"
echo "4. Create API Key and OAuth 2.0 credentials"
echo "5. Run this script with your credentials:"
echo ""
echo -e "${GREEN}   ./setup-youtube-api.sh YOUR_API_KEY YOUR_CLIENT_ID YOUR_CLIENT_SECRET${NC}"
echo ""

# If arguments provided, update .env
if [ $# -eq 3 ]; then
    API_KEY=$1
    CLIENT_ID=$2
    CLIENT_SECRET=$3
    
    echo -e "${BLUE}🔄 Updating .env file...${NC}"
    
    # Backup current .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    
    # Update values
    sed -i "s/YOUTUBE_API_KEY=.*/YOUTUBE_API_KEY=$API_KEY/" .env
    sed -i "s/YOUTUBE_CLIENT_ID=.*/YOUTUBE_CLIENT_ID=$CLIENT_ID/" .env
    sed -i "s/YOUTUBE_CLIENT_SECRET=.*/YOUTUBE_CLIENT_SECRET=$CLIENT_SECRET/" .env
    
    echo -e "${GREEN}✅ YouTube API configuration updated!${NC}"
    echo ""
    echo -e "${YELLOW}🚀 Next steps:${NC}"
    echo "1. Restart your development server:"
    echo "   npm run dev"
    echo ""
    echo "2. Test the configuration:"
    echo "   curl http://localhost:3002/api/videos"
    echo ""
    echo "3. Access admin dashboard:"
    echo "   http://localhost:3002/admin"
    echo "   Go to 'Video' tab"
    echo ""
else
    echo -e "${YELLOW}💡 Quick Setup Guide:${NC}"
    echo ""
    echo "Step 1: Create Google Cloud Project"
    echo "   - Visit: https://console.cloud.google.com/"
    echo "   - Create project: '3diot-video-streaming'"
    echo ""
    echo "Step 2: Enable YouTube Data API v3"
    echo "   - Go to 'APIs & Services' > 'Library'"
    echo "   - Search: 'YouTube Data API v3'"
    echo "   - Click 'Enable'"
    echo ""
    echo "Step 3: Create Credentials"
    echo "   - Go to 'APIs & Services' > 'Credentials'"
    echo "   - Create 'API Key'"
    echo "   - Create 'OAuth 2.0 Client ID'"
    echo "   - Set redirect URI: http://localhost:3000/auth/youtube/callback"
    echo ""
    echo "Step 4: Run this script with your keys"
    echo "   ./setup-youtube-api.sh YOUR_API_KEY YOUR_CLIENT_ID YOUR_CLIENT_SECRET"
    echo ""
fi

echo -e "${BLUE}📚 Documentation:${NC}"
echo "- YouTube Data API: https://developers.google.com/youtube/v3"
echo "- Google Cloud Console: https://console.cloud.google.com/"
echo "- 3DIoT Video System: Ready to use after API setup"
echo ""
