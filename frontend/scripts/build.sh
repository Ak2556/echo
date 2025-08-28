#!/bin/bash

# Echo Frontend Build Script
# This script handles the production build process

set -e  # Exit on error

echo "🚀 Starting Echo Frontend Build Process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f 2 | cut -d'.' -f 1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Error: Node.js v20 or higher is required${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi
echo -e "${GREEN}✅ Node.js version OK: $(node -v)${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Running npm install...${NC}"
    npm install
    echo ""
fi

# Run linter
echo "🔍 Running ESLint..."
npm run lint || {
    echo -e "${RED}❌ Linting failed. Please fix errors before building.${NC}"
    exit 1
}
echo -e "${GREEN}✅ Linting passed${NC}"
echo ""

# Run tests
echo "🧪 Running tests..."
npm run test:ci || {
    echo -e "${RED}❌ Tests failed. Please fix failing tests before building.${NC}"
    exit 1
}
echo -e "${GREEN}✅ All tests passed${NC}"
echo ""

# Clean previous build
if [ -d ".next" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf .next
    echo -e "${GREEN}✅ Previous build cleaned${NC}"
    echo ""
fi

# Build the application
echo "🏗️  Building production bundle..."
npm run build || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}
echo ""

# Display build info
if [ -d ".next" ]; then
    BUILD_SIZE=$(du -sh .next | cut -f1)
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
    echo "📦 Build size: $BUILD_SIZE"
else
    echo -e "${RED}❌ Build directory not found${NC}"
    exit 1
fi

echo ""
echo "🎉 Build process completed!"
echo ""
echo "To start the production server, run:"
echo "  npm run start"
