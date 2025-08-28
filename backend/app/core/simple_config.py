"""Simple configuration management for Echo API."""

import os
from typing import Optional, List, Dict, Any

class Settings:
    """Simple application settings."""
    
    def __init__(self):
        # Application
        self.APP_NAME = "Echo API"
        self.APP_VERSION = "2.0.0"
        self.DEBUG = os.getenv("DEBUG", "False").lower() == "true"
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
        
        # Server
        self.HOST = os.getenv("HOST", "0.0.0.0")
        self.PORT = int(os.getenv("PORT", "8000"))
        self.WORKERS = int(os.getenv("WORKERS", "1"))
        
        # Security
        self.SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-make-it-at-least-32-characters-long")
        if self.SECRET_KEY == "your-secret-key-here-make-it-at-least-32-characters-long" and self.is_production:
            raise ValueError("SECRET_KEY must be set in production environment")
        
        # CORS
        cors_env = os.getenv("CORS_ORIGINS", "")
        if cors_env:
            self.CORS_ORIGINS = [origin.strip() for origin in cors_env.split(",")]
        else:
            # Default to localhost for development
            self.CORS_ORIGINS = [
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002"
            ]
        
        # OpenAI/OpenRouter
        self.OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.DEFAULT_AI_MODEL = os.getenv("DEFAULT_AI_MODEL", "anthropic/claude-3-haiku")
        
        # Redis (optional)
        self.REDIS_URL = os.getenv("REDIS_URL")
        
        # Database (optional)
        self.DATABASE_URL = os.getenv("DATABASE_URL")
        
        # Logging
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
        
        # Feature Flags
        self.FEATURE_AI_CHAT = os.getenv("FEATURE_AI_CHAT", "True").lower() == "true"
        self.FEATURE_IMAGE_GENERATION = os.getenv("FEATURE_IMAGE_GENERATION", "True").lower() == "true"
        
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"
    
    def get_cors_config(self) -> Dict[str, Any]:
        """Get CORS configuration."""
        return {
            "allow_origins": self.CORS_ORIGINS,
            "allow_credentials": True,
            "allow_methods": ["*"],
            "allow_headers": ["*"],
        }

# Global settings instance
settings = Settings()

def get_settings() -> Settings:
    """Get settings instance."""
    return settings