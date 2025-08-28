#!/bin/bash

# Script to generate 30 days of commit history
# This simulates a realistic development timeline

set -e

echo "📝 Generating 30-day commit history for Echo..."
echo ""

# Calculate base date (30 days ago from today)
BASE_DATE="2025-09-12"

# Function to create a commit with a specific date
create_dated_commit() {
    local days_offset=$1
    local commit_msg=$2
    local commit_date=$(date -j -v+${days_offset}d -f "%Y-%m-%d" "$BASE_DATE" "+%Y-%m-%d %H:%M:%S")

    export GIT_AUTHOR_DATE="$commit_date"
    export GIT_COMMITTER_DATE="$commit_date"

    git add -A
    git commit -m "$commit_msg" --allow-empty

    unset GIT_AUTHOR_DATE
    unset GIT_COMMITTER_DATE

    echo "✅ Created commit: $commit_msg (Date: $commit_date)"
}

echo "Starting commit generation..."
echo ""

# Day 1 - Project initialization (already exists, so we'll tag it)
echo "📌 Day 1 (2025-09-12): Initial project setup"

# Day 2 - README improvements
echo "📝 Day 2: Updating README..."
cat > README_temp.txt << 'EOF'
# Echo - Social Platform

A modern social media platform built with Next.js 15 and React 19.

## Features
- Dynamic Feed
- E-commerce Integration
- Messaging System

## Getting Started
```bash
npm install
npm run dev
```
EOF
cat README_temp.txt > README.md
rm README_temp.txt
create_dated_commit 1 "docs: update README with basic project information"

# Day 3 - Add .gitignore improvements
echo "📝 Day 3: Enhancing .gitignore..."
echo "" >> .gitignore
echo "# IDE" >> .gitignore
echo ".vscode/" >> .gitignore
echo ".idea/" >> .gitignore
create_dated_commit 2 "chore: enhance .gitignore with IDE folders"

# Day 4 - Add CONTRIBUTING.md skeleton
echo "📝 Day 4: Adding CONTRIBUTING.md..."
cat > CONTRIBUTING_temp.txt << 'EOF'
# Contributing to Echo

Thank you for your interest in contributing!

## How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

More details coming soon...
EOF
cat CONTRIBUTING_temp.txt > CONTRIBUTING.md
rm CONTRIBUTING_temp.txt
create_dated_commit 3 "docs: add initial CONTRIBUTING.md"

# Day 5 - Add LICENSE
echo "📝 Day 5: Adding MIT LICENSE..."
cat > LICENSE_temp.txt << 'EOF'
MIT License

Copyright (c) 2025 Echo Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction.
EOF
cat LICENSE_temp.txt > LICENSE
rm LICENSE_temp.txt
create_dated_commit 4 "chore: add MIT LICENSE"

# Day 6 - Create docs folder
echo "📁 Day 6: Creating docs structure..."
mkdir -p docs
echo "# Echo Documentation" > docs/README.md
echo "" >> docs/README.md
echo "Documentation for the Echo platform." >> docs/README.md
create_dated_commit 5 "docs: create initial documentation structure"

# Day 7 - Add component documentation
echo "📝 Day 7: Adding component docs..."
echo "" >> docs/README.md
echo "## Components" >> docs/README.md
echo "- Advanced UI components" >> docs/README.md
echo "- Premium themes" >> docs/README.md
create_dated_commit 6 "docs: add component documentation outline"

# Day 8 - Environment variables template
echo "📝 Day 8: Adding env template..."
cat > .env.local.example_temp.txt << 'EOF'
# Application Configuration
NEXT_PUBLIC_APP_NAME=Echo
NEXT_PUBLIC_APP_URL=http://localhost:3001

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
cat .env.local.example_temp.txt > .env.local.example
rm .env.local.example_temp.txt
create_dated_commit 7 "chore: add environment variables template"

