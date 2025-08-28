"""
Simple authentication server for Echo - SQLite-based, no external dependencies
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import sqlite3
import hashlib
import secrets
import jwt
import uvicorn

# Configuration
SECRET_KEY = "dev-secret-key-please-change-in-production-12345678"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database setup
def init_db():
    conn = sqlite3.connect('echo_auth.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Models
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    email_verified: bool = True
    totp_enabled: bool = False
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
    requires_2fa: bool = False

# Utilities
def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == password_hash

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(datetime.UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> Dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Database operations
def create_user(email: str, password: str, full_name: Optional[str] = None) -> dict:
    """Create a new user"""
    conn = sqlite3.connect('echo_auth.db')
    c = conn.cursor()

    # Check if user exists
    c.execute("SELECT id FROM users WHERE email = ?", (email,))
    if c.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user_id = secrets.token_urlsafe(16)
    password_hash = hash_password(password)
    created_at = datetime.now(datetime.UTC).isoformat()

    c.execute(
        "INSERT INTO users (id, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, ?)",
        (user_id, email, password_hash, full_name, created_at)
    )
    conn.commit()
    conn.close()

    return {
        "id": user_id,
        "email": email,
        "full_name": full_name
    }

def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email"""
    conn = sqlite3.connect('echo_auth.db')
    c = conn.cursor()
    c.execute("SELECT id, email, password_hash, full_name, created_at FROM users WHERE email = ?", (email,))
    row = c.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "id": row[0],
        "email": row[1],
        "password_hash": row[2],
        "full_name": row[3],
        "created_at": row[4]
    }

def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by ID"""
    conn = sqlite3.connect('echo_auth.db')
    c = conn.cursor()
    c.execute("SELECT id, email, full_name, created_at FROM users WHERE id = ?", (user_id,))
    row = c.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "id": row[0],
        "email": row[1],
        "full_name": row[2],
        "created_at": row[3]
    }

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    print("✅ Database initialized")
    print("✅ Auth server running on http://localhost:8000")
    print("📚 API docs available at http://localhost:8000/docs")
    yield
    # Shutdown (if needed)
    pass

# FastAPI app
app = FastAPI(title="Echo Authentication API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated user"""
    payload = verify_token(credentials.credentials)
    user = get_user_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Routes
@app.post("/api/auth/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    """Register a new user"""
    user = create_user(request.email, request.password, request.full_name)
    access_token = create_access_token({"sub": user["id"]})
    refresh_token = secrets.token_urlsafe(32)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            created_at=user.get("created_at", datetime.now(datetime.UTC).isoformat())
        )
    )

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login user"""
    user = get_user_by_email(request.email)

    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": user["id"]})
    refresh_token = secrets.token_urlsafe(32)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            created_at=user.get("created_at", datetime.now(datetime.UTC).isoformat())
        )
    )

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        created_at=current_user.get("created_at", datetime.now(datetime.UTC).isoformat())
    )

@app.post("/api/auth/logout")
async def logout():
    """Logout user"""
    return {"message": "Logged out successfully"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Echo Authentication API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
