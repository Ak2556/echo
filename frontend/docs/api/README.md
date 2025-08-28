# API Documentation

Comprehensive API documentation for the Echo platform.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Versioning](#versioning)
- [SDKs](#sdks)

## Overview

The Echo API is organized around REST principles. Our API has predictable resource-oriented URLs, accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.

**Base URL**: `https://api.echo.com`

**Current Version**: `v1`

## Authentication

Echo uses JWT (JSON Web Tokens) for authentication. Include the access token in the Authorization header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Obtaining Tokens

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePassword123!",
  "full_name": "John Doe"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=SecurePassword123!
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Endpoints

### Users

#### Get Current User

```http
GET /api/v1/users/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response**:
```json
{
  "id": "123",
  "email": "user@example.com",
  "username": "username",
  "full_name": "John Doe",
  "created_at": "2024-01-15T10:00:00Z",
  "is_active": true
}
```

#### Update User

```http
PATCH /api/v1/users/me
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "bio": "Updated bio"
}
```

#### List Users (Admin Only)

```http
GET /api/v1/users/?page=1&page_size=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters**:
- `page` (integer): Page number (default: 1)
- `page_size` (integer): Items per page (default: 20, max: 100)
- `search` (string): Search term
- `is_active` (boolean): Filter by active status

### Posts

#### Create Post

```http
POST /api/v1/posts/
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "My Post Title",
  "content": "Post content here...",
  "tags": ["tech", "python"],
  "is_public": true
}
```

#### List Posts

```http
GET /api/v1/posts/?page=1&page_size=20
```

**Query Parameters**:
- `page` (integer): Page number
- `page_size` (integer): Items per page
- `tag` (string): Filter by tag
- `author_id` (string): Filter by author
- `is_public` (boolean): Filter by visibility

#### Get Post

```http
GET /api/v1/posts/{post_id}
```

#### Update Post

```http
PATCH /api/v1/posts/{post_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}
```

#### Delete Post

```http
DELETE /api/v1/posts/{post_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### AI Chat

#### Send Message

```http
POST /api/v1/chat/
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "message": "Hello, how can you help me?",
  "conversation_id": null,
  "model": "gpt-4"
}
```

**Response**:
```json
{
  "id": "msg_123",
  "conversation_id": "conv_456",
  "message": "Hello! I can help you with...",
  "model": "gpt-4",
  "created_at": "2024-01-15T10:00:00Z",
  "tokens_used": 45
}
```

#### Get Chat History

```http
GET /api/v1/chat/history?conversation_id=conv_456
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### File Upload

#### Upload File

```http
POST /api/v1/files/upload
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

file: (binary)
```

**Response**:
```json
{
  "id": "file_123",
  "filename": "document.pdf",
  "url": "https://cdn.echo.com/files/file_123.pdf",
  "size": 1024000,
  "content_type": "application/pdf",
  "uploaded_at": "2024-01-15T10:00:00Z"
}
```

#### List Files

```http
GET /api/v1/files/
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Delete File

```http
DELETE /api/v1/files/{file_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Search

#### Search Content

```http
GET /api/v1/search/?q=query&type=post&category=tech
```

**Query Parameters**:
- `q` (string, required): Search query
- `type` (string): Content type (post, user, course)
- `category` (string): Category filter
- `page` (integer): Page number
- `page_size` (integer): Results per page

### Analytics

#### Get User Analytics

```http
GET /api/v1/analytics/user
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response**:
```json
{
  "views": 1234,
  "posts": 45,
  "followers": 678,
  "engagement_rate": 4.5
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Success
- `201 Created`: Resource created
- `204 No Content`: Success with no response body
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": {
    "field": ["Validation error message"]
  },
  "request_id": "req_123"
}
```

### Common Errors

#### Validation Error

```json
{
  "error": "Validation Error",
  "message": "Request validation failed",
  "details": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

#### Authentication Error

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "request_id": "req_123"
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated requests**: 1000 requests/hour
- **Unauthenticated requests**: 100 requests/hour
- **Login endpoint**: 5 attempts/minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1610000000
```

When rate limit is exceeded:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 3600

{
  "error": "Rate Limit Exceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": 3600
}
```

## Versioning

The API uses URL versioning. The current version is `v1`:

```
https://api.echo.com/api/v1/
```

### Version Deprecation

- Deprecated versions will be supported for 6 months
- Deprecation notices will be sent via email
- Use the `X-API-Version` header to check version

## Pagination

List endpoints support cursor-based pagination:

```http
GET /api/v1/posts/?page=2&page_size=20
```

**Response**:
```json
{
  "items": [...],
  "total": 156,
  "page": 2,
  "page_size": 20,
  "pages": 8
}
```

## Webhooks

Configure webhooks to receive real-time notifications:

### Webhook Events

- `user.created`
- `user.updated`
- `post.created`
- `post.updated`
- `post.deleted`
- `payment.succeeded`
- `payment.failed`

### Webhook Payload

```json
{
  "event": "post.created",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "id": "post_123",
    "title": "New Post",
    "author_id": "user_456"
  }
}
```

### Verifying Webhooks

Webhooks include a signature header for verification:

```http
X-Webhook-Signature: sha256=abc123...
```

## SDKs

Official SDKs are available for:

- **JavaScript/TypeScript**: `npm install @echo/sdk`
- **Python**: `pip install echo-sdk`
- **Go**: `go get github.com/echo/sdk-go`

### JavaScript Example

```javascript
import { EchoClient } from '@echo/sdk';

const client = new EchoClient({
  apiKey: 'YOUR_API_KEY'
});

// Create a post
const post = await client.posts.create({
  title: 'My Post',
  content: 'Content here'
});

// Get user
const user = await client.users.me();
```

### Python Example

```python
from echo import EchoClient

client = EchoClient(api_key='YOUR_API_KEY')

# Create a post
post = client.posts.create(
    title='My Post',
    content='Content here'
)

# Get user
user = client.users.me()
```

## Support

- **Documentation**: https://docs.echo.com
- **API Status**: https://status.echo.com
- **GitHub Issues**: https://github.com/yourusername/echo/issues
- **Email**: api@echo.com
- **Discord**: https://discord.gg/echo

## Changelog

### v1.0.0 (2024-01-15)

- Initial API release
- User authentication
- Post management
- AI chat integration
- File uploads
- Search functionality