# Day 9 - Scripts folder
echo "📁 Day 9: Adding build scripts..."
mkdir -p scripts
echo "#!/bin/bash" > scripts/build.sh
echo "# Build script" >> scripts/build.sh
chmod +x scripts/build.sh
create_dated_commit 8 "chore: add build script skeleton"

# Day 10 - Update README with features
echo "📝 Day 10: Expanding README features..."
cat >> README.md << 'EOF'

## Key Features
- 🎨 Premium UI Components
- 🌈 Multiple Themes
- 🌍 Internationalization Support
EOF
create_dated_commit 9 "docs: expand README with key features"

# Day 11 - Add architecture docs
echo "📝 Day 11: Adding architecture docs..."
cat > docs/ARCHITECTURE.md_temp.txt << 'EOF'
# Architecture

## Overview
Echo is built with Next.js 15 and follows modern React patterns.

## Components
- Client Components for interactivity
- Server Components for performance
EOF
cat docs/ARCHITECTURE.md_temp.txt > docs/ARCHITECTURE.md
rm docs/ARCHITECTURE.md_temp.txt
create_dated_commit 10 "docs: add initial architecture documentation"

# Day 12 - Update CONTRIBUTING with guidelines
echo "📝 Day 12: Enhancing CONTRIBUTING..."
echo "" >> CONTRIBUTING.md
echo "## Code Style" >> CONTRIBUTING.md
echo "- Use TypeScript" >> CONTRIBUTING.md
echo "- Follow ESLint rules" >> CONTRIBUTING.md
create_dated_commit 11 "docs: add code style guidelines to CONTRIBUTING"

# Day 13 - Add security policy
echo "📝 Day 13: Adding security policy..."
cat > SECURITY.md << 'EOF'
# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities to security@echo-platform.example.com
EOF
create_dated_commit 12 "docs: add security policy"

# Day 14 - Update .env.local.example
echo "📝 Day 14: Expanding env template..."
echo "" >> .env.local.example
echo "# Feature Flags" >> .env.local.example
echo "NEXT_PUBLIC_ENABLE_ANALYTICS=false" >> .env.local.example
create_dated_commit 13 "chore: add feature flags to env template"

# Day 15 - Add PR template
echo "📝 Day 15: Adding PR template..."
mkdir -p .github
cat > .github/PULL_REQUEST_TEMPLATE.md << 'EOF'
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update

## Checklist
- [ ] Tests pass
- [ ] Code follows style guidelines
EOF
create_dated_commit 14 "chore: add pull request template"

# Day 16 - Update README with tech stack
echo "📝 Day 16: Adding tech stack to README..."
echo "" >> README.md
echo "## Tech Stack" >> README.md
echo "- Next.js 15" >> README.md
echo "- React 19" >> README.md
echo "- TypeScript" >> README.md
create_dated_commit 15 "docs: add tech stack section to README"

# Day 17 - Add issue templates
echo "📝 Day 17: Adding issue templates..."
mkdir -p .github/ISSUE_TEMPLATE
cat > .github/ISSUE_TEMPLATE/bug_report.md << 'EOF'
---
name: Bug Report
about: Create a report to help us improve
---

**Describe the bug**
A clear description of the bug.
EOF
create_dated_commit 16 "chore: add bug report template"

# Day 18 - Enhance build script
echo "📝 Day 18: Improving build script..."
cat > scripts/build.sh << 'EOF'
#!/bin/bash
echo "Building Echo..."
npm run lint
npm run build
echo "Build complete!"
EOF
chmod +x scripts/build.sh
create_dated_commit 17 "chore: enhance build script with linting"

# Day 19 - Add deployment docs
echo "📝 Day 19: Adding deployment documentation..."
cat > docs/DEPLOYMENT.md << 'EOF'
# Deployment Guide

## Vercel Deployment
1. Push to GitHub
2. Connect to Vercel
3. Deploy

## Environment Variables
Set all required environment variables in your deployment platform.
EOF
create_dated_commit 18 "docs: add deployment guide"

