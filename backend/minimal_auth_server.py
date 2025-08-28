#!/usr/bin/env python3
"""
Minimal auth server for testing signup functionality.
"""
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

# Create FastAPI app
app = FastAPI(title="Minimal Auth API")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
users_db = {}
credentials_db = {}

# Request/Response models
class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class RegisterResponse(BaseModel):
    user_id: str
    email: str
    message: str
    requires_verification: bool = True

class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: bool = False

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 900
    user: dict
    requires_2fa: bool = False

# Routes
@app.get("/")
async def root():
    return {
        "name": "Minimal Auth API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.post("/api/auth/register", response_model=RegisterResponse, status_code=201)
async def register(data: RegisterRequest):
    """Register a new user."""

    # Check if user exists
    if data.email in users_db:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists. Please login or use a different email."
        )

    # Create user
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": data.email,
        "full_name": data.full_name,
        "email_verified": False,
        "created_at": datetime.utcnow().isoformat()
    }

    users_db[data.email] = user
    credentials_db[user_id] = {
        "password": data.password,  # In real app, would hash this
        "user_id": user_id
    }

    print(f"✅ User registered: {data.email} (ID: {user_id})")

    return RegisterResponse(
        user_id=user_id,
        email=data.email,
        message="Verification code sent to your email",
        requires_verification=True
    )

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    """Login with email and password."""

    # Get user
    user = users_db.get(data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check password
    credential = credentials_db.get(user["id"])
    if not credential or credential["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate mock tokens
    access_token = f"mock_access_token_{uuid.uuid4()}"
    refresh_token = f"mock_refresh_token_{uuid.uuid4()}"

    print(f"✅ User logged in: {data.email}")

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=900,
        user={
            "id": user["id"],
            "email": user["email"],
            "full_name": user.get("full_name"),
        }
    )

@app.post("/api/auth/verify-email")
async def verify_email(data: dict):
    """Verify email with OTP code."""
    email = data.get("email")
    code = data.get("code")

    user = users_db.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # For testing, accept any 6-digit code
    if code and len(code) == 6:
        user["email_verified"] = True
        print(f"✅ Email verified: {email}")
        return {"message": "Email verified successfully"}

    raise HTTPException(status_code=400, detail="Invalid or expired code")

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "users_count": len(users_db)
    }

@app.post("/admin/clear-users")
async def clear_users():
    """Clear all users (for testing only)."""
    users_db.clear()
    credentials_db.clear()
    print("🗑️  All users cleared")
    return {"message": "All users cleared", "users_count": 0}

@app.get("/admin/list-users")
async def list_users():
    """List all registered users (for testing only)."""
    return {
        "users": [{"email": email, "id": user["id"], "full_name": user.get("full_name")}
                 for email, user in users_db.items()]
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Minimal Auth Server on http://localhost:8000")
    print("📚 Endpoints:")
    print("   POST /api/auth/register")
    print("   POST /api/auth/login")
    print("   POST /api/auth/verify-email")
    print("   GET  /health")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
