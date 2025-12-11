#!/bin/sh
# Health check script for backend service

set -e

# Check if the application is responding
curl -f http://localhost:8000/health || exit 1

echo "Backend health check passed"
exit 0
