# 3DIoT Project Startup Guide

## 🚀 Quick Start Scripts

### 1. **start.sh** - Development Mode (Recommended for daily use)
```bash
./start.sh
```

**Use when:**
- ✅ Normal development work
- ✅ Daily startup with code changes
- ✅ Regular development cycle
- ⚡ **Fast build and startup** (~1-2 minutes)

**What it does:**
- Stops existing containers
- Builds and starts services (with `--build`)
- Waits for database to be ready
- Applies your code changes
- Ready to use in ~1-2 minutes

---

### 2. **start-deep.sh** - Deep Fix Mode (For troubleshooting)
```bash
./start-deep.sh
```

**Use when:**
- ❌ Database authentication errors
- ❌ Environment variable changes
- ❌ Prisma client issues
- ❌ Any connection problems
- 🔧 **Complete rebuild** (takes 3-5 minutes)

**What it does:**
- Stops containers and removes volumes
- Cleans up Docker system
- Rebuilds containers from scratch
- Applies database migrations
- Ensures clean state

---

## 🎯 When to Use Which Script?

| Situation | Script | Time |
|-----------|--------|------|
| Daily development with code changes | `./start.sh` | ~1-2 minutes |
| First time setup | `./start-deep.sh` | ~3-5 minutes |
| Database errors | `./start-deep.sh` | ~3-5 minutes |
| Environment changes | `./start-deep.sh` | ~3-5 minutes |
| Code changes only | `./start.sh` | ~1-2 minutes |

---

## 📋 Other Commands

```bash
# View logs
docker compose logs -f

# Stop everything
docker compose down

# Restart without rebuild
docker compose restart

# Check status
docker compose ps
```

---

## 🔧 Production Deployment

For production deployment, use:
```bash
./production-deploy/deploy.sh
```

This automatically uses deep fix mode for production stability.

---

## 💡 Tips

- **Use `./start.sh` for daily development** - it builds your code changes
- **Use `./start-deep.sh` only when needed** - it takes longer but fixes everything
- **Both scripts build your code** - the difference is in database handling
- **Keep both scripts handy** - you'll need both depending on the situation
