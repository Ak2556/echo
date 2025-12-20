# GitHub Actions Workflows Guide

Quick reference for all CI/CD workflows in this project.

## Workflow Files

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| CI/CD Pipeline | `ci.yml` | Push, PR | Main build, test, and deploy pipeline |
| Code Quality | `code-quality.yml` | Push, PR | Code quality checks and analysis |
| Dependency Updates | `dependency-update.yml` | Weekly, Manual | Automated dependency updates |
| Performance | `performance.yml` | Push, Weekly | Performance testing and monitoring |
| Container Security | `container-security.yml` | Dockerfile changes, Weekly | Docker security and optimization |
| Release | `release.yml` | Version tags | Automated release management |
| Notifications | `notifications.yml` | Workflow completion | Status notifications |

## Workflow Triggers

### Automatic Triggers

```yaml
# Push to specific branches
on:
  push:
    branches: [main, develop, staging]

# Pull requests
on:
  pull_request:
    branches: [main, develop]

# Scheduled (cron)
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC

# Tag creation
on:
  push:
    tags:
      - 'v*.*.*'
```

### Manual Triggers

All workflows support manual triggering via `workflow_dispatch`:

1. Go to **Actions** tab in GitHub
2. Select the workflow
3. Click **Run workflow**
4. Choose branch and parameters (if any)

## Common Workflow Patterns

### 1. Running Tests

**Frontend:**
```yaml
- name: Run tests
  working-directory: ./frontend
  run: npm run test:ci
  env:
    CI: true
```

**Backend:**
```yaml
- name: Run tests
  working-directory: ./backend
  run: pytest tests/ -v --cov=app
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### 2. Caching Dependencies

**Node.js:**
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20.x'
    cache: 'npm'
    cache-dependency-path: frontend/package-lock.json
```

**Python:**
```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.11'
    cache: 'pip'
    cache-dependency-path: backend/requirements.txt
```

### 3. Docker Build

```yaml
- name: Build and push
  uses: docker/build-push-action@v6
  with:
    context: ./backend
    platforms: linux/amd64,linux/arm64
    push: true
    tags: ${{ steps.meta.outputs.tags }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### 4. Artifacts

**Upload:**
```yaml
- uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: test-results/
    retention-days: 14
```

**Download:**
```yaml
- uses: actions/download-artifact@v4
  with:
    name: test-results
    path: ./results
```

## Workflow Secrets

Required secrets (set in Settings → Secrets and variables → Actions):

| Secret | Purpose | Required For |
|--------|---------|--------------|
| `GITHUB_TOKEN` | Automatically provided | All workflows |
| `CODECOV_TOKEN` | Code coverage uploads | CI pipeline |
| `SONAR_TOKEN` | SonarCloud analysis | Code quality |

## Workflow Outputs

### Job Outputs

```yaml
jobs:
  build:
    outputs:
      version: ${{ steps.get_version.outputs.version }}
    steps:
      - id: get_version
        run: echo "version=1.0.0" >> $GITHUB_OUTPUT

  deploy:
    needs: build
    steps:
      - run: echo "Deploying ${{ needs.build.outputs.version }}"
```

### Step Outputs

```yaml
- name: Check status
  id: check
  run: echo "status=success" >> $GITHUB_OUTPUT

- name: Use output
  run: echo "Status was ${{ steps.check.outputs.status }}"
```

## Workflow Conditions

### Skip Workflows

```yaml
# Skip on specific paths
on:
  push:
    paths-ignore:
      - '**.md'
      - 'docs/**'

# Skip on commit message
jobs:
  build:
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
```

### Conditional Jobs

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - run: echo "Deploying to production"
```

### Conditional Steps

```yaml
- name: Deploy to staging
  if: github.ref == 'refs/heads/develop'
  run: ./deploy-staging.sh
```

## Workflow Best Practices

### 1. Use Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### 2. Set Timeouts

```yaml
jobs:
  build:
    timeout-minutes: 30
    steps:
      - name: Run tests
        timeout-minutes: 10
        run: npm test
```

### 3. Fail Fast vs Continue on Error

```yaml
strategy:
  fail-fast: false  # Don't cancel other jobs if one fails
  matrix:
    node-version: [18, 20, 22]

steps:
  - name: Optional check
    continue-on-error: true
    run: npm run lint
```

### 4. Use Job Dependencies

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    # Build runs first

  test:
    needs: build  # Test waits for build
    runs-on: ubuntu-latest

  deploy:
    needs: [build, test]  # Deploy waits for both
    runs-on: ubuntu-latest
```

### 5. Matrix Strategy

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [18, 20]
    include:
      - os: ubuntu-latest
        node-version: 22
    exclude:
      - os: windows-latest
        node-version: 18
```

## Debugging Workflows

### Enable Debug Logging

Set repository secrets:
- `ACTIONS_STEP_DEBUG`: `true`
- `ACTIONS_RUNNER_DEBUG`: `true`

### View Logs

```yaml
- name: Debug info
  run: |
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
    echo "Actor: ${{ github.actor }}"
```

### Test Locally with Act

```bash
# Install act
brew install act  # macOS
choco install act  # Windows

# Run workflow locally
act push
act pull_request
act -l  # List workflows
```

## Workflow Optimization

### 1. Use Caching Effectively

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.cache/pip
      ~/.npm
      node_modules
    key: ${{ runner.os }}-${{ hashFiles('**/package-lock.json', '**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-
```

### 2. Parallel Jobs

```yaml
jobs:
  frontend:
    runs-on: ubuntu-latest
    # Runs in parallel

  backend:
    runs-on: ubuntu-latest
    # Runs in parallel
```

### 3. Reusable Workflows

```yaml
# .github/workflows/reusable-test.yml
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Testing in ${{ inputs.environment }}"

# Usage in another workflow
jobs:
  call-reusable:
    uses: ./.github/workflows/reusable-test.yml
    with:
      environment: staging
```

## Common Issues & Solutions

### Issue: Workflow not triggering

**Solution:**
- Check branch name matches trigger
- Verify file is in `.github/workflows/`
- Check YAML syntax
- Ensure workflow is not disabled

### Issue: Secrets not available

**Solution:**
```yaml
# Use env to make secrets available
env:
  MY_SECRET: ${{ secrets.MY_SECRET }}
```

### Issue: Cache not working

**Solution:**
- Verify cache key is consistent
- Check cache size (max 10GB per repo)
- Use `restore-keys` for fallback

### Issue: Jobs running too long

**Solution:**
- Add `timeout-minutes`
- Use matrix strategy to parallelize
- Optimize build steps
- Use better caching

## Monitoring & Metrics

### View Workflow Runs

1. Navigate to **Actions** tab
2. Select workflow
3. View run history and logs

### Workflow Insights

- **Actions usage** - Settings → Billing
- **Workflow timing** - Actions → Insights
- **Success rate** - Workflow run history

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Awesome Actions](https://github.com/sdras/awesome-actions)
- [Act - Local Testing](https://github.com/nektos/act)

---

**Need Help?**
- Check workflow logs in Actions tab
- Review this guide
- Consult team documentation
- Create an issue for workflow problems
