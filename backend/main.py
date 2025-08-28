"""
Optimized FastAPI application with performance enhancements.
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
import openai
import os
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any
import json
import asyncio
from contextlib import asynccontextmanager

# Import performance optimizations
from app.core.performance import (
    setup_performance_middleware,
    cache_response,
    get_cached_personality_prompt,
    get_cached_language_instruction,
    lifespan
)
from app.config.settings import settings
import structlog

# Setup structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)

# Load environment variables
load_dotenv()

# Create FastAPI app with lifespan management
app = FastAPI(
    title="Echo API - Optimized",
    version="2.0.0",
    description="High-performance Echo API with caching, compression, and monitoring",
    lifespan=lifespan
)

# Setup performance middleware
app = setup_performance_middleware(app)

# Optimized Pydantic models with validation caching
class ChatRequest(BaseModel):
    message: Dict[str, Any]
    settings: Optional[Dict[str, Any]] = {}
    language: Optional[str] = "en"
    history: Optional[List[Dict[str, Any]]] = []
    
    @field_validator('message')
    @classmethod
    def validate_message(cls, v):
        if not v or (isinstance(v, dict) and not v.get('content')) and not isinstance(v, str):
            raise ValueError('Message content is required')
        return v

    class Config:
        # Enable validation caching for better performance
        validate_assignment = True
        use_enum_values = True

class ImageRequest(BaseModel):
    prompt: str
    
    @field_validator('prompt')
    @classmethod
    def validate_prompt(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Image prompt is required')
        if len(v) > 1000:
            raise ValueError('Image prompt too long (max 1000 characters)')
        return v.strip()

    class Config:
        validate_assignment = True
        use_enum_values = True

class PostRequest(BaseModel):
    content: str
    author: Optional[str] = "Anonymous"
    tags: Optional[List[str]] = []
    
    @field_validator('content')
    @classmethod
    def validate_content(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Post content is required')
        if len(v) > 5000:
            raise ValueError('Post content too long (max 5000 characters)')
        return v.strip()

    class Config:
        validate_assignment = True
        use_enum_values = True

# Initialize OpenAI client with connection pooling
openai_client = None
if os.getenv('OPENROUTER_API_KEY'):
    openai_client = openai.AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv('OPENROUTER_API_KEY'),
        max_retries=3,
        timeout=30.0
    )
    logger.info("OpenAI client initialized with async support")
else:
    logger.warning("OPENROUTER_API_KEY not found. AI features will be disabled.")

@app.get("/")
@cache_response(ttl=3600, key_prefix="root")
async def root():
    """Root endpoint with caching."""
    return {
        "message": "Echo API - Optimized",
        "version": "2.0.0",
        "features": [
            "Async processing",
            "Redis caching",
            "Rate limiting",
            "Compression",
            "Performance monitoring"
        ]
    }

@app.post("/api/chat")
async def chat(request: ChatRequest, background_tasks: BackgroundTasks):
    """Optimized chat endpoint with async processing and caching."""
    try:
        # Check if OpenAI client is available
        if not openai_client:
            return {
                "response": "AI features are currently unavailable. Please configure OPENROUTER_API_KEY.",
                "type": "error"
            }
            
        # Extract request data
        message = request.message
        ai_settings = request.settings or {}
        user_language = request.language or "en"

        # Process message format
        if isinstance(message, dict):
            message_content = message.get("content", "")
            message_role = message.get("role", "user")
        elif isinstance(message, str):
            message_content = message
            message_role = "user"
        else:
            message_content = str(message)
            message_role = "user"

        if not message_content:
            error_message = get_cached_error_message("message_required", user_language)
            raise HTTPException(status_code=400, detail=error_message)

        # Check for image generation request (optimized with caching)
        image_keywords = [
            'generate image', 'create image', 'draw', 'picture', 'generate picture', 'make image',
            'image of', 'picture of', 'generate a', 'create a', 'draw a', 'make a',
            'generate an', 'create an', 'draw an', 'make an'
        ]
        is_image_request = any(keyword in message_content.lower() for keyword in image_keywords)

        if is_image_request:
            # Handle image generation asynchronously
            return await handle_image_generation(message_content, background_tasks)

        # Build conversation messages
        history = request.history or []
        conversation_messages = []
        
        for hist_msg in history:
            if isinstance(hist_msg, dict) and "content" in hist_msg and "role" in hist_msg:
                conversation_messages.append({
                    "role": hist_msg["role"],
                    "content": hist_msg["content"]
                })

        conversation_messages.append({
            "role": message_role,
            "content": message_content
        })

        # Get AI settings with defaults
        model = ai_settings.get("model", "anthropic/claude-3-haiku")
        max_tokens = ai_settings.get("maxTokens", 500)
        temperature = ai_settings.get("temperature", 0.7)
        personality = ai_settings.get("personality", "helpful")

        # Use cached personality prompt
        system_message = {
            "role": "system",
            "content": get_cached_personality_prompt(personality, user_language)
        }

        full_messages = [system_message] + conversation_messages

        try:
            # Async OpenAI API call
            response = await openai_client.chat.completions.create(
                model=model,
                messages=full_messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            # Log successful request for monitoring
            background_tasks.add_task(
                log_chat_request,
                model=model,
                tokens=max_tokens,
                language=user_language
            )
            
            return {"response": response.choices[0].message.content}
            
        except Exception as api_error:
            logger.error("API error in chat endpoint", error=str(api_error))
            fallback_message = get_cached_error_message("api_error", user_language)
            return {
                "response": fallback_message,
                "type": "text",
                "error": True
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Unexpected error in chat endpoint", error=str(e))
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again later.")

async def handle_image_generation(message_content: str, background_tasks: BackgroundTasks):
    """Handle image generation requests asynchronously."""
    # Extract image prompt
    image_prompt = message_content
    prefixes_to_remove = [
        'generate an image of ', 'create an image of ', 'generate image of ', 'create image of ',
        'generate a ', 'create a ', 'draw a ', 'make a ', 'generate an ', 'create an ',
        'draw an ', 'make an ', 'draw ', 'generate image:', 'create image:',
        'make an image of ', 'generate picture of ', 'create picture of '
    ]
    
    for prefix in prefixes_to_remove:
        if image_prompt.lower().startswith(prefix):
            image_prompt = image_prompt[len(prefix):].strip()
            break

    try:
        # For demo purposes, use a placeholder service
        demo_image_url = f"https://picsum.photos/1024/768?random={abs(hash(image_prompt)) % 1000}"
        
        # Log image generation request
        background_tasks.add_task(
            log_image_request,
            prompt=image_prompt,
            success=True
        )
        
        return {
            "response": f"I've generated a demo image for you: {image_prompt}",
            "image_url": demo_image_url,
            "image_prompt": image_prompt,
            "revised_prompt": image_prompt,
            "type": "image"
        }
    except Exception as img_error:
        logger.error("Image generation failed", error=str(img_error))
        background_tasks.add_task(
            log_image_request,
            prompt=image_prompt,
            success=False
        )
        return {
            "response": f"I'd love to generate an image of '{image_prompt}' for you! Image generation is currently in development. For now, I can help you with text-based assistance. 🎨",
            "type": "text"
        }

@app.post("/api/generate-image")
async def generate_image(request: ImageRequest, background_tasks: BackgroundTasks):
    """Optimized image generation endpoint."""
    try:
        if not openai_client:
            raise HTTPException(status_code=503, detail="AI features are currently unavailable")
            
        prompt = request.prompt

        # Use async image generation
        response = await openai_client.images.generate(
            model="black-forest-labs/flux-1.1-pro",
            prompt=prompt,
            size="1024x1024",
            n=1
        )

        # Log successful generation
        background_tasks.add_task(
            log_image_request,
            prompt=prompt,
            success=True
        )

        return {
            "image_url": response.data[0].url,
            "prompt": prompt,
            "revised_prompt": getattr(response.data[0], 'revised_prompt', prompt)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in image generation endpoint", error=str(e))
        background_tasks.add_task(
            log_image_request,
            prompt=request.prompt,
            success=False
        )
        raise HTTPException(status_code=500, detail="Failed to generate image")

@app.get("/api/posts")
@cache_response(ttl=300, key_prefix="posts")
async def get_posts():
    """Get posts with caching."""
    # Simulate database query with async
    await asyncio.sleep(0.01)  # Simulate DB latency
    
    mock_posts = [
        {
            "id": "1",
            "content": "Welcome to Echo! 🎉",
            "author": "System",
            "tags": ["welcome", "announcement"],
            "timestamp": "2024-01-01T00:00:00Z",
            "likes": 42
        }
    ]
    return {"posts": mock_posts}

@app.get("/api/ai/models")
@cache_response(ttl=3600, key_prefix="models")
async def get_available_models():
    """Get available AI models with caching."""
    return {
        "models": [
            {"id": "anthropic/claude-3-haiku", "name": "Claude 3 Haiku (Fast)", "description": "Quick and efficient responses"},
            {"id": "anthropic/claude-3-sonnet", "name": "Claude 3 Sonnet (Balanced)", "description": "Balanced speed and capability"},
            {"id": "anthropic/claude-3-opus", "name": "Claude 3 Opus (Advanced)", "description": "Most capable model"},
            {"id": "openai/gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "description": "Fast and reliable"},
            {"id": "openai/gpt-4", "name": "GPT-4", "description": "Most advanced reasoning"}
        ]
    }

@app.get("/api/ai/personalities")
@cache_response(ttl=3600, key_prefix="personalities")
async def get_personalities():
    """Get AI personalities with caching."""
    return {
        "personalities": [
            {"id": "helpful", "name": "Helpful", "description": "Supportive and informative"},
            {"id": "casual", "name": "Casual", "description": "Laid-back and friendly"},
            {"id": "professional", "name": "Professional", "description": "Clear and structured"},
            {"id": "creative", "name": "Creative", "description": "Imaginative and enthusiastic"},
            {"id": "technical", "name": "Technical", "description": "Detailed and precise"}
        ]
    }

@app.post("/api/posts")
async def create_post(request: PostRequest, background_tasks: BackgroundTasks):
    """Create post with async processing."""
    import datetime
    
    new_post = {
        "id": f"post_{len(request.content)}",
        "content": request.content,
        "author": request.author,
        "tags": request.tags,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "likes": 0
    }
    
    # Process post asynchronously
    background_tasks.add_task(
        process_new_post,
        post_data=new_post
    )
    
    return new_post

@app.get("/api/languages")
@cache_response(ttl=3600, key_prefix="languages")
async def get_supported_languages():
    """Get supported languages with caching."""
    return {
        "languages": [
            {"code": "en", "name": "English", "nativeName": "English", "flag": "🇺🇸", "rtl": False},
            {"code": "es", "name": "Spanish", "nativeName": "Español", "flag": "🇪🇸", "rtl": False},
            {"code": "fr", "name": "French", "nativeName": "Français", "flag": "🇫🇷", "rtl": False},
            {"code": "de", "name": "German", "nativeName": "Deutsch", "flag": "🇩🇪", "rtl": False},
            {"code": "it", "name": "Italian", "nativeName": "Italiano", "flag": "🇮🇹", "rtl": False},
            {"code": "pt", "name": "Portuguese", "nativeName": "Português", "flag": "🇵🇹", "rtl": False},
            {"code": "ru", "name": "Russian", "nativeName": "Русский", "flag": "🇷🇺", "rtl": False},
            {"code": "zh", "name": "Chinese", "nativeName": "中文", "flag": "🇨🇳", "rtl": False},
            {"code": "ja", "name": "Japanese", "nativeName": "日本語", "flag": "🇯🇵", "rtl": False},
            {"code": "ar", "name": "Arabic", "nativeName": "العربية", "flag": "🇸🇦", "rtl": True},
            {"code": "hi", "name": "Hindi", "nativeName": "हिंदी", "flag": "🇮🇳", "rtl": False},
            {"code": "he", "name": "Hebrew", "nativeName": "עברית", "flag": "🇮🇱", "rtl": True}
        ]
    }

# Background task functions
async def log_chat_request(model: str, tokens: int, language: str):
    """Log chat request for analytics."""
    logger.info(
        "Chat request processed",
        model=model,
        tokens=tokens,
        language=language
    )

async def log_image_request(prompt: str, success: bool):
    """Log image generation request."""
    logger.info(
        "Image generation request",
        prompt_length=len(prompt),
        success=success
    )

async def process_new_post(post_data: dict):
    """Process new post in background."""
    # Simulate post processing (content moderation, indexing, etc.)
    await asyncio.sleep(0.1)
    logger.info("Post processed", post_id=post_data["id"])

# Cached error message function
from functools import lru_cache

@lru_cache(maxsize=200)
def get_cached_error_message(error_type: str, language: str) -> str:
    """Get cached localized error messages."""
    error_messages = {
        "message_required": {
            "en": "Message content is required",
            "es": "El contenido del mensaje es obligatorio",
            "fr": "Le contenu du message est requis",
            "de": "Nachrichteninhalt ist erforderlich",
            "it": "Il contenuto del messaggio è obbligatorio",
            "pt": "O conteúdo da mensagem é obrigatório",
            "ru": "Содержание сообщения обязательно",
            "zh": "消息内容是必需的",
            "ja": "メッセージの内容が必要です",
            "ar": "محتوى الرسالة مطلوب",
            "hi": "संदेश सामग्री आवश्यक है",
            "he": "תוכן ההודעה נדרש"
        },
        "api_error": {
            "en": "I'm experiencing some technical difficulties right now. Please try again in a moment, or refresh the page to reconnect.",
            "es": "Estoy experimentando algunas dificultades técnicas en este momento. Por favor, inténtalo de nuevo en un momento, o actualiza la página para reconectar.",
            "fr": "Je rencontre quelques difficultés techniques en ce moment. Veuillez réessayer dans un moment, ou actualisez la page pour vous reconnecter.",
            "de": "Ich habe gerade einige technische Schwierigkeiten. Bitte versuchen Sie es in einem Moment erneut oder aktualisieren Sie die Seite, um sich wieder zu verbinden.",
            "it": "Sto riscontrando alcune difficoltà tecniche al momento. Per favore, riprova tra un momento, o aggiorna la pagina per riconnetterti.",
            "pt": "Estou enfrentando algumas dificuldades técnicas no momento. Por favor, tente novamente em um momento, ou atualize a página para reconectar.",
            "ru": "У меня сейчас технические трудности. Пожалуйста, попробуйте еще раз через мгновение или обновите страницу для переподключения.",
            "zh": "我现在遇到了一些技术困难。请稍后再试，或刷新页面重新连接。",
            "ja": "現在技術的な問題が発生しています。しばらくしてからもう一度お試しいただくか、ページを更新して再接続してください。",
            "ar": "أواجه بعض الصعوبات التقنية الآن. يرجى المحاولة مرة أخرى في لحظة، أو تحديث الصفحة لإعادة الاتصال.",
            "hi": "मुझे अभी कुछ तकनीकी कठिनाइयों का सामना कर रहा हूं। कृपया एक क्षण में फिर से कोशिश करें, या पुनः कनेक्ट करने के लिए पेज को ताज़ा करें।",
            "he": "אני חווה כעת קשיים טכניים. אנא נסה שוב בעוד רגע, או רענן את הדף כדי להתחבר מחדש."
        }
    }

    return error_messages.get(error_type, {}).get(language, error_messages.get(error_type, {}).get("en", "An error occurred"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable reload in production
        workers=1,  # Use 1 worker for development, scale in production
        loop="uvloop",  # Use uvloop for better performance
        http="httptools",  # Use httptools for better HTTP parsing
        log_config={
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                },
            },
            "handlers": {
                "default": {
                    "formatter": "default",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
            },
            "root": {
                "level": "INFO",
                "handlers": ["default"],
            },
        }
    )