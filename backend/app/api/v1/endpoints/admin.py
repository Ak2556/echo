from fastapi import APIRouter

router = APIRouter()


@router.get("/stats")
async def get_admin_stats():
    """Get admin dashboard statistics"""
    return {
        "total_users": 1247,
        "active_users": 342,
        "total_posts": 5829,
        "total_files": 3104,
        "server_uptime": "15 days",
        "storage_used": "45.2 GB",
    }


@router.get("/users")
async def get_all_users(limit: int = 50, offset: int = 0):
    """Get all users for admin management"""
    mock_users = [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "admin",
            "status": "active",
        },
        {
            "id": 2,
            "name": "Jane Smith",
            "email": "jane@example.com",
            "role": "user",
            "status": "active",
        },
        {
            "id": 3,
            "name": "Bob Johnson",
            "email": "bob@example.com",
            "role": "moderator",
            "status": "inactive",
        },
    ]
    return {"users": mock_users[offset : offset + limit], "total": len(mock_users)}


@router.put("/users/{user_id}/role")
async def update_user_role(user_id: int, role: str):
    """Update user role"""
    return {"success": True, "message": f"User {user_id} role updated to {role}"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    """Delete a user"""
    return {"success": True, "message": f"User {user_id} deleted"}


@router.get("/logs")
async def get_system_logs(limit: int = 100):
    """Get system logs"""
    return {
        "logs": [
            {
                "timestamp": "2025-10-12T10:30:00Z",
                "level": "INFO",
                "message": "User login successful",
            },
            {
                "timestamp": "2025-10-12T10:25:00Z",
                "level": "WARNING",
                "message": "High memory usage detected",
            },
        ]
    }
