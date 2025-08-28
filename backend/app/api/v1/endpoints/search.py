from fastapi import APIRouter, Query
from typing import Optional, List
from enum import Enum

router = APIRouter()

class SearchType(str, Enum):
    ALL = "all"
    USERS = "users"
    POSTS = "posts"
    FILES = "files"

# Mock database
mock_data = {
    "users": [
        {"id": 1, "name": "John Doe", "email": "john@example.com", "role": "admin"},
        {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "role": "user"},
        {"id": 3, "name": "Bob Johnson", "email": "bob@example.com", "role": "moderator"},
    ],
    "posts": [
        {"id": 1, "title": "Getting Started with Echo", "content": "Welcome to Echo platform", "author": "John Doe"},
        {"id": 2, "title": "Advanced Features", "content": "Exploring advanced search", "author": "Jane Smith"},
        {"id": 3, "title": "Best Practices", "content": "How to use Echo effectively", "author": "Bob Johnson"},
    ],
    "files": [
        {"id": 1, "name": "document.pdf", "type": "pdf", "size": 1024},
        {"id": 2, "name": "image.png", "type": "image", "size": 2048},
        {"id": 3, "name": "data.csv", "type": "csv", "size": 512},
    ]
}

@router.get("/")
@router.get("/search")
async def advanced_search(
    q: str = Query(..., description="Search query"),
    search_type: SearchType = Query(SearchType.ALL, description="Type of search"),
    limit: int = Query(10, ge=1, le=100, description="Number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    sort_by: Optional[str] = Query(None, description="Sort field"),
    order: Optional[str] = Query("asc", pattern="^(asc|desc)$")
):
    """Advanced search with filters, pagination, and sorting"""
    
    results = {"query": q, "results": {}}
    query_lower = q.lower()
    
    if search_type in [SearchType.ALL, SearchType.USERS]:
        user_results = [
            user for user in mock_data["users"]
            if query_lower in user["name"].lower() or query_lower in user["email"].lower()
        ]
        results["results"]["users"] = user_results[offset:offset+limit]
    
    if search_type in [SearchType.ALL, SearchType.POSTS]:
        post_results = [
            post for post in mock_data["posts"]
            if query_lower in post["title"].lower() or query_lower in post["content"].lower()
        ]
        results["results"]["posts"] = post_results[offset:offset+limit]
    
    if search_type in [SearchType.ALL, SearchType.FILES]:
        file_results = [
            file for file in mock_data["files"]
            if query_lower in file["name"].lower()
        ]
        results["results"]["files"] = file_results[offset:offset+limit]
    
    return results

@router.get("/autocomplete")
async def autocomplete(
    q: str = Query(..., min_length=1, description="Partial query for autocomplete"),
    limit: int = Query(5, ge=1, le=20)
):
    """Autocomplete suggestions based on partial query"""
    
    query_lower = q.lower()
    suggestions = []
    
    for user in mock_data["users"]:
        if query_lower in user["name"].lower():
            suggestions.append({"type": "user", "text": user["name"], "id": user["id"]})
    
    for post in mock_data["posts"]:
        if query_lower in post["title"].lower():
            suggestions.append({"type": "post", "text": post["title"], "id": post["id"]})
    
    return {"suggestions": suggestions[:limit]}

@router.get("/filters")
async def get_filters():
    """Get available search filters"""
    return {
        "types": ["all", "users", "posts", "files"],
        "user_roles": ["admin", "user", "moderator"],
        "file_types": ["pdf", "image", "csv", "document"],
        "sort_options": ["relevance", "date", "name", "size"]
    }