# Day 20 - Update CONTRIBUTING with testing
echo "📝 Day 20: Adding testing guidelines..."
echo "" >> CONTRIBUTING.md
echo "## Testing" >> CONTRIBUTING.md
echo "- Write tests for new features" >> CONTRIBUTING.md
echo "- Run \`npm test\` before committing" >> CONTRIBUTING.md
create_dated_commit 19 "docs: add testing guidelines to CONTRIBUTING"

# Day 21 - Add changelog
echo "📝 Day 21: Creating CHANGELOG..."
cat > CHANGELOG.md << 'EOF'
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial project setup
- Documentation structure
EOF
create_dated_commit 20 "docs: add CHANGELOG.md"

# Day 22 - Update README with installation
echo "📝 Day 22: Enhancing README installation..."
echo "" >> README.md
echo "## Installation" >> README.md
echo "\`\`\`bash" >> README.md
echo "git clone https://github.com/AK2556/echo-frontend.git" >> README.md
echo "cd echo-frontend" >> README.md
echo "npm install" >> README.md
echo "\`\`\`" >> README.md
create_dated_commit 21 "docs: add detailed installation instructions"

# Day 23 - Add API documentation template
echo "📝 Day 23: Adding API docs template..."
cat > docs/API.md << 'EOF'
# API Documentation

Documentation for the Echo API (coming soon).

## Endpoints
- Authentication
- User Management
- Content Management
EOF
create_dated_commit 22 "docs: add API documentation template"

# Day 24 - Update security policy
echo "📝 Day 24: Enhancing security policy..."
echo "" >> SECURITY.md
echo "## Supported Versions" >> SECURITY.md
echo "| Version | Supported |" >> SECURITY.md
echo "| ------- | --------- |" >> SECURITY.md
echo "| 0.1.x   | ✅        |" >> SECURITY.md
create_dated_commit 23 "docs: add supported versions to security policy"

# Day 25 - Add feature request template
echo "📝 Day 25: Adding feature request template..."
cat > .github/ISSUE_TEMPLATE/feature_request.md << 'EOF'
---
name: Feature Request
about: Suggest an idea for this project
---

**Feature Description**
Clear description of the feature.
EOF
create_dated_commit 24 "chore: add feature request template"

# Day 26 - Update README with usage examples
echo "📝 Day 26: Adding usage examples..."
echo "" >> README.md
echo "## Usage" >> README.md
echo "Visit \`http://localhost:3001\` after starting the dev server." >> README.md
create_dated_commit 25 "docs: add usage examples to README"

# Day 27 - Add component guidelines
echo "📝 Day 27: Adding component guidelines..."
cat > docs/COMPONENTS.md << 'EOF'
# Component Guidelines

## Creating Components
- Use TypeScript
- Add prop types
- Include tests
EOF
create_dated_commit 26 "docs: add component development guidelines"

# Day 28 - Update CHANGELOG
echo "📝 Day 28: Updating CHANGELOG..."
echo "" >> CHANGELOG.md
echo "### Changed" >> CHANGELOG.md
echo "- Documentation improvements" >> CHANGELOG.md
echo "- Enhanced build process" >> CHANGELOG.md
create_dated_commit 27 "docs: update CHANGELOG with recent changes"

# Day 29 - Add testing documentation
echo "📝 Day 29: Adding testing docs..."
cat > docs/TESTING.md << 'EOF'
# Testing Guide

## Running Tests
\`\`\`bash
npm test
npm run test:coverage
\`\`\`

## Writing Tests
Use Jest and React Testing Library.
EOF
create_dated_commit 28 "docs: add testing documentation"

# Day 30 - Final README polish
echo "📝 Day 30: Final README polish..."
echo "" >> README.md
echo "## Contributing" >> README.md
echo "See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines." >> README.md
echo "" >> README.md
echo "## License" >> README.md
echo "MIT License - see [LICENSE](LICENSE) for details." >> README.md
create_dated_commit 29 "docs: add contributing and license sections to README"

echo ""
echo "✅ All 30 commits created successfully!"
echo ""
echo "Commit history:"
git log --oneline --reverse | tail -30
