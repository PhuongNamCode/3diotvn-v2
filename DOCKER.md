# 🐳 Docker Setup - 3DIoT Project

## Quick Start

```bash
# Start everything
./start.sh

# Or manually:
docker compose up -d --build
```

## Access Points

- **App:** http://localhost:3000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

## Commands

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Restart services
docker compose restart

# Run migrations
docker compose exec --user root app npx prisma migrate deploy

# Access database
docker compose exec postgres psql -U postgres -d web

# Access Redis
docker compose exec redis redis-cli
```

## Files Structure

```
├── docker-compose.yml    # Main compose file
├── Dockerfile           # App Dockerfile
├── start.sh             # Quick start script
└── DOCKER.md            # This file
```

That's it! Simple and clean. 🎉
