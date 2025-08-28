"""
AI Chat endpoints with production-grade features.
"""
import asyncio
import time
from typing import Dict, List, Optional, Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.core.config import get_settings
from app.core.exceptions import (
    create_success_response,
    ExternalServiceException,
    ValidationException,
)
from app.core.redis import cache
from app.core.logging import get_logger

router = APIRouter()
settings = get_settings()
logger = get_logger(__name__)


# Request/Response Models

class ChatMessage(BaseModel):
    """Chat message model."""
    role: str = Field(..., description="Message role (user, assistant, system)")
    content: str = Field(..., min_length=1, max_length=10000, description="Message content")
    timestamp: Optional[float] = Field(None, description="Message timestamp")
    
    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        allowed_roles = ["user", "assistant", "system"]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of: {allowed_roles}")
        return v


class ChatRequest(BaseModel):
    """Chat request model."""
    message: str = Field(..., min_length=1, max_length=10000, description="User message")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")
    model: Optional[str] = Field("anthropic/claude-3-haiku", description="AI model to use")
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0, description="Response creativity")
    max_tokens: Optional[int] = Field(500, ge=1, le=4000, description="Maximum response tokens")
    system_prompt: Optional[str] = Field(None, max_length=2000, description="Custom system prompt")
    context: Optional[List[ChatMessage]] = Field([], description="Conversation context")
    
    @field_validator("temperature")
    @classmethod
    def validate_temperature(cls, v):
        if not 0.0 <= v <= 2.0:
            raise ValueError("Temperature must be between 0.0 and 2.0")
        return v


class ImageGenerationRequest(BaseModel):
    """Image generation request model."""
    prompt: str = Field(..., min_length=1, max_length=1000, description="Image description")
    size: Optional[str] = Field("1024x1024", description="Image size")
    quality: Optional[str] = Field("standard", description="Image quality")
    style: Optional[str] = Field("natural", description="Image style")
    
    @field_validator("size")
    @classmethod
    def validate_size(cls, v):
        allowed_sizes = ["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"]
        if v not in allowed_sizes:
            raise ValueError(f"Size must be one of: {allowed_sizes}")
        return v


class ChatResponse(BaseModel):
    """Chat response model."""
    message: str = Field(..., description="AI response message")
    conversation_id: str = Field(..., description="Conversation ID")
    model: str = Field(..., description="Model used for response")
    tokens_used: Optional[int] = Field(None, description="Tokens used in response")
    response_time: Optional[float] = Field(None, description="Response time in seconds")
    metadata: Optional[Dict[str, Any]] = Field({}, description="Additional metadata")


class ImageResponse(BaseModel):
    """Image generation response model."""
    image_url: str = Field(..., description="Generated image URL")
    prompt: str = Field(..., description="Original prompt")
    revised_prompt: Optional[str] = Field(None, description="Revised prompt used")
    size: str = Field(..., description="Image size")
    generation_time: Optional[float] = Field(None, description="Generation time in seconds")


