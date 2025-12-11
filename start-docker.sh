#!/bin/bash
# Start all Docker services

set -e

echo "🐳 Starting Docker services..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Load environment variables
if [ -f .env ]; then
    echo "📝 Loading environment variables from .env"
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start services
echo "🚀 Starting services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
timeout 60 bash -c 'until docker exec echo_postgres pg_isready -U user -d echo_db 2>/dev/null; do sleep 2; done' && echo "✅ PostgreSQL is ready" || echo "⚠️ PostgreSQL timeout"

# Wait for Redis
echo "Waiting for Redis..."
timeout 30 bash -c 'until docker exec echo_redis redis-cli ping 2>/dev/null | grep -q PONG; do sleep 2; done' && echo "✅ Redis is ready" || echo "⚠️ Redis timeout"

# Wait for Backend (if running)
if docker compose ps | grep -q "echo_backend.*Up"; then
    echo "Waiting for Backend..."
    timeout 60 bash -c 'until curl -s http://localhost:8000/health 2>/dev/null; do sleep 2; done' && echo "✅ Backend is ready" || echo "⚠️ Backend timeout"
fi

# Wait for Frontend (if running)
if docker compose ps | grep -q "echo_frontend.*Up"; then
    echo "Waiting for Frontend..."
    timeout 60 bash -c 'until curl -s http://localhost:3000 2>/dev/null; do sleep 2; done' && echo "✅ Frontend is ready" || echo "⚠️ Frontend timeout"
fi

echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "🎉 Services started!"
echo ""
echo "Available services:"
echo "  PostgreSQL: localhost:5432"
echo "  Redis:      localhost:6379"
echo "  Backend:    http://localhost:8000"
echo "  Frontend:   http://localhost:3000"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop:      docker compose down"
