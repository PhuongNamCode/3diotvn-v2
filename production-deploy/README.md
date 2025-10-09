# 3DIoT Production Deployment

## Files in this folder:
- `docker-compose.yml` - Docker services configuration
- `Caddyfile` - Caddy reverse proxy configuration
- `env.production` - Environment variables (fill in your values)
- `deploy.sh` - Deployment script

## Quick Deploy:

1. **Fill in env.production** with your actual values
2. **Upload files to VPS:**
   ```bash
   scp -r production-deploy/* root@221.132.33.174:/opt/3diot/
   ```

3. **On VPS, deploy:**
   ```bash
   cd /opt/3diot
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Manual Deploy:
```bash
# Update Caddy
cp Caddyfile /etc/caddy/Caddyfile
systemctl reload caddy

# Deploy containers
docker compose --env-file env.production up -d

# Run migrations
docker compose --env-file env.production exec --user root app npx prisma migrate deploy
```

docker pull phuongnamdocker/3diot-app:latest
docker compose restart app

That's it! 🚀


