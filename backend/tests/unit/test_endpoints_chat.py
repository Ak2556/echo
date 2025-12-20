"""
Unit tests for chat endpoints.
"""

from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import HTTPException

from app.api.v1.endpoints.chat import (
    ChatRequest,
    ImageGenerationRequest,
    chat,
    delete_conversation,
    generate_image,
    get_available_models,
    get_chat_history,
    get_conversation,
)


class TestChatEndpoints:
    """Tests for chat endpoints."""

    @pytest.mark.asyncio
    async def test_chat_feature_disabled(self):
        """Test chat when feature is disabled."""
        request = ChatRequest(message="Hello")
        background_tasks = Mock()

        with patch("app.api.v1.endpoints.chat.settings") as mock_settings:
            mock_settings.feature_ai_chat = False

            with pytest.raises(HTTPException) as exc_info:
                await chat(request, background_tasks)

            assert exc_info.value.status_code == 503

    @pytest.mark.asyncio
    async def test_chat_success(self):
        """Test successful chat request."""
        request = ChatRequest(message="Hello", conversation_id="test-conv")
        background_tasks = Mock()
        background_tasks.add_task = Mock()

        with patch("app.api.v1.endpoints.chat.settings") as mock_settings:
            mock_settings.feature_ai_chat = True

            response = await chat(request, background_tasks)

            assert response.message is not None
            assert response.conversation_id == "test-conv"
            assert response.model == "anthropic/claude-3-haiku"
            assert response.tokens_used == 100
            background_tasks.add_task.assert_called()

    @pytest.mark.asyncio
    async def test_chat_with_context(self):
        """Test chat with conversation context."""
        from app.api.v1.endpoints.chat import ChatMessage

        context = [
            ChatMessage(role="user", content="Hi"),
            ChatMessage(role="assistant", content="Hello!"),
        ]
        request = ChatRequest(
            message="How are you?", context=context, temperature=0.8, max_tokens=1000
        )
        background_tasks = Mock()
        background_tasks.add_task = Mock()

        with patch("app.api.v1.endpoints.chat.settings") as mock_settings:
            mock_settings.feature_ai_chat = True

            response = await chat(request, background_tasks)

            assert response.message is not None
            assert response.tokens_used == 100

    @pytest.mark.asyncio
    async def test_generate_image_feature_disabled(self):
        """Test image generation when feature is disabled."""
        request = ImageGenerationRequest(prompt="A beautiful sunset")
        background_tasks = Mock()

        with patch("app.api.v1.endpoints.chat.settings") as mock_settings:
            mock_settings.feature_image_generation = False

            with pytest.raises(HTTPException) as exc_info:
                await generate_image(request, background_tasks)

            assert exc_info.value.status_code == 503

    @pytest.mark.asyncio
    async def test_generate_image_success(self):
        """Test successful image generation."""
        request = ImageGenerationRequest(
            prompt="A beautiful sunset", size="1024x1024", quality="standard"
        )
        background_tasks = Mock()
        background_tasks.add_task = Mock()

        with patch("app.api.v1.endpoints.chat.settings") as mock_settings:
            mock_settings.feature_image_generation = True

            response = await generate_image(request, background_tasks)

            assert response.image_url is not None
            assert response.prompt == "A beautiful sunset"
            assert response.size == "1024x1024"
            background_tasks.add_task.assert_called()

    @pytest.mark.asyncio
    async def test_get_available_models(self):
        """Test getting available models."""
        response = await get_available_models()

        assert response["success"] is True
        assert "models" in response["data"]
        assert len(response["data"]["models"]) > 0

        # Check model structure
        model = response["data"]["models"][0]
        assert "id" in model
        assert "name" in model
        assert "description" in model

    @pytest.mark.asyncio
    async def test_get_chat_history(self):
        """Test getting chat history."""
        history = await get_chat_history()

        assert isinstance(history, list)
        assert len(history) > 0

        # Check history structure
        conversation = history[0]
        assert "id" in conversation
        assert "title" in conversation
        assert "last_message" in conversation

    @pytest.mark.asyncio
    async def test_get_conversation(self):
        """Test getting conversation."""
        conversation_id = "test-conv-123"

        response = await get_conversation(conversation_id)

        assert response["success"] is True
        assert "messages" in response["data"]
        assert len(response["data"]["messages"]) > 0

    @pytest.mark.asyncio
    async def test_delete_conversation(self):
        """Test deleting conversation."""
        conversation_id = "test-conv-123"

        response = await delete_conversation(conversation_id)

        assert response["success"] is True
        assert "deleted successfully" in response["message"]


class TestChatValidation:
    """Tests for chat request validation."""

    def test_chat_message_validation(self):
        """Test ChatMessage validation."""
        from app.api.v1.endpoints.chat import ChatMessage

        # Valid message
        msg = ChatMessage(role="user", content="Hello")
        assert msg.role == "user"
        assert msg.content == "Hello"

        # Invalid role should raise validation error
        with pytest.raises(Exception):
            ChatMessage(role="invalid", content="Hello")

    def test_chat_request_validation(self):
        """Test ChatRequest validation."""
        # Valid request
        request = ChatRequest(message="Hello")
        assert request.message == "Hello"
        assert request.temperature == 0.7

        # Test temperature bounds
        with pytest.raises(Exception):
            ChatRequest(message="Hello", temperature=3.0)

    def test_image_request_validation(self):
        """Test ImageGenerationRequest validation."""
        # Valid request
        request = ImageGenerationRequest(prompt="A sunset")
        assert request.prompt == "A sunset"
        assert request.size == "1024x1024"

        # Invalid size should raise validation error
        with pytest.raises(Exception):
            ImageGenerationRequest(prompt="Test", size="invalid")
