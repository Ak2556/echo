"""
Unit tests for Email Service.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.auth.email_service import EmailService, init_email_service, get_email_service


@pytest.fixture
def email_service():
    """Create email service instance"""
    return EmailService(
        smtp_host="smtp.test.com",
        smtp_port=587,
        smtp_user="test@test.com",
        smtp_password="testpassword",
        from_email="noreply@echo.com",
        from_name="Echo Test",
        use_tls=True
    )


class TestEmailService:
    """Tests for EmailService class"""

    def test_email_service_initialization(self, email_service):
        """Test email service initialization"""
        assert email_service.smtp_host == "smtp.test.com"
        assert email_service.smtp_port == 587
        assert email_service.smtp_user == "test@test.com"
        assert email_service.smtp_password == "testpassword"
        assert email_service.from_email == "noreply@echo.com"
        assert email_service.from_name == "Echo Test"
        assert email_service.use_tls is True

    @pytest.mark.asyncio
    async def test_send_email_success(self, email_service):
        """Test sending email successfully"""
        with patch('app.auth.email_service.aiosmtplib.send', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = None

            result = await email_service.send_email(
                to_email="user@test.com",
                subject="Test Subject",
                html_content="<p>Test HTML</p>",
                text_content="Test Text"
            )

            assert result is True
            assert mock_send.called
            # Verify message parameters
            call_args = mock_send.call_args
            assert call_args[1]['hostname'] == "smtp.test.com"
            assert call_args[1]['port'] == 587
            assert call_args[1]['username'] == "test@test.com"
            assert call_args[1]['password'] == "testpassword"
            assert call_args[1]['use_tls'] is True

    @pytest.mark.asyncio
    async def test_send_email_without_text_content(self, email_service):
        """Test sending email without text content"""
        with patch('app.auth.email_service.aiosmtplib.send', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = None

            result = await email_service.send_email(
                to_email="user@test.com",
                subject="Test Subject",
                html_content="<p>Test HTML</p>"
            )

            assert result is True
            assert mock_send.called

    @pytest.mark.asyncio
    async def test_send_email_failure(self, email_service):
        """Test email sending failure"""
        with patch('app.auth.email_service.aiosmtplib.send', new_callable=AsyncMock) as mock_send:
            mock_send.side_effect = Exception("SMTP connection failed")

            result = await email_service.send_email(
                to_email="user@test.com",
                subject="Test Subject",
                html_content="<p>Test HTML</p>"
            )

            assert result is False

    @pytest.mark.asyncio
    async def test_send_verification_code_success(self, email_service):
        """Test sending verification code successfully"""
        with patch.object(email_service, 'send_email', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = True

            result = await email_service.send_verification_code(
                to_email="user@test.com",
                code="123456",
                user_name="Test User"
            )

            assert result is True
            assert mock_send.called
            # Verify the call arguments
            call_args = mock_send.call_args
            assert call_args[0][0] == "user@test.com"
            assert call_args[0][1] == "Verify your email address"
            assert "123456" in call_args[0][2]  # HTML content
            assert "Test User" in call_args[0][2]
            assert "123456" in call_args[0][3]  # Text content

    @pytest.mark.asyncio
    async def test_send_verification_code_without_username(self, email_service):
        """Test sending verification code without username"""
        with patch.object(email_service, 'send_email', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = True

            result = await email_service.send_verification_code(
                to_email="user@test.com",
                code="123456"
            )

            assert result is True
            assert mock_send.called

    @pytest.mark.asyncio
    async def test_send_password_reset_success(self, email_service):
        """Test sending password reset email successfully"""
        with patch.object(email_service, 'send_email', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = True

            reset_link = "https://echo.com/reset?token=abc123"
            result = await email_service.send_password_reset(
                to_email="user@test.com",
                reset_link=reset_link,
                user_name="Test User"
            )

            assert result is True
            assert mock_send.called
            # Verify the call arguments
            call_args = mock_send.call_args
            assert call_args[0][0] == "user@test.com"
            assert call_args[0][1] == "Reset your password"
            assert reset_link in call_args[0][2]  # HTML content
            assert "Test User" in call_args[0][2]
            assert reset_link in call_args[0][3]  # Text content

    @pytest.mark.asyncio
    async def test_send_password_reset_without_username(self, email_service):
        """Test sending password reset email without username"""
        with patch.object(email_service, 'send_email', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = True

            reset_link = "https://echo.com/reset?token=abc123"
            result = await email_service.send_password_reset(
                to_email="user@test.com",
                reset_link=reset_link
            )

            assert result is True
            assert mock_send.called

    @pytest.mark.asyncio
    async def test_send_password_changed_notification_success(self, email_service):
        """Test sending password changed notification successfully"""
        with patch.object(email_service, 'send_email', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = True

            result = await email_service.send_password_changed_notification(
                to_email="user@test.com",
                user_name="Test User"
            )

            assert result is True
            assert mock_send.called
            # Verify the call arguments
            call_args = mock_send.call_args
            assert call_args[0][0] == "user@test.com"
            assert call_args[0][1] == "Your password was changed"
            assert "Test User" in call_args[0][2]  # HTML content
            assert "Test User" in call_args[0][3]  # Text content

    @pytest.mark.asyncio
    async def test_send_password_changed_notification_without_username(self, email_service):
        """Test sending password changed notification without username"""
        with patch.object(email_service, 'send_email', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = True

            result = await email_service.send_password_changed_notification(
                to_email="user@test.com"
            )

            assert result is True
            assert mock_send.called

    @pytest.mark.asyncio
    async def test_send_welcome_email_success(self, email_service):
        """Test sending welcome email successfully"""
        with patch.object(email_service, 'send_email', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = True

            result = await email_service.send_welcome_email(
                to_email="user@test.com",
                user_name="Test User"
            )

            assert result is True
            assert mock_send.called
            # Verify the call arguments
            call_args = mock_send.call_args
            assert call_args[0][0] == "user@test.com"
            assert call_args[0][1] == "Welcome to Echo!"
            assert "Test User" in call_args[0][2]  # HTML content
            assert "Test User" in call_args[0][3]  # Text content

    @pytest.mark.asyncio
    async def test_send_welcome_email_without_username(self, email_service):
        """Test sending welcome email without username"""
        with patch.object(email_service, 'send_email', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = True

            result = await email_service.send_welcome_email(
                to_email="user@test.com"
            )

            assert result is True
            assert mock_send.called


class TestGlobalEmailService:
    """Tests for global email service functions"""

    def test_init_email_service(self):
        """Test initializing global email service"""
        service = init_email_service(
            smtp_host="smtp.test.com",
            smtp_port=587,
            smtp_user="test@test.com",
            smtp_password="testpassword",
            from_email="noreply@echo.com",
            from_name="Echo",
            use_tls=True
        )

        assert service is not None
        assert service.smtp_host == "smtp.test.com"
        assert service.smtp_port == 587
        assert service.from_email == "noreply@echo.com"

    def test_get_email_service_success(self):
        """Test getting global email service when initialized"""
        # Initialize first
        init_email_service(
            smtp_host="smtp.test.com",
            smtp_port=587,
            smtp_user="test@test.com",
            smtp_password="testpassword",
            from_email="noreply@echo.com"
        )

        service = get_email_service()
        assert service is not None
        assert service.smtp_host == "smtp.test.com"

    def test_get_email_service_not_initialized(self):
        """Test getting email service when not initialized"""
        # Reset global email_service to None
        import app.auth.email_service as email_module
        email_module.email_service = None

        with pytest.raises(RuntimeError, match="Email service not initialized"):
            get_email_service()


class TestEmailContentGeneration:
    """Tests for email content generation"""

    @pytest.mark.asyncio
    async def test_verification_code_email_contains_code(self, email_service):
        """Test that verification code email contains the code"""
        with patch.object(email_service, 'send_email', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = True

            code = "987654"
            await email_service.send_verification_code(
                to_email="user@test.com",
                code=code
            )

            # Check that code appears in both HTML and text
            html_content = mock_send.call_args[0][2]
            text_content = mock_send.call_args[0][3]

            assert code in html_content
            assert code in text_content
            assert "10 minutes" in html_content  # Expiry time
            assert "10 minutes" in text_content

    @pytest.mark.asyncio
    async def test_password_reset_email_contains_link(self, email_service):
        """Test that password reset email contains the reset link"""
        with patch.object(email_service, 'send_email', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = True

            reset_link = "https://echo.com/reset?token=xyz789"
            await email_service.send_password_reset(
                to_email="user@test.com",
                reset_link=reset_link
            )

            # Check that link appears in both HTML and text
            html_content = mock_send.call_args[0][2]
            text_content = mock_send.call_args[0][3]

            assert reset_link in html_content
            assert reset_link in text_content
            assert "1 hour" in html_content  # Expiry time
            assert "1 hour" in text_content

    @pytest.mark.asyncio
    async def test_welcome_email_contains_frontend_url(self, email_service):
        """Test that welcome email contains frontend URL"""
        with patch.object(email_service, 'send_email', new_callable=AsyncMock) as mock_send:
            with patch.dict('os.environ', {'FRONTEND_URL': 'https://echo.com'}):
                mock_send.return_value = True

                await email_service.send_welcome_email(
                    to_email="user@test.com",
                    user_name="Test User"
                )

                html_content = mock_send.call_args[0][2]
                assert "https://echo.com" in html_content or "localhost" in html_content
