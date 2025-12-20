# Quick Start Guide - Testing CI/CD Pipeline

This guide will help you test the enhanced CI/CD pipeline locally before pushing to GitHub.

---

## Prerequisites

- ✅ Docker Desktop (start it before proceeding)
- ✅ Node.js v20+ installed
- ✅ Python 3.11+ installed
- ✅ Git repository initialized

---

## Step 1: Verify Environment

```bash
# Check Docker is running
docker --version
docker compose version

# Check Node.js
node --version
npm --version

# Check Python
python --version

# Navigate to project
cd C:\Users\A.P\OneDrive\Desktop\echo-main
```

---

## Step 2: Install Dependencies

```bash
# Using Makefile (recommended)
make install

# Or manually:
# Frontend
cd frontend && npm ci && cd ..

# Backend
cd backend && pip install -r requirements.txt && cd ..
```

---

## Step 3: Run Local CI Checks

### Option A: Full CI Pipeline (Recommended)
```bash
make ci-local
```

This runs:
1. Dependency installation
2. Linting (frontend & backend)
3. Tests (frontend & backend)
4. Builds (frontend & backend)

### Option B: Individual Checks

**Linting:**
```bash
make lint
```

**Tests:**
```bash
make test
```

**Build:**
```bash
make build
```

**Code Formatting:**
```bash
make format
```

---

## Step 4: Validate Docker Configuration

```bash
# Validate docker-compose.yml
docker compose config

# Should output the full configuration without errors
```

---

## Step 5: Build Docker Images

**IMPORTANT:** Start Docker Desktop first!

```bash
# Build all services
docker compose build

# Or build individually:
docker compose build postgres
docker compose build redis
docker compose build backend
docker compose build frontend
```

**Expected output:**
- PostgreSQL: Pulls postgres:15-alpine
- Redis: Pulls redis:7-alpine
- Backend: Builds Python application
- Frontend: Builds Next.js application

---

## Step 6: Start Services

```bash
# Start all services
make start
# OR
docker compose up -d

# Check status
docker compose ps

# All services should show as "healthy" after ~1-2 minutes
```

**Expected healthy services:**
```
NAME              STATUS
echo_postgres     Up (healthy)
echo_redis        Up (healthy)
echo_backend      Up (healthy)
echo_frontend     Up (healthy)
```

---

## Step 7: Health Checks

```bash
# Using Makefile
make health

# Or manually:
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000

# PostgreSQL
docker exec echo_postgres pg_isready -U user -d echo_db

# Redis
docker exec echo_redis redis-cli ping
```

**Expected responses:**
- Backend: JSON with status
- Frontend: HTML content
- PostgreSQL: "accepting connections"
- Redis: "PONG"

---

## Step 8: View Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs backend
docker compose logs frontend

# Follow logs
make docker-logs
# OR
docker compose logs -f
```

---

## Step 9: Test API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# API documentation (if available)
curl http://localhost:8000/docs

# Frontend home
curl http://localhost:3000
```

Open in browser:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs (if FastAPI)

---

## Step 10: Stop Services

```bash
# Stop services
make stop
# OR
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v

# Full cleanup
make docker-clean
```

---

## Troubleshooting

### Issue: Docker Desktop Not Running

**Error:**
```
failed to connect to the docker API
```

**Solution:**
1. Start Docker Desktop
2. Wait for it to fully start (green icon in system tray)
3. Retry docker commands

### Issue: Port Already in Use

**Error:**
```
Bind for 0.0.0.0:3000 failed: port is already allocated
```

**Solution:**
```bash
# Find and stop process using port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Issue: Health Check Failing

**Symptoms:**
- Service shows as "unhealthy"
- Container restarts repeatedly

**Solution:**
```bash
# Check logs
docker compose logs <service_name>

# Check if app is running
docker exec <container_name> ps aux

# Check health endpoint manually
docker exec echo_backend curl http://localhost:8000/health
```

### Issue: Build Failing

**Error:**
```
ERROR: failed to solve: process "/bin/sh -c..." did not complete
```

**Solution:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker compose build --no-cache

# Check Dockerfile syntax
docker build -f backend/Dockerfile backend
```

### Issue: Node Modules Issues

**Error:**
```
Cannot find module '...'
```

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## CI/CD Pipeline Test Checklist

Before pushing to GitHub, verify:

- [ ] `make lint` passes
- [ ] `make test` passes (or shows expected failures)
- [ ] `make build` completes successfully
- [ ] `docker compose config` validates
- [ ] `docker compose build` succeeds for all services
- [ ] `docker compose up -d` starts all services
- [ ] All services show as "healthy" in `docker compose ps`
- [ ] Health endpoints respond correctly
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:8000
- [ ] Logs show no critical errors

---

## GitHub Actions Testing

### Push to Branch

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "enhance: Update CI/CD pipeline with improvements"
   ```

2. **Push to develop branch:**
   ```bash
   git checkout -b feature/cicd-enhancement
   git push origin feature/cicd-enhancement
   ```

3. **Monitor GitHub Actions:**
   - Go to GitHub → Actions tab
   - Watch workflow runs
   - Check for any failures

### Create Pull Request

1. Create PR from feature branch to develop
2. Wait for all checks to pass
3. Review workflow results
4. Merge if all green

### Expected GitHub Actions Results

**On PR:**
- ✅ Frontend Tests (Node 20.x, 22.x)
- ✅ Backend Tests (Python 3.11, 3.12)
- ✅ Security Scanning
- ✅ Code Quality

**On Merge to Develop:**
- ✅ All PR checks
- ✅ E2E Tests
- ✅ Docker Build
- ✅ Deploy to Staging

---

## Performance Expectations

### Build Times (First Run)
- Frontend: 3-5 minutes
- Backend: 2-3 minutes
- Docker Images: 5-10 minutes
- Total: ~15-20 minutes

### Build Times (With Cache)
- Frontend: 1-2 minutes
- Backend: 1 minute
- Docker Images: 2-3 minutes
- Total: ~5-8 minutes

### Service Startup
- PostgreSQL: 10-15 seconds
- Redis: 5-10 seconds
- Backend: 20-30 seconds
- Frontend: 30-60 seconds
- Total: ~1-2 minutes until all healthy

---

## Next Steps

1. ✅ Test locally (this guide)
2. ⏭️ Commit and push changes
3. ⏭️ Monitor GitHub Actions
4. ⏭️ Create PR to main
5. ⏭️ Deploy to staging
6. ⏭️ Run smoke tests
7. ⏭️ Deploy to production

---

## Useful Commands Reference

### Make Commands
```bash
make help          # Show all available commands
make install       # Install dependencies
make test          # Run tests
make lint          # Run linters
make format        # Format code
make build         # Build applications
make clean         # Clean build artifacts
make ci-local      # Run full CI pipeline
make start         # Start services
make stop          # Stop services
make health        # Check service health
make docker-logs   # View Docker logs
make security      # Run security scans
make perf          # Performance checks
```

### Docker Commands
```bash
docker compose build           # Build images
docker compose up -d           # Start in background
docker compose down            # Stop services
docker compose ps              # Show status
docker compose logs            # View logs
docker compose logs -f         # Follow logs
docker compose restart         # Restart services
docker compose exec backend sh # Shell into container
```

---

**Ready to Deploy?** Follow the CI_CD_VALIDATION_REPORT.md for deployment checklist!
