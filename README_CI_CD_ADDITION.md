# CI/CD and Development Setup
## Add this section to the main README.md

---

## 🚀 Quick Start for Developers

### Prerequisites
- **Node.js**: 18.x or 20.x
- **Python**: 3.11 or 3.12
- **Docker**: Latest version (recommended for backend)
- **PostgreSQL**: 15+ (or use Docker)
- **Redis**: 7+ (or use Docker)

### One-Command Setup (with Docker)
```bash
# Clone the repository
git clone https://github.com/your-org/echo.git
cd echo

# Start all services with Docker
docker-compose up -d

# Install frontend dependencies
cd frontend && npm install --legacy-peer-deps

# Open the app
open http://localhost:3000
```

---

## 💻 Local Development Setup

### Frontend (Next.js/TypeScript)

#### 1. Install Dependencies
```bash
cd frontend
npm install --legacy-peer-deps  # Required for React 19 compatibility
```

#### 2. Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
# Add other variables as needed
```

#### 3. Run Development Server
```bash
npm run dev
# Opens on http://localhost:3000
```

#### 4. Run Tests
```bash
# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run CI mode (no watch)
npm run test:ci
```

#### 5. Lint and Type Check
```bash
# Linting
npm run lint

# Fix linting issues automatically
npm run lint -- --fix

# Type checking
npx tsc --noEmit
```

#### 6. Build for Production
```bash
npm run build
npm start
```

**Expected Test Results**:
- ✅ 415 tests passing
- ✅ Coverage: 98% statements, 92% branches, 100% functions
- ✅ Zero ESLint errors

---

### Backend (Python/FastAPI)

#### Option 1: Docker (Recommended)
```bash
cd backend
docker-compose up -d

# View logs
docker-compose logs -f api
```

#### Option 2: Local Python Environment

##### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

##### 2. Install Dependencies
```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Install development dependencies
pip install pytest pytest-cov pytest-asyncio pytest-timeout black isort flake8 mypy
```

##### 3. Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/echo_dev
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=echo_dev

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-at-least-32-characters-long
JWT_SECRET_KEY=your-jwt-secret-key

# Environment
ENVIRONMENT=development
DEBUG=True
```

##### 4. Database Setup
```bash
# Start PostgreSQL and Redis (with Docker)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password --name echo-postgres postgres:15-alpine
docker run -d -p 6379:6379 --name echo-redis redis:7-alpine

# Run migrations
alembic upgrade head
```

##### 5. Run Development Server
```bash
# Using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using the main.py script
python main.py
```

API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

##### 6. Run Tests
```bash
# Ensure test database is available
export DATABASE_URL=postgresql+asyncpg://test_user:test_password@localhost:5432/test_db
export REDIS_URL=redis://localhost:6379/0

# Run all tests with coverage
pytest tests/ -v --cov=app --cov-report=html --cov-report=term-missing

# Run specific test file
pytest tests/test_auth.py -v

# Run with markers
pytest -m unit           # Only unit tests
pytest -m integration    # Only integration tests
pytest -m "not slow"     # Skip slow tests
```

**Expected Test Results**:
- ✅ All tests passing
- ✅ Coverage >= 80%

##### 7. Code Quality Checks
```bash
# Format code with Black
black . --check          # Check only
black .                  # Format files

# Sort imports with isort
isort . --check          # Check only
isort .                  # Sort imports

# Lint with flake8
flake8 app tests --max-line-length=100 --exclude=__pycache__,migrations

# Type check with mypy
mypy app --ignore-missing-imports --strict-optional
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

The project uses GitHub Actions for continuous integration and deployment:

#### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)
Runs on every push and pull request:
- ✅ Frontend Tests (Node 18.x, 20.x)
- ✅ Backend Tests (Python 3.11, 3.12)
- ✅ Security Scanning (Trivy, npm audit, pip-audit)
- ✅ E2E Tests (Playwright)
- ✅ Docker Builds
- ✅ Deployments (Staging/Production)

#### 2. Code Quality (`.github/workflows/code-quality.yml`)
- ✅ ESLint, Prettier, TypeScript checks
- ✅ Pylint, Bandit, Radon complexity analysis
- ✅ SonarCloud integration
- ✅ Dependency audits
- ✅ License compliance

### Running CI Checks Locally

#### Frontend CI Commands
```bash
cd frontend

# 1. Linting (with zero warnings)
npm run lint -- --max-warnings 0

# 2. Type checking
npx tsc --noEmit --pretty

# 3. Tests
npm run test:ci

# 4. Build
npm run build
```

All commands should pass without errors.

#### Backend CI Commands
```bash
cd backend

# 1. Black formatting check
black --check --diff .

# 2. isort check
isort --check-only --diff .

# 3. flake8 linting
flake8 app tests --max-line-length=100 --exclude=__pycache__,migrations

# 4. mypy type checking
mypy app --ignore-missing-imports --strict-optional

