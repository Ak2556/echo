# Echo

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.9-blue)](https://www.python.org/)

A modern full-stack application combining Next.js frontend with FastAPI backend for real-time communication and data processing.

## Features

- **Real-time Communication**: WebSocket-based messaging and notifications
- **Modern UI**: Built with Next.js 14, React 18, and Tailwind CSS
- **Fast Backend**: FastAPI with async support for high-performance APIs
- **Authentication**: Secure JWT-based authentication system
- **Data Processing**: Advanced data analytics and visualization
- **Type Safety**: Full TypeScript support on frontend
- **API Documentation**: Auto-generated interactive API docs with Swagger/OpenAPI
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: Zustand / React Context
- **HTTP Client**: Axios
- **WebSocket**: Socket.IO Client

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with bcrypt
- **Validation**: Pydantic
- **WebSocket**: Socket.IO
- **Task Queue**: Celery with Redis

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (Frontend) + Railway/Render (Backend)
- **Monitoring**: Sentry for error tracking

## Installation

### Prerequisites

- Node.js >= 18.0.0
- Python >= 3.9
- PostgreSQL >= 14
- Redis >= 6.0

### Clone Repository

```bash
git clone https://github.com/AK2556/echo.git
cd echo
```

### Frontend Setup

```bash
cd frontend
npm install
# or
yarn install
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Configuration

### Environment Variables

Create `.env` files in both frontend and backend directories:

#### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_NAME=Echo
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

#### Backend `.env`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/echo_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
SENTRY_DSN=your_sentry_dsn_here
```

### Database Setup

```bash
cd backend
alembic upgrade head
```

## Quickstart

### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Manual Start

#### Start Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Start Frontend

```bash
cd frontend
npm run dev
```

## Usage Examples

### API Request Example

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Authenticate
const response = await api.post('/auth/login', {
  username: 'user@example.com',
  password: 'securepassword',
});

const { access_token } = response.data;

// Make authenticated request
const data = await api.get('/users/me', {
  headers: { Authorization: `Bearer ${access_token}` },
});
```

### WebSocket Connection

```typescript
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_WS_URL, {
  auth: { token: access_token },
});

socket.on('message', (data) => {
  console.log('Received:', data);
});

socket.emit('send_message', { content: 'Hello!' });
```

## Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Jest tests |

### Backend

| Command | Description |
|---------|-------------|
| `uvicorn app.main:app --reload` | Start development server |
| `pytest` | Run tests |
| `alembic revision --autogenerate -m "message"` | Create database migration |
| `alembic upgrade head` | Apply migrations |
| `black .` | Format code |
| `flake8` | Lint code |

## Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Backend (Railway/Render)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy from main branch

### Docker Deployment

```bash
docker build -t echo-frontend ./frontend
docker build -t echo-backend ./backend
docker push your-registry/echo-frontend
docker push your-registry/echo-backend
```

## Testing

### Frontend Tests

```bash
cd frontend
npm run test
npm run test:coverage
```

### Backend Tests

```bash
cd backend
pytest
pytest --cov=app tests/
```

## Roadmap

- [x] Core authentication system
- [x] Real-time messaging
- [x] User profile management
- [ ] File upload and sharing
- [ ] Advanced search functionality
- [ ] Mobile app (React Native)
- [ ] Multi-language support (i18n)
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Third-party integrations (Slack, Discord)

## Changelog

### v0.1.0 (2025-09-12)

**Initial Release**

- Basic authentication system with JWT
- User registration and login
- Real-time messaging with WebSocket
- PostgreSQL database integration
- Docker support
- Basic API endpoints
- Next.js frontend with Tailwind CSS

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Commit your changes**: `git commit -m 'Add some feature'`
4. **Push to the branch**: `git push origin feature/your-feature-name`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and descriptive
- Ensure all tests pass before submitting PR

### Code Style

- **Frontend**: Follow ESLint and Prettier configurations
- **Backend**: Follow PEP 8 and use Black formatter
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We pledge to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Violations may result in temporary or permanent ban from the project. Please report issues to the maintainers.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 AK2556

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Security Policy

### Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

### Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **Do NOT** open a public issue
2. Email security concerns to: ak2556.security@example.com
3. Include detailed information about the vulnerability
4. Allow 48 hours for initial response

We take security seriously and will respond promptly to legitimate security concerns.

### Security Best Practices

- Never commit `.env` files or secrets
- Use environment variables for sensitive data
- Keep dependencies updated
- Use strong, unique passwords
- Enable 2FA where possible
- Review code changes carefully

## Acknowledgements

- [Next.js](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [PostgreSQL](https://www.postgresql.org/) - Open source database
- [Redis](https://redis.io/) - In-memory data store
- [Socket.IO](https://socket.io/) - Real-time communication

---

**Built with ❤️ by AK2556**

For questions or support, please open an issue or reach out to the maintainers.
