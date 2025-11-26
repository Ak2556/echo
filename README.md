<div align="center">

# Echo 🌐

### Next-Generation Social Platform with AI-Powered Features

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen.svg)](https://github.com/Ak2556/echo)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791)](https://www.postgresql.org/)

**Echo** is a modern, full-stack social platform that combines real-time communication, AI-powered assistance, e-commerce, and educational features into one seamless experience.

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [✨ Features](#-key-features) • [🏗️ Architecture](#️-architecture) • [🤝 Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#️-architecture)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Security](#-security)
- [Performance](#-performance)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

Echo is a comprehensive social platform built with modern web technologies, offering:

- **Real-time Communication**: WebSocket-powered messaging and live streaming
- **AI Integration**: Smart chat assistants powered by multiple AI models
- **E-commerce Platform**: Complete shop with Stripe payment integration
- **Educational Marketplace**: Course platform with live tutoring
- **15+ Mini-Apps**: Built-in productivity and utility applications
- **Enterprise-Grade Security**: JWT, 2FA, CSRF protection, and rate limiting
- **Mobile-First Design**: Fully responsive with dark mode support
- **Internationalization**: Multi-language support with RTL languages

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Multi-factor Authentication**: TOTP-based 2FA with backup codes
- **OAuth Integration**: Google, GitHub, and custom providers
- **Secure Sessions**: HttpOnly cookies with CSRF protection
- **Password Security**: Argon2id hashing with strength validation
- **Rate Limiting**: Redis-based distributed rate limiting
- **Email Verification**: Secure account activation flow

### 💬 Social & Communication
- **Real-time Messaging**: WebSocket-powered chat with typing indicators
- **Feed System**: Infinite scroll with optimistic updates
- **Live Streaming**: WebRTC-based live video with chat
- **Notifications**: Real-time push notifications
- **Comments & Reactions**: Nested comments with emoji reactions
- **User Profiles**: Customizable profiles with bio and social links

### 🛍️ E-Commerce
- **Product Marketplace**: Full-featured shop with categories
- **Shopping Cart**: Persistent cart with checkout flow
- **Payment Processing**: Stripe integration with webhooks
- **Order Management**: Order tracking and history
- **Inventory System**: Real-time stock management

### 🎓 Education Platform
- **Course Marketplace**: Browse and enroll in courses
- **Live Tutoring**: Real-time video lessons
- **Teacher Profiles**: Detailed instructor information
- **Student Dashboard**: Track progress and assignments
- **Video Lessons**: Integrated video player with quality controls

### 🤖 AI Features
- **Chat Assistant**: Multi-model AI chat (GPT, Claude alternatives via OpenRouter)
- **Image Generation**: AI-powered image creation
- **Smart Conversations**: Context-aware responses
- **Model Selection**: Choose from multiple AI providers

### 🔧 Mini-Apps (15+)
- **Productivity**: Calendar, Notes, Todo List, Timer
- **Finance**: Finance Manager, Currency Converter
- **Utilities**: Calculator, QR Code Generator, Weather
- **Creative**: Whiteboard, Media Player
- **Education**: Recipe Book, Language Translator
- **Business**: Tuition Marketplace, File Manager

### 🎨 User Experience
- **Dark Mode**: Beautiful dark theme with smooth transitions
- **Responsive Design**: Mobile-first approach, works on all devices
- **Accessibility**: WCAG 2.1 AA compliant
- **PWA Support**: Install as native app on mobile/desktop
- **Internationalization**: English, Spanish, French, German support
- **Performance**: Code splitting, lazy loading, image optimization

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **TailwindCSS** | Utility-first CSS framework |
| **React Query** | Server state management & caching |
| **Zustand** | Client state management |
| **Socket.io Client** | Real-time WebSocket communication |
| **Framer Motion** | Animation library |
| **React Hook Form** | Form validation |
| **Zod** | Schema validation |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Modern Python web framework |
| **PostgreSQL** | Primary relational database |
| **Redis** | Caching & session management |
| **SQLAlchemy** | ORM for database operations |
| **Alembic** | Database migrations |
| **Pydantic** | Data validation |
| **Argon2** | Password hashing |
| **JWT** | Token-based authentication |
| **Stripe** | Payment processing |

### DevOps & Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **GitHub Actions** | CI/CD pipeline |
| **Nginx** | Reverse proxy & load balancing |
| **PostgreSQL** | Database server |
| **Redis** | Cache server |

### Testing & Quality
| Technology | Purpose |
|------------|---------|
| **Jest** | Frontend unit testing |
| **Pytest** | Backend testing |
| **Playwright** | E2E testing |
| **ESLint** | JavaScript linting |
| **Prettier** | Code formatting |
| **Black** | Python code formatting |

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile App  │  │   Desktop    │     │
│  │  (Next.js)   │  │ (React Native│  │     PWA      │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
     ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
     │  HTTP    │      │WebSocket │      │  Static  │
     │   API    │      │  Server  │      │  Assets  │
     └────┬─────┘      └────┬─────┘      └──────────┘
          │                 │
          └────────┬────────┘
                   │
       ┌───────────▼───────────────────────────────────┐
       │          Application Layer                     │
       │  ┌──────────────────────────────────────┐    │
       │  │      FastAPI Backend                 │    │
       │  │  ┌────────┐  ┌────────┐  ┌────────┐ │    │
       │  │  │  Auth  │  │  API   │  │ Socket │ │    │
       │  │  │Service │  │Endpoints│  │Handler │ │    │
       │  │  └────────┘  └────────┘  └────────┘ │    │
       │  └──────────────────────────────────────┘    │
       └───────────┬──────────────────────────────────┘
                   │
       ┌───────────┼────────────┬──────────────┐
       │           │            │              │
   ┌───▼───┐  ┌───▼───┐  ┌────▼─────┐  ┌────▼─────┐
   │ Redis │  │Postgres│  │  Stripe  │  │External  │
   │ Cache │  │   DB   │  │   API    │  │   APIs   │
   └───────┘  └────────┘  └──────────┘  └──────────┘
```

### Data Flow

```
User Action → Frontend Validation → API Request → Backend Validation
                                                          ↓
                                                    Rate Limiting
                                                          ↓
                                                    Authentication
                                                          ↓
                                                    Authorization
                                                          ↓
                                                   Business Logic
                                                          ↓
                                            ┌─────────────┴─────────────┐
                                            ↓                           ↓
                                       Cache Check                Database Query
                                            ↓                           ↓
                                       Cache Hit?─No→              Fetch Data
                                            ↓                           ↓
                                           Yes                     Update Cache
                                            ↓                           ↓
                                            └─────────────┬─────────────┘
                                                          ↓
                                                    Response Transform
                                                          ↓
                                                    Send to Client
                                                          ↓
                                                    Update UI
```

### Project Structure

```
echo/
├── .github/
│   ├── workflows/              # CI/CD pipelines
│   │   ├── ci.yml             # Continuous Integration
│   │   ├── code-quality.yml   # Linting & formatting
│   │   └── dependency-update.yml
│   └── CONTRIBUTING.md        # Contribution guidelines
│
├── backend/                   # FastAPI backend
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── auth.py
│   │   │       │   ├── posts.py
│   │   │       │   ├── shop.py
│   │   │       │   ├── chat.py
│   │   │       │   └── users.py
│   │   │       └── router.py
│   │   ├── auth/            # Authentication
│   │   │   ├── jwt_utils.py
│   │   │   ├── oauth.py
│   │   │   └── totp_routes.py
│   │   ├── core/            # Core functionality
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── redis.py
│   │   │   ├── security.py
│   │   │   └── rate_limit.py
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic
│   │   └── main.py          # Application entry
│   ├── tests/               # Backend tests
│   │   ├── unit/
│   │   └── integration/
│   ├── migrations/          # Alembic migrations
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile          # Backend container
│
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js 14 App Router
│   │   │   ├── (auth)/    # Auth routes
│   │   │   ├── api/       # API routes
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/    # React components
│   │   │   ├── auth/
│   │   │   ├── miniapps/
│   │   │   ├── ui/
│   │   │   ├── AiChat.tsx
│   │   │   ├── FeedPage.tsx
│   │   │   ├── ShopPage.tsx
│   │   │   └── MainApp.tsx
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── styles/        # Global styles
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   ├── __tests__/         # Frontend tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── tailwind.config.js
│
├── docs/                  # Documentation
│   ├── api/              # API documentation
│   ├── architecture/     # Architecture docs
│   └── deployment/       # Deployment guides
│
├── scripts/              # Utility scripts
├── docker-compose.yml    # Docker orchestration
├── .env.example         # Environment template
├── LICENSE              # MIT License
└── README.md            # This file
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/))
- **Redis** 7+ ([Download](https://redis.io/))
- **Docker** & **Docker Compose** (optional, recommended) ([Download](https://www.docker.com/))

### Using Docker (Recommended)

The fastest way to get started:

```bash
# Clone the repository
git clone https://github.com/Ak2556/echo.git
cd echo

# Copy environment files
cp .env.example .env

# Start all services
docker-compose up -d

# Visit the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

If you prefer to run services manually:

#### 1. Clone Repository
```bash
git clone https://github.com/Ak2556/echo.git
cd echo
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up database
createdb echo_db  # Or use your PostgreSQL GUI

# Run migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --port 8000
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Admin Panel**: http://localhost:8000/admin

---

## 📦 Installation

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/echo_db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=

# Authentication
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this
JWT_ALGORITHM=RS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@echo.dev

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Services (OpenRouter)
OPENROUTER_API_KEY=your-openrouter-key

# File Storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760  # 10MB

# Security
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:3000
RATE_LIMIT_PER_MINUTE=60

# Environment
NODE_ENV=development
DEBUG=true
LOG_LEVEL=INFO
```

### Frontend Environment

Create `frontend/.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_SHOP=true
NEXT_PUBLIC_ENABLE_TUITION=true

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Map API (Optional)
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

---

## ⚙️ Configuration

### Database Setup

```bash
# Create database
createdb echo_db

# Run migrations
cd backend
alembic upgrade head

# Seed database (optional)
python scripts/seed_data.py
```

### Redis Setup

```bash
# Start Redis
redis-server

# Or with Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### SSL/TLS (Production)

For production, configure SSL certificates:

```bash
# Using Let's Encrypt with Certbot
certbot certonly --standalone -d your-domain.com

# Update nginx configuration
# Copy certificates to appropriate locations
```

---

## 💻 Development

### Running Development Servers

#### Backend
```bash
cd backend

# With auto-reload
uvicorn app.main:app --reload --port 8000

# With debugger
python -m debugpy --listen 5678 -m uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend

# Development mode
npm run dev

# With Turbopack (faster)
npm run dev -- --turbo

# Build for production
npm run build

# Start production server
npm start
```

### Code Quality

#### Linting & Formatting

```bash
# Frontend
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run format      # Format with Prettier

# Backend
black backend/      # Format Python code
isort backend/      # Sort imports
flake8 backend/     # Check code quality
mypy backend/       # Type checking
```

#### Pre-commit Hooks

```bash
# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Run manually
pre-commit run --all-files
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Add user profile fields"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1

# View migration history
alembic history
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_auth.py

# Run specific test
pytest tests/unit/test_auth.py::test_login_success

# Run integration tests
pytest tests/integration/

# Run with verbose output
pytest -v
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- PasswordStrength.test.tsx
```

### Test Coverage Goals

- **Backend**: > 80% coverage
- **Frontend**: > 70% coverage
- **E2E**: Critical user flows

---

## 🔒 Security

### Security Features

- ✅ **HTTPS Only** in production
- ✅ **CSRF Protection** with double-submit cookies
- ✅ **XSS Prevention** with Content Security Policy
- ✅ **SQL Injection Protection** via SQLAlchemy ORM
- ✅ **Rate Limiting** to prevent abuse
- ✅ **Input Validation** with Pydantic/Zod
- ✅ **Secure Password Hashing** with Argon2id
- ✅ **JWT with Refresh Tokens**
- ✅ **2FA Support** (TOTP)
- ✅ **Security Headers** (HSTS, X-Frame-Options, etc.)

### Security Best Practices

```bash
# Regular dependency updates
npm audit fix
pip-audit

# Security scanning
npm run security:check
bandit -r backend/

# Secret scanning
git secrets --scan-history
```

### Reporting Security Issues

Please report security vulnerabilities to: **security@echo.dev**

Do NOT create public GitHub issues for security vulnerabilities.

---

## ⚡ Performance

### Performance Optimizations

#### Frontend
- ✅ Code splitting & lazy loading
- ✅ Image optimization with Next.js Image
- ✅ Static page generation where possible
- ✅ React Query for request deduplication
- ✅ Service Worker for PWA
- ✅ Bundle size optimization

#### Backend
- ✅ Database query optimization with indexes
- ✅ Redis caching for frequent queries
- ✅ Connection pooling
- ✅ Async/await throughout
- ✅ Response compression
- ✅ CDN for static assets

### Performance Monitoring

```bash
# Frontend bundle analysis
npm run analyze

# Backend profiling
python -m cProfile -o profile.stats app/main.py

# Database query analysis
EXPLAIN ANALYZE SELECT ...
```

### Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s
- **API Response Time**: < 200ms (95th percentile)
- **Database Queries**: < 100ms (95th percentile)

---

## 🚀 Deployment

### Production Deployment

#### Using Docker Compose

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3
```

#### Manual Deployment

##### Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start with Gunicorn
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

##### Frontend
```bash
# Build production bundle
npm run build

# Start production server
npm start

# Or use PM2
pm2 start npm --name "echo-frontend" -- start
```

### Environment Setup

#### Production Environment Variables

```bash
# Set production environment
NODE_ENV=production
DEBUG=false

# Use strong secrets
JWT_SECRET_KEY=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 32)

# Configure production database
DATABASE_URL=postgresql://user:pass@db-host:5432/echo_production

# Set proper CORS origins
CORS_ORIGINS=https://echo.com,https://www.echo.com
```

### CI/CD Pipeline

Our GitHub Actions workflow:

1. **Lint & Format**: Check code quality
2. **Test**: Run unit and integration tests
3. **Build**: Create Docker images
4. **Security Scan**: Check for vulnerabilities
5. **Deploy**: Deploy to staging/production

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build & Deploy
        run: |
          docker-compose build
          docker-compose up -d
```

---

## 📚 API Documentation

### API Endpoints

Full API documentation available at `/docs` when running the backend.

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/2fa/setup` - Setup 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA token

#### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users/avatar` - Upload avatar

#### Posts
- `GET /api/posts` - List posts (paginated)
- `POST /api/posts` - Create post
- `GET /api/posts/{id}` - Get post details
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post
- `POST /api/posts/{id}/like` - Like post
- `POST /api/posts/{id}/comment` - Comment on post

#### Shop
- `GET /api/shop/products` - List products
- `GET /api/shop/products/{id}` - Get product
- `POST /api/shop/cart` - Add to cart
- `POST /api/shop/checkout` - Checkout
- `POST /api/shop/orders` - Create order
- `GET /api/shop/orders` - List orders

#### Chat
- `POST /api/ai/chat` - Send message to AI
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/messages/{id}` - Get messages
- `POST /api/chat/messages` - Send message

### WebSocket Events

Connect to `ws://localhost:8000/ws`

#### Client → Server
```javascript
{
  "type": "message",
  "data": {
    "conversationId": "uuid",
    "content": "Hello"
  }
}
```

#### Server → Client
```javascript
{
  "type": "message",
  "data": {
    "id": "uuid",
    "sender": "user-id",
    "content": "Hello",
    "timestamp": "2025-01-01T00:00:00Z"
  }
}
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](. github/CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user profile page
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
refactor: simplify authentication logic
test: add tests for user service
chore: update dependencies
```

### Code Review Process

1. All PRs require at least 1 approval
2. All tests must pass
3. Code coverage must not decrease
4. No linting errors

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Akash Thakur

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

### Built With
- [Next.js](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Redis](https://redis.io/) - Caching
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Stripe](https://stripe.com/) - Payment processing

### Special Thanks
- All our amazing contributors
- The open-source community
- Everyone who uses and supports Echo

---

## 📞 Support

### Get Help
- 📖 [Documentation](docs/README.md)
- 💬 [GitHub Discussions](https://github.com/Ak2556/echo/discussions)
- 🐛 [Issue Tracker](https://github.com/Ak2556/echo/issues)
- 📧 Email: support@echo.dev

### Stay Updated
- ⭐ Star this repo to show support
- 👀 Watch for updates
- 🔔 Enable notifications for releases

---

## 📊 Project Stats

![GitHub Stars](https://img.shields.io/github/stars/Ak2556/echo?style=social)
![GitHub Forks](https://img.shields.io/github/forks/Ak2556/echo?style=social)
![GitHub Issues](https://img.shields.io/github/issues/Ak2556/echo)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/Ak2556/echo)
![GitHub Contributors](https://img.shields.io/github/contributors/Ak2556/echo)
![GitHub Last Commit](https://img.shields.io/github/last-commit/Ak2556/echo)

---

<div align="center">

### Made with ❤️ by [Akash Thakur](https://github.com/Ak2556)

**[⬆ Back to Top](#echo-)**

*Last Updated: November 26, 2025*

</div>