# 5. Tests with coverage
pytest tests/ -v \
  --cov=app \
  --cov-report=xml \
  --cov-report=html \
  --cov-report=term-missing \
  --cov-fail-under=80 \
  --timeout=60 \
  --maxfail=5
```

All commands should pass without errors.

---

## 🐛 Troubleshooting

### Frontend Issues

#### Issue: `Cannot find module '@testing-library/dom'`
**Solution**:
```bash
npm install @testing-library/dom --save-dev --legacy-peer-deps
```

#### Issue: TypeScript errors after updating
**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Restart TypeScript server in VS Code
# CMD+Shift+P > "TypeScript: Restart TS Server"

# Rebuild
npm run build
```

#### Issue: Tests failing with "Cannot find module"
**Solution**:
```bash
# Clear Jest cache
npm run test -- --clearCache

# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Backend Issues

#### Issue: `psycopg2` installation fails on Windows
**Solutions**:
1. **Use WSL2** (Recommended):
   ```bash
   # Install WSL2
   wsl --install
   # Then run backend in WSL
   ```

2. **Use Docker**:
   ```bash
   docker-compose up backend
   ```

3. **Install Visual C++ Build Tools**:
   - Download from Microsoft
   - Install "Desktop development with C++"

#### Issue: Database connection errors
**Solution**:
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Start if not running
docker start echo-postgres

# Check connection
psql -h localhost -U user -d echo_dev
```

#### Issue: Redis connection errors
**Solution**:
```bash
# Check Redis is running
docker ps | grep redis

# Start if not running
docker start echo-redis

# Test connection
redis-cli ping
# Should return: PONG
```

#### Issue: Migration errors
**Solution**:
```bash
# Reset database (CAUTION: Deletes all data)
alembic downgrade base
alembic upgrade head

# Or create new migration
alembic revision --autogenerate -m "description"
alembic upgrade head
```

---

## 📊 Code Coverage

### View Coverage Reports

#### Frontend
```bash
cd frontend
npm run test:coverage
open coverage/lcov-report/index.html
```

#### Backend
```bash
cd backend
pytest tests/ --cov=app --cov-report=html
open htmlcov/index.html
```

### Coverage Thresholds
- **Frontend**: 80% statements, 75% branches, 80% functions, 80% lines
- **Backend**: 80% overall coverage

---

## 🔧 Development Tools

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "ms-python.black-formatter",
    "ms-azuretools.vscode-docker",
    "bradlc.vscode-tailwindcss",
    "github.copilot"
  ]
}
```

### Git Hooks (Pre-commit)
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually on all files
pre-commit run --all-files
```

Hooks will automatically run:
- ESLint on frontend files
- Black, isort, flake8 on backend files
- Prevent commits with linting errors

---

## 📝 Environment Variables Reference

### Frontend (.env.local)
```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Backend (.env)
```env
# Required
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/echo_dev
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-minimum-32-characters
JWT_SECRET_KEY=your-jwt-secret-key

# Optional
ENVIRONMENT=development
DEBUG=True
SENTRY_DSN=your-sentry-dsn
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🚢 Deployment

### Production Checklist
- [ ] All tests passing locally
- [ ] CI/CD pipeline green
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Monitoring and logging set up
- [ ] Backup strategy in place

### Build for Production

#### Frontend
```bash
cd frontend
npm run build
npm start
```

#### Backend
```bash
cd backend
# Set environment variables
export ENVIRONMENT=production
export DEBUG=False

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Docker Production Build
```bash
# Build images
docker-compose -f docker-compose.production.yml build

# Start services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

---

## 📚 Additional Resources

### Documentation
- [CI/CD Compliance Report](./CI_CD_COMPLIANCE_REPORT.md)
- [TypeScript Fixes Guide](./TYPESCRIPT_FIXES_GUIDE.md)
- [API Documentation](http://localhost:8000/docs) (when backend is running)
- [Architecture Overview](./docs/ARCHITECTURE.md)

### Testing Guides
- [Frontend Testing Guide](./frontend/docs/TESTING.md)
- [Backend Testing Guide](./backend/docs/TESTING.md)

### Code Quality
- [Code Quality Dashboard](https://sonarcloud.io/dashboard?id=echo-social-platform)
- [Coverage Reports](https://codecov.io/gh/your-org/echo)

---

## 🤝 Contributing

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request
5. Wait for CI checks to pass
6. Request review from maintainers

### Commit Message Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Before Submitting PR
```bash
# Frontend checks
cd frontend
npm run lint
npm run test:ci
npm run build

# Backend checks
cd backend
black . --check
isort . --check
flake8 app tests
pytest tests/ --cov=app --cov-fail-under=80
```

All checks must pass before PR can be merged.

---

## 📞 Support

- **Documentation**: Check the docs folder
- **Issues**: [GitHub Issues](https://github.com/your-org/echo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/echo/discussions)
- **Email**: support@echo.com

---

**Made with ❤️ by the Echo Team**
