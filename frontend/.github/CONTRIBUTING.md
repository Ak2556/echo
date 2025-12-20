# Contributing to Echo

First off, thank you for considering contributing to Echo! It's people like you that make Echo such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Git

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/yourusername/echo.git
   cd echo
   ```

2. **Install Dependencies**

   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Servers**

   ```bash
   # Using Docker Compose
   docker-compose up -d

   # Or manually
   # Terminal 1 - Backend
   cd backend
   python main.py

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Verify Setup**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance improvements
- ✅ Test coverage
- 🔧 Refactoring

### Contribution Workflow

1. **Create an Issue**
   - Search existing issues first
   - Clearly describe the problem or enhancement
   - Wait for feedback before starting work

2. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make Changes**
   - Follow our code style guidelines
   - Write tests for new features
   - Update documentation as needed

4. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Adding or updating tests
   - `chore:` Maintenance tasks

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub

## Code Style Guidelines

### Frontend (TypeScript/React)

```typescript
// Use functional components with TypeScript
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export function MyComponent({ title, onSubmit }: Props) {
  // Component logic
  return <div>{title}</div>;
}
```

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Prefer functional components with hooks
- Use meaningful variable names
- Add JSDoc comments for complex functions

### Backend (Python)

```python
from typing import List, Optional

def process_users(user_ids: List[int], include_inactive: Optional[bool] = False) -> dict:
    """
    Process a list of users.

    Args:
        user_ids: List of user IDs to process
        include_inactive: Whether to include inactive users

    Returns:
        Dictionary with processing results
    """
    # Implementation
    pass
```

- Follow PEP 8 style guide
- Use type hints for all functions
- Use Black for formatting
- Use docstrings for functions and classes
- Keep functions focused and small
- Use meaningful variable names

### Database

- Use Alembic for all schema changes
- Never edit migration files directly
- Write both upgrade and downgrade functions
- Test migrations locally before committing

## Testing Guidelines

### Frontend Tests

```typescript
// Component test
describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" onSubmit={jest.fn()} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle submit', () => {
    const onSubmit = jest.fn();
    render(<MyComponent title="Test" onSubmit={onSubmit} />);
    // Test submit logic
  });
});
```

- Write tests for new features
- Maintain 80%+ coverage
- Test user interactions
- Test error states
- Use React Testing Library

### Backend Tests

```python
import pytest

class TestUserAPI:
    def test_create_user(self, client):
        """Test user creation."""
        response = client.post("/api/users/", json={
            "email": "test@example.com",
            "username": "testuser"
        })
        assert response.status_code == 201
        assert response.json()["email"] == "test@example.com"

    def test_create_user_duplicate_email(self, client):
        """Test duplicate email handling."""
        # Test implementation
        pass
```

- Write pytest tests for new features
- Maintain 80%+ coverage
- Test edge cases
- Test error handling
- Use fixtures for common setup

### Running Tests

```bash
# Frontend
cd frontend
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage

# Backend
cd backend
pytest                    # Run all tests
pytest -v                 # Verbose
pytest --cov=app          # With coverage
pytest tests/unit         # Only unit tests

# E2E
cd frontend
npx playwright test       # Run E2E tests
```

## Pull Request Process

1. **Before Submitting**
   - Run all tests locally
   - Ensure code passes linting
   - Update documentation
   - Add yourself to CONTRIBUTORS.md

2. **PR Checklist**
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] Follows code style guidelines
   - [ ] No breaking changes (or documented)
   - [ ] Commit messages follow conventions
   - [ ] PR description is clear and complete

3. **PR Template**

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing

   Describe tests added/updated

   ## Screenshots (if applicable)

   Add screenshots for UI changes
   ```

4. **Review Process**
   - At least one approval required
   - All CI checks must pass
   - Address review comments
   - Rebase if needed

5. **After Merge**
   - Delete your branch
   - Update your local main branch
   - Close related issues

## Reporting Bugs

### Before Submitting

- Check existing issues
- Try latest version
- Gather debug information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g., macOS 13.0]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

## Suggesting Enhancements

### Enhancement Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives considered**
Other solutions you've considered.

**Additional context**
Any other relevant information, mockups, etc.
```

## Development Tips

### Debugging

- Use VS Code debug configurations (`.vscode/launch.json`)
- Check logs: `docker-compose logs -f`
- Use browser DevTools for frontend
- Use FastAPI's interactive docs for API

### Performance

- Profile before optimizing
- Use React DevTools Profiler
- Monitor database query performance
- Check bundle size: `npm run build --analyze`

### Database

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Community

- **Discord**: [Join our Discord](https://discord.gg/echo)
- **GitHub Discussions**: For questions and discussions
- **GitHub Issues**: For bugs and feature requests
- **Email**: dev@echo.com

## Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in commit history

Thank you for contributing to Echo! 🎉
