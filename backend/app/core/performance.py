"""
Performance optimization utilities and middleware for the Echo API.
"""
import time
import asyncio
import gzip
import json
from typing import Dict, Any, Optional, List
from functools import wraps, lru_cache
from contextlib import asynccontextmanager

import redis
import structlog
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from ..config.settings import settings

logger = structlog.get_logger(__name__)

# Redis connection for caching
redis_client: Optional[redis.Redis] = None

def init_redis():
    """Initialize Redis connection for caching."""
    global redis_client
    try:
        redis_client = redis.from_url(
            settings.redis_url,
            max_connections=settings.redis_max_connections,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True
        )
        # Test connection
        redis_client.ping()
        logger.info("Redis connection established", url=settings.redis_url)
    except Exception as e:
        logger.warning("Redis connection failed, caching disabled", error=str(e))
        redis_client = None

def get_redis() -> Optional[redis.Redis]:
    """Get Redis client instance."""
    return redis_client

class PerformanceMiddleware(BaseHTTPMiddleware):
    """Middleware for performance monitoring and optimization."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.request_times: Dict[str, List[float]] = {}
        
    async def dispatch(self, request: Request, call_next):
        # Start timing
        start_time = time.time()
        
        # Add request ID for tracing
        request_id = f"{int(start_time * 1000000)}"
        request.state.request_id = request_id
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Add performance headers
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Request-ID"] = request_id
        
        # Log slow requests
        if process_time > 1.0:  # Log requests taking more than 1 second
            logger.warning(
                "Slow request detected",
                method=request.method,
                url=str(request.url),
                process_time=process_time,
                request_id=request_id
            )
        
        # Track request times for monitoring
        endpoint = f"{request.method} {request.url.path}"
        if endpoint not in self.request_times:
            self.request_times[endpoint] = []
        
        self.request_times[endpoint].append(process_time)
        
        # Keep only last 100 requests per endpoint
        if len(self.request_times[endpoint]) > 100:
            self.request_times[endpoint] = self.request_times[endpoint][-100:]
        
        return response
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics."""
        stats = {}
        for endpoint, times in self.request_times.items():
            if times:
                stats[endpoint] = {
                    "count": len(times),
                    "avg_time": sum(times) / len(times),
                    "min_time": min(times),
                    "max_time": max(times),
                    "p95_time": sorted(times)[int(len(times) * 0.95)] if len(times) > 20 else max(times)
                }
        return stats

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware using Redis."""
    
    def __init__(self, app: ASGIApp, requests_per_minute: int = 100):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.window_size = 60  # 1 minute window
        
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/metrics"]:
            return await call_next(request)
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Check rate limit
        if redis_client:
            try:
                key = f"rate_limit:{client_ip}"
                current_requests = await asyncio.to_thread(redis_client.get, key)
                
                if current_requests is None:
                    # First request in window
                    await asyncio.to_thread(redis_client.setex, key, self.window_size, 1)
                elif int(current_requests) >= self.requests_per_minute:
                    # Rate limit exceeded
                    return JSONResponse(
                        status_code=429,
                        content={
                            "error": "Rate limit exceeded",
                            "message": f"Maximum {self.requests_per_minute} requests per minute allowed"
                        },
                        headers={"Retry-After": "60"}
                    )
                else:
                    # Increment counter
                    await asyncio.to_thread(redis_client.incr, key)
            except Exception as e:
                logger.warning("Rate limiting failed", error=str(e))
                # Continue without rate limiting if Redis fails
        
        return await call_next(request)

def cache_response(ttl: int = 300, key_prefix: str = "api"):
    """Decorator for caching API responses."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not redis_client:
                return await func(*args, **kwargs)
            
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
            
            try:
                # Try to get from cache
                cached_result = await asyncio.to_thread(redis_client.get, cache_key)
                if cached_result:
                    logger.debug("Cache hit", key=cache_key)
                    return json.loads(cached_result)
                
                # Execute function
                result = await func(*args, **kwargs)
                
                # Cache result
                await asyncio.to_thread(
                    redis_client.setex,
                    cache_key,
                    ttl,
                    json.dumps(result, default=str)
                )
                logger.debug("Cache set", key=cache_key, ttl=ttl)
                
                return result
            except Exception as e:
                logger.warning("Cache operation failed", error=str(e))
                return await func(*args, **kwargs)
        
        return wrapper
    return decorator

