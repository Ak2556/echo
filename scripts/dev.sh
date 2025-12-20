#!/bin/bash

echo "Starting Echo development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Start services
echo "Starting Docker services..."
docker-compose up -d postgres redis

echo "Waiting for services to be ready..."
sleep 5

echo ""
echo "✓ PostgreSQL is running on port 5432"
echo "✓ Redis is running on port 6379"
echo ""
echo "Next steps:"
echo "1. cd backend && uvicorn app.main:app --reload"
echo "2. cd frontend && npm run dev"
