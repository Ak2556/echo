#!/bin/bash

echo "Setting up Echo project..."

# Create environment files if they don't exist
if [ ! -f frontend/.env.local ]; then
    echo "Creating frontend/.env.local..."
    cat > frontend/.env.local << 'ENVEOF'
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_NAME=Echo
ENVEOF
fi

if [ ! -f backend/.env ]; then
    echo "Creating backend/.env..."
    cat > backend/.env << 'ENVEOF'
DATABASE_URL=postgresql://user:password@localhost:5432/echo_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your_secret_key_here_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000
ENVEOF
fi

echo "Setup complete!"
echo "Next steps:"
echo "1. cd frontend && npm install"
echo "2. cd backend && pip install -r requirements.txt"
echo "3. Start the development servers"
