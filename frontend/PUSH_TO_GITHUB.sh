#!/bin/bash

echo "🚀 Pushing Echo Frontend to GitHub..."
echo ""

# Check if authenticated
if ! gh auth status > /dev/null 2>&1; then
    echo "❌ Not authenticated with GitHub CLI"
    echo ""
    echo "Please run: gh auth login"
    echo "Then run this script again."
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Create repository and push
echo "📦 Creating repository on GitHub..."
gh repo create echo-frontend \
  --public \
  --description "A modern, feature-rich social platform built with Next.js 15, featuring 40+ premium UI components and 11 stunning themes" \
  --source=. \
  --remote=origin \
  --push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Repository created and pushed!"
    echo ""
    echo "🌐 View your repository at:"
    echo "   https://github.com/AK2556/echo-frontend"
    echo ""
    echo "📊 Verify:"
    echo "   - All 31 commits are visible"
    echo "   - v0.1.0 tag appears in releases"
    echo "   - README displays correctly"
else
    echo ""
    echo "❌ Failed to create repository"
    echo ""
    echo "Try manual method:"
    echo "1. Go to https://github.com/new"
    echo "2. Create repository named: echo-frontend"
    echo "3. Then run:"
    echo "   git remote add origin https://github.com/AK2556/echo-frontend.git"
    echo "   git push -u origin main --tags"
fi
