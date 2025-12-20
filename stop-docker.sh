#!/bin/bash
# Stop all Docker services

set -e

echo "🛑 Stopping Docker services..."
echo ""

# Stop services
docker compose down

echo ""
echo "✅ Services stopped"
echo ""
echo "To remove volumes as well: docker compose down -v"
echo "To clean everything:       docker compose down -v --remove-orphans"
