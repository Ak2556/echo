#!/bin/bash

echo "🛑 Stopping Echo Application..."

# Kill backend
if [ -f backend.pid ]; then
    BACKEND_PID=$(cat backend.pid)
    if kill $BACKEND_PID 2>/dev/null; then
        echo "✅ Backend stopped"
    fi
    rm backend.pid
fi

# Kill frontend
if [ -f frontend.pid ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill $FRONTEND_PID 2>/dev/null; then
        echo "✅ Frontend stopped"
    fi
    rm frontend.pid
fi

# Stop Redis container
if docker ps | grep -q echo-redis; then
    docker stop echo-redis > /dev/null
    echo "✅ Redis stopped"
fi

echo "🎉 Echo Application stopped successfully!"