@lru_cache(maxsize=1000)
def get_cached_language_instruction(language: str) -> str:
    """Cached language instruction lookup."""
    language_map = {
        "en": "Please respond in English.",
        "es": "Por favor, responde en español.",
        "fr": "Veuillez répondre en français.",
        "de": "Bitte antworten Sie auf Deutsch.",
        "it": "Per favore, rispondi in italiano.",
        "pt": "Por favor, responda em português.",
        "ru": "Пожалуйста, отвечайте на русском языке.",
        "zh": "请用中文回答。",
        "ja": "日本語で回答してください。",
        "ar": "يرجى الرد باللغة العربية.",
        "hi": "कृपया हिंदी में उत्तर दें।",
        "he": "אנא השב בעברית."
    }
    return language_map.get(language, language_map["en"])

@lru_cache(maxsize=500)
def get_cached_personality_prompt(personality: str, language: str = "en") -> str:
    """Cached personality prompt generation."""
    language_instructions = get_cached_language_instruction(language)

    personalities = {
        "helpful": f"You are a helpful and friendly AI assistant for Echo, a social media platform. Be supportive, informative, and encouraging while helping users with their questions. {language_instructions}",
        "casual": f"You are a laid-back, casual AI assistant for Echo. Use a relaxed, friendly tone and feel free to use emojis and casual language. Keep things fun and approachable. {language_instructions}",
        "professional": f"You are a professional AI assistant for Echo. Provide clear, concise, and well-structured responses. Maintain a professional but warm tone. {language_instructions}",
        "creative": f"You are a creative and imaginative AI assistant for Echo. Be enthusiastic, use vivid language, and help users explore creative ideas and possibilities. {language_instructions}",
        "technical": f"You are a technically-focused AI assistant for Echo. Provide detailed, accurate technical information and explanations. Be precise and thorough in your responses. {language_instructions}"
    }
    return personalities.get(personality, personalities["helpful"])

class CompressionMiddleware(BaseHTTPMiddleware):
    """Enhanced compression middleware with multiple algorithms."""
    
    def __init__(self, app: ASGIApp, minimum_size: int = 1024):
        super().__init__(app)
        self.minimum_size = minimum_size
        
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Check if response should be compressed
        if (
            response.status_code < 200 or
            response.status_code >= 300 or
            "content-encoding" in response.headers or
            "content-length" not in response.headers or
            int(response.headers.get("content-length", 0)) < self.minimum_size
        ):
            return response
        
        # Check Accept-Encoding header
        accept_encoding = request.headers.get("accept-encoding", "")
        
        if "gzip" in accept_encoding:
            # Compress response body
            body = b""
            async for chunk in response.body_iterator:
                body += chunk
            
            if len(body) >= self.minimum_size:
                compressed_body = gzip.compress(body)
                response.headers["content-encoding"] = "gzip"
                response.headers["content-length"] = str(len(compressed_body))
                
                # Create new response with compressed body
                return Response(
                    content=compressed_body,
                    status_code=response.status_code,
                    headers=response.headers,
                    media_type=response.media_type
                )
        
        return response

def setup_performance_middleware(app: FastAPI) -> FastAPI:
    """Setup all performance-related middleware."""
    
    # Initialize Redis
    init_redis()
    
    # Add compression middleware
    app.add_middleware(GZipMiddleware, minimum_size=1024)
    
    # Add custom compression middleware for better control
    app.add_middleware(CompressionMiddleware, minimum_size=1024)
    
    # Add performance monitoring middleware
    performance_middleware = PerformanceMiddleware(app)
    app.add_middleware(PerformanceMiddleware)
    
    # Add rate limiting middleware
    app.add_middleware(
        RateLimitMiddleware,
        requests_per_minute=settings.rate_limit_requests
    )
    
    # Add CORS middleware with optimizations
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        max_age=3600,  # Cache preflight requests for 1 hour
    )
    
    # Add performance monitoring endpoint
    @app.get("/api/performance/stats")
    async def get_performance_stats():
        """Get performance statistics."""
        return performance_middleware.get_performance_stats()
    
    # Add health check endpoint
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {
            "status": "healthy",
            "timestamp": time.time(),
            "redis": redis_client is not None
        }
    
    logger.info("Performance middleware setup completed")
    return app

# Background task for cache warming
async def warm_cache():
    """Warm up frequently accessed cache entries."""
    if not redis_client:
        return
    
    try:
        # Pre-cache common language instructions
        for lang in ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ar", "hi", "he"]:
            get_cached_language_instruction(lang)
        
        # Pre-cache common personality prompts
        personalities = ["helpful", "casual", "professional", "creative", "technical"]
        languages = ["en", "es", "fr"]
        
        for personality in personalities:
            for language in languages:
                get_cached_personality_prompt(personality, language)
        
        logger.info("Cache warming completed")
    except Exception as e:
        logger.warning("Cache warming failed", error=str(e))

# Async context manager for application lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    # Startup
    logger.info("Starting Echo API with performance optimizations")
    await warm_cache()
    
    yield
    
    # Shutdown
    logger.info("Shutting down Echo API")
    if redis_client:
        redis_client.close()