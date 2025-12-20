# CI/CD Pipeline Status

This document provides an overview of the CI/CD pipeline and current build status.

## Workflow Status Badges

[![CI/CD Pipeline](https://github.com/yourusername/echo-main/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/echo-main/actions/workflows/ci.yml)
[![Code Quality](https://github.com/yourusername/echo-main/actions/workflows/code-quality.yml/badge.svg)](https://github.com/yourusername/echo-main/actions/workflows/code-quality.yml)
[![Performance](https://github.com/yourusername/echo-main/actions/workflows/performance.yml/badge.svg)](https://github.com/yourusername/echo-main/actions/workflows/performance.yml)
[![Container Security](https://github.com/yourusername/echo-main/actions/workflows/container-security.yml/badge.svg)](https://github.com/yourusername/echo-main/actions/workflows/container-security.yml)

## Pipeline Overview

### Main CI/CD Pipeline (`ci.yml`)
Runs on every push and pull request to main, develop, and staging branches.

**Jobs:**
- **Frontend Tests** - Linting, type checking, unit tests, and build
- **Backend Tests** - Code formatting, linting, type checking, and unit tests with coverage
- **Security Scanning** - Trivy vulnerability scanning, npm audit, pip audit
- **E2E Tests** - End-to-end tests with Playwright
- **Build** - Docker image building and publishing
- **Deploy** - Automated deployment to staging and production

**Key Features:**
- ✅ Multi-version testing (Node 20.x, 22.x | Python 3.11, 3.12)
- ✅ Parallel job execution for faster builds
- ✅ Comprehensive caching strategy
- ✅ Codecov integration for coverage reporting
- ✅ Docker multi-platform builds (amd64, arm64)
- ✅ Health checks for all services
- ✅ Artifact retention with smart cleanup

### Code Quality (`code-quality.yml`)
Runs on pull requests and pushes to main/develop.

**Jobs:**
- **Code Quality Analysis** - ESLint, Prettier, TypeScript, Pylint, Bandit
- **Code Complexity** - Radon analysis for cyclomatic complexity
- **Dead Code Detection** - Vulture analysis
- **Code Duplication** - jscpd for frontend
- **SonarCloud Integration** - Comprehensive code quality metrics
- **License Compliance** - License checking for dependencies

**Quality Gates:**
- ESLint max warnings: 10
- Pylint minimum score: 7.0/10
- TypeScript: 0 errors
- Bandit: 0 high severity issues

### Dependency Updates (`dependency-update.yml`)
Runs weekly on Mondays and can be triggered manually.

**Features:**
- ✅ Automated dependency updates (patch, minor, major)
- ✅ Security audit after updates
- ✅ Automated testing before creating PR
- ✅ Rollback on test failures
- ✅ Automatic PR creation with detailed reports
- ✅ Security issue notifications

### Performance Monitoring (`performance.yml`)
Runs on pushes to main/develop and weekly on Sundays.

**Tests:**
- **Frontend Performance** - Lighthouse CI, bundle size analysis
- **Backend Performance** - pytest-benchmark, memory profiling
- **Load Testing** - Locust load tests (scheduled only)
- **Performance Regression** - Compare against baseline

**Metrics:**
- Lighthouse scores (performance, accessibility, SEO)
- Bundle size tracking
- API response times
- Database query performance
- Memory usage profiling

### Container Security (`container-security.yml`)
Runs on Dockerfile changes and weekly.

**Scans:**
- **Dockerfile Linting** - Hadolint for best practices
- **Vulnerability Scanning** - Trivy, Grype
- **SBOM Generation** - Syft for software bill of materials
- **Image Optimization** - Dive for layer analysis
- **Best Practices Check** - Security and optimization recommendations

### Release Management (`release.yml`)
Triggered on version tags (v*.*.*)

**Process:**
1. Version validation
2. Changelog generation
3. Build release artifacts
4. Create GitHub release
5. Post-release notifications

## Quick Start

### Running CI Locally

```bash
# Install dependencies
make install

# Run full CI pipeline
make ci-local

# Run specific checks
make lint        # Linting only
make test        # Tests only
make build       # Build only
make security    # Security scans
```

### Docker Commands

```bash
# Start all services
make start
# or
make docker-up

# View logs
make docker-logs

# Stop services
make stop
# or
make docker-down

# Health check
make health
```

## Environment Setup

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

### Backend Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/echo_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
ENVIRONMENT=development
```

## CI/CD Best Practices

### For Developers

1. **Before Committing:**
   - Run `make lint` to check code quality
   - Run `make test` to ensure tests pass
   - Format code with `make format`

2. **Pull Request Checklist:**
   - All CI checks passing
   - Code coverage maintained or improved
   - No new security vulnerabilities
   - Documentation updated if needed

3. **Code Review Focus:**
   - Check CI/CD pipeline results
   - Review code quality reports
   - Verify test coverage
   - Check for security issues

### For Maintainers

1. **Merging PRs:**
   - Ensure all required checks pass
   - Review code quality metrics
   - Check for dependency updates needed
   - Verify no breaking changes

2. **Release Process:**
   - Create release tag: `git tag v1.2.3`
   - Push tag: `git push origin v1.2.3`
   - Release workflow runs automatically
   - Monitor deployment status

3. **Monitoring:**
   - Review weekly dependency update PRs
   - Check security scan results
   - Monitor performance metrics
   - Address CI failures promptly

## Troubleshooting

### Common CI Issues

**Tests failing locally but passing in CI:**
- Check Node/Python versions match
- Clear caches: `make clean && make install`
- Check environment variables

**Docker build failures:**
- Verify Dockerfile syntax: `docker build -f backend/Dockerfile backend`
- Check .dockerignore files
- Ensure all dependencies listed

**Slow CI builds:**
- Check cache hit rates
- Review parallel job configuration
- Optimize test execution

### Getting Help

- Check workflow logs in GitHub Actions
- Review this documentation
- Check Makefile for available commands
- Consult team members

## Metrics & Monitoring

### Current Performance Targets

- **Build Time:** < 15 minutes
- **Test Coverage:** > 40% (backend), > 70% (frontend)
- **Lighthouse Score:** > 80
- **Security Vulnerabilities:** 0 critical/high
- **Code Quality:** Pylint > 7.0, ESLint warnings < 10

### Monitoring Dashboard

Access the following for detailed metrics:
- GitHub Actions workflows
- Codecov dashboard
- SonarCloud project
- Security tab for vulnerabilities

## Recent Updates

### v2.0 - Enhanced CI/CD Pipeline
- ✅ Updated all action versions to latest
- ✅ Added comprehensive error handling
- ✅ Implemented rollback mechanisms
- ✅ Enhanced security scanning
- ✅ Added performance monitoring
- ✅ Container optimization and security
- ✅ Automated release management
- ✅ Improved caching strategy
- ✅ Better test coverage reporting
- ✅ Docker Compose health checks

## Contributing

When modifying CI/CD workflows:
1. Test changes in a feature branch
2. Document changes in this file
3. Update relevant Makefile commands
4. Add workflow dispatch for manual testing
5. Monitor first few runs after merge

---

**Last Updated:** 2025-12-10
**Maintained By:** DevOps Team
