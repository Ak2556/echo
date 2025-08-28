#!/bin/bash

echo "Cleaning project..."

# Clean frontend
if [ -d "frontend/node_modules" ]; then
    echo "Removing frontend/node_modules..."
    rm -rf frontend/node_modules
fi

if [ -d "frontend/.next" ]; then
    echo "Removing frontend/.next..."
    rm -rf frontend/.next
fi

# Clean backend
if [ -d "backend/__pycache__" ]; then
    echo "Removing backend/__pycache__..."
    find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
fi

if [ -d "backend/.pytest_cache" ]; then
    echo "Removing backend/.pytest_cache..."
    rm -rf backend/.pytest_cache
fi

# Clean Docker
echo "Cleaning Docker volumes..."
docker-compose down -v 2>/dev/null

echo "✓ Project cleaned successfully!"