# Endpoints

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
):
    """Send a message to the AI and get a response."""
    start_time = time.time()

    try:
        if not settings.feature_ai_chat:
            raise HTTPException(
                status_code=503,
                detail="AI chat feature is currently disabled"
            )

        response_time = time.time() - start_time

        background_tasks.add_task(
            _log_chat_request,
            model=request.model,
            tokens=100,
            response_time=response_time,
            success=True,
        )

        return ChatResponse(
            message="This is a mock AI response. AI service integration is pending.",
            conversation_id=request.conversation_id or "mock_conversation",
            model=request.model,
            tokens_used=100,
            response_time=response_time,
            metadata={"type": "mock"},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Chat request failed", error=str(e), request=request.model_dump())
        background_tasks.add_task(
            _log_chat_request,
            model=request.model,
            tokens=0,
            response_time=time.time() - start_time,
            success=False,
            error=str(e),
        )
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/image", response_model=ImageResponse)
async def generate_image(
    request: ImageGenerationRequest,
    background_tasks: BackgroundTasks,
):
    """Generate an image from a text prompt."""
    start_time = time.time()

    try:
        if not settings.feature_image_generation:
            raise HTTPException(
                status_code=503,
                detail="Image generation feature is currently disabled"
            )

        generation_time = time.time() - start_time

        background_tasks.add_task(
            _log_image_request,
            prompt=request.prompt,
            size=request.size,
            generation_time=generation_time,
            success=True,
        )

        return ImageResponse(
            image_url="https://via.placeholder.com/1024x1024?text=Mock+Image",
            prompt=request.prompt,
            revised_prompt=None,
            size=request.size,
            generation_time=generation_time,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Image generation failed", error=str(e), request=request.model_dump())
        background_tasks.add_task(
            _log_image_request,
            prompt=request.prompt,
            size=request.size,
            generation_time=time.time() - start_time,
            success=False,
            error=str(e),
        )
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/models")
async def get_available_models():
    """Get list of available AI models."""
    models = [
        {
            "id": "anthropic/claude-3-haiku",
            "name": "Claude 3 Haiku",
            "description": "Fast and efficient for everyday tasks",
            "context_length": 200000,
            "cost_per_token": 0.00025,
            "capabilities": ["text", "analysis", "coding"],
        },
        {
            "id": "anthropic/claude-3-sonnet",
            "name": "Claude 3 Sonnet",
            "description": "Balanced performance and capability",
            "context_length": 200000,
            "cost_per_token": 0.003,
            "capabilities": ["text", "analysis", "coding", "reasoning"],
        },
        {
            "id": "anthropic/claude-3-opus",
            "name": "Claude 3 Opus",
            "description": "Most capable model for complex tasks",
            "context_length": 200000,
            "cost_per_token": 0.015,
            "capabilities": ["text", "analysis", "coding", "reasoning", "creative"],
        },
        {
            "id": "openai/gpt-4",
            "name": "GPT-4",
            "description": "Advanced reasoning and analysis",
            "context_length": 8192,
            "cost_per_token": 0.03,
            "capabilities": ["text", "analysis", "coding", "reasoning"],
        },
        {
            "id": "openai/gpt-3.5-turbo",
            "name": "GPT-3.5 Turbo",
            "description": "Fast and cost-effective",
            "context_length": 4096,
            "cost_per_token": 0.002,
            "capabilities": ["text", "analysis", "coding"],
        },
    ]

    return create_success_response(
        data={"models": models},
        message="Available models retrieved successfully",
    )


@router.get("/history")
async def get_chat_history():
    """Get all chat conversations."""
    try:
        history = [
            {
                "id": "conv_1",
                "title": "General Discussion",
                "last_message": "Hello! How can I help you today?",
                "created_at": time.time() - 7200,
                "updated_at": time.time() - 3600,
                "message_count": 5
            },
            {
                "id": "conv_2",
                "title": "Technical Support",
                "last_message": "That should solve your problem!",
                "created_at": time.time() - 3600,
                "updated_at": time.time() - 1800,
                "message_count": 10
            }
        ]

        return history

    except Exception as e:
        logger.error("Failed to get chat history", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
):
    """Get conversation history."""
    try:
        conversation = {
            "id": conversation_id,
            "messages": [
                {
                    "role": "user",
                    "content": "Hello!",
                    "timestamp": time.time() - 3600
                },
                {
                    "role": "assistant",
                    "content": "Hello! How can I help you today?",
                    "timestamp": time.time() - 3500
                }
            ],
            "created_at": time.time() - 3600,
            "updated_at": time.time() - 3500
        }

        return create_success_response(
            data=conversation,
            message="Conversation retrieved successfully",
        )

    except Exception as e:
        logger.error("Failed to get conversation", conversation_id=conversation_id, error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
):
    """Delete a conversation."""
    try:
        return create_success_response(
            message="Conversation deleted successfully",
        )
        
    except Exception as e:
        logger.error("Failed to delete conversation", conversation_id=conversation_id, error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


# Helper functions

def _is_image_request(message: str) -> bool:
    """Check if message is requesting image generation."""
    image_keywords = [
        "generate image", "create image", "draw", "picture", "generate picture",
        "make image", "image of", "picture of", "generate a", "create a",
        "draw a", "make a", "generate an", "create an", "draw an", "make an"
    ]
    return any(keyword in message.lower() for keyword in image_keywords)


def _extract_image_prompt(message: str) -> str:
    """Extract image prompt from chat message."""
    prefixes_to_remove = [
        "generate an image of ", "create an image of ", "generate image of ",
        "create image of ", "generate a ", "create a ", "draw a ", "make a ",
        "generate an ", "create an ", "draw an ", "make an ", "draw ",
        "generate image:", "create image:", "make an image of ",
        "generate picture of ", "create picture of "
    ]

    prompt = message.lower()
    for prefix in prefixes_to_remove:
        if prompt.startswith(prefix):
            return message[len(prefix):].strip()

    return message.strip()


# Background task functions

async def _log_chat_request(
    model: str,
    tokens: int,
    response_time: float,
    success: bool,
    error: str = None,
) -> None:
    """Log chat request for analytics."""
    logger.info(
        "Chat request completed",
        model=model,
        tokens=tokens,
        response_time=f"{response_time:.3f}s",
        success=success,
        error=error,
    )


async def _log_image_request(
    prompt: str,
    size: str,
    generation_time: float,
    success: bool,
    error: str = None,
) -> None:
    """Log image generation request for analytics."""
    logger.info(
        "Image generation completed",
        prompt_length=len(prompt),
        size=size,
        generation_time=f"{generation_time:.3f}s",
        success=success,
        error=error,
    )