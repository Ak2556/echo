#!/bin/bash
# Check health of all Docker services

echo "🏥 Docker Services Health Check"
echo "================================"
echo ""

# PostgreSQL
echo "PostgreSQL:"
if docker exec echo_postgres pg_isready -U user -d echo_db 2>/dev/null; then
    echo "  ✅ Status: Healthy"
    VERSION=$(docker exec echo_postgres psql -U user -d echo_db -t -c "SELECT version();" 2>/dev/null | head -1 | xargs)
    echo "  📦 Version: $VERSION"
else
    echo "  ❌ Status: Unhealthy or not running"
fi
echo ""

# Redis
echo "Redis:"
if docker exec echo_redis redis-cli ping 2>/dev/null | grep -q PONG; then
    echo "  ✅ Status: Healthy"
    VERSION=$(docker exec echo_redis redis-cli INFO SERVER 2>/dev/null | grep redis_version | cut -d: -f2 | tr -d '\r')
    echo "  📦 Version: $VERSION"
    MEMORY=$(docker exec echo_redis redis-cli INFO MEMORY 2>/dev/null | grep used_memory_human | cut -d: -f2 | tr -d '\r')
    echo "  💾 Memory: $MEMORY"
else
    echo "  ❌ Status: Unhealthy or not running"
fi
echo ""

# Backend
echo "Backend:"
if curl -s http://localhost:8000/health 2>/dev/null | grep -q .; then
    echo "  ✅ Status: Healthy"
    echo "  🌐 URL: http://localhost:8000"
elif docker compose ps | grep -q "echo_backend.*Up"; then
    echo "  ⚠️ Status: Running but not responding"
else
    echo "  ❌ Status: Not running"
fi
echo ""

# Frontend
echo "Frontend:"
if curl -s http://localhost:3000 2>/dev/null | grep -q .; then
    echo "  ✅ Status: Healthy"
    echo "  🌐 URL: http://localhost:3000"
elif docker compose ps | grep -q "echo_frontend.*Up"; then
    echo "  ⚠️ Status: Running but not responding"
else
    echo "  ❌ Status: Not running"
fi
echo ""

echo "================================"
echo "Docker Compose Status:"
echo ""
docker compose ps
