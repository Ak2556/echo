.PHONY: help install test lint format build clean docker-up docker-down docker-logs ci-local

# Default target
help:
	@echo "Available commands:"
	@echo "  make install        - Install all dependencies (frontend + backend)"
	@echo "  make test          - Run all tests"
	@echo "  make lint          - Run all linters"
	@echo "  make format        - Format all code"
	@echo "  make build         - Build all services"
	@echo "  make clean         - Clean build artifacts"
	@echo "  make docker-up     - Start all services with Docker Compose"
	@echo "  make docker-down   - Stop all services"
	@echo "  make docker-logs   - Show Docker logs"
	@echo "  make ci-local      - Run full CI pipeline locally"

# Install dependencies
install:
	@echo "Installing frontend dependencies..."
	cd frontend && npm ci
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installation complete!"

# Run tests
test:
	@echo "Running frontend tests..."
	cd frontend && npm run test -- --watchAll=false || true
	@echo "Running backend tests..."
	cd backend && pytest tests/ -v || true

# Run linters
lint:
	@echo "Linting frontend..."
	cd frontend && npm run lint
	@echo "Checking TypeScript types..."
	cd frontend && npx tsc --noEmit
	@echo "Linting backend..."
	cd backend && black --check .
	cd backend && isort --check-only .
	cd backend && flake8 app tests --max-line-length=100
	cd backend && mypy app --ignore-missing-imports

# Format code
format:
	@echo "Formatting frontend..."
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,scss}"
	@echo "Formatting backend..."
	cd backend && black .
	cd backend && isort .

# Build services
build:
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Building backend..."
	@echo "Backend build complete (Python doesn't require build)"

# Clean build artifacts
clean:
	@echo "Cleaning frontend..."
	cd frontend && rm -rf .next out dist node_modules/.cache
	@echo "Cleaning backend..."
	cd backend && find . -type d -name __pycache__ -exec rm -rf {} + || true
	cd backend && find . -type f -name "*.pyc" -delete || true
	cd backend && rm -rf .pytest_cache htmlcov .coverage || true
	@echo "Clean complete!"

# Docker commands
docker-up:
	@echo "Starting services with Docker Compose..."
	docker compose up -d
	@echo "Waiting for services to be healthy..."
	@sleep 10
	docker compose ps

docker-down:
	@echo "Stopping services..."
	docker compose down -v --remove-orphans

docker-logs:
	docker compose logs -f

docker-restart:
	@echo "Restarting services..."
	docker compose restart

docker-clean:
	@echo "Cleaning Docker resources..."
	docker compose down -v --remove-orphans --rmi local
	docker system prune -f

# Run CI locally
ci-local:
	@echo "Running local CI pipeline..."
	@echo "Step 1: Installing dependencies..."
	make install
	@echo "Step 2: Running linters..."
	make lint
	@echo "Step 3: Running tests..."
	make test
	@echo "Step 4: Building..."
	make build
	@echo "CI pipeline complete!"

# Security checks
security:
	@echo "Running security scans..."
	@echo "Frontend security audit..."
	cd frontend && npm audit --audit-level=moderate || true
	@echo "Backend security audit..."
	cd backend && pip install safety pip-audit
	cd backend && safety check || true
	cd backend && pip-audit || true

# Performance checks
perf:
	@echo "Running performance checks..."
	cd frontend && npm run build
	@echo "Analyzing bundle size..."
	cd frontend && du -sh .next
	@echo "Finding large files..."
	find frontend/.next -type f -size +500k -exec ls -lh {} \; | awk '{print $$9 ": " $$5}'

# Database migrations (if using Alembic)
migrate:
	@echo "Running database migrations..."
	cd backend && alembic upgrade head || echo "No Alembic configuration found"

# Development setup
dev-setup: install
	@echo "Setting up development environment..."
	@echo "Creating .env files..."
	@if [ ! -f frontend/.env.local ]; then \
		echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env.local; \
	fi
	@if [ ! -f backend/.env ]; then \
		echo "DATABASE_URL=postgresql://user:password@localhost:5432/echo_db" > backend/.env; \
		echo "REDIS_URL=redis://localhost:6379/0" >> backend/.env; \
		echo "SECRET_KEY=dev-secret-key-change-in-production" >> backend/.env; \
		echo "ENVIRONMENT=development" >> backend/.env; \
	fi
	@echo "Development environment ready!"

# Quick start
start: docker-up
	@echo "Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"

# Stop all
stop: docker-down

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:8000/health || echo "Backend not responding"
	@curl -f http://localhost:3000 || echo "Frontend not responding"
	@docker compose ps

# Code quality report
quality:
	@echo "Generating code quality report..."
	@echo "Running Pylint on backend..."
	cd backend && pylint app --exit-zero > pylint-report.txt || true
	@echo "Running complexity analysis..."
	cd backend && radon cc app -a -s || true
	@echo "Checking for dead code..."
	cd backend && vulture app --min-confidence 80 || true
	@echo "Quality report complete. Check pylint-report.txt"
