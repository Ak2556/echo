"""
Production-grade email service with async support and templates.
"""
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from pathlib import Path
import structlog
from jinja2 import Template

from app.config.settings import settings

logger = structlog.get_logger(__name__)


class EmailService:
    """Production-ready email service with template support."""

    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_username = settings.smtp_username
        self.smtp_password = settings.smtp_password
        self.smtp_tls = settings.smtp_tls
        self.smtp_ssl = settings.smtp_ssl
        self.email_from = settings.email_from
        self.email_from_name = settings.email_from_name
        self.enabled = settings.email_enabled
        self.template_dir = Path(settings.email_template_dir)

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """
        Send an email with HTML and optional text content.

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content
            text_content: Plain text content (optional)

        Returns:
            bool: True if sent successfully, False otherwise
        """
        if not self.enabled:
            logger.warning("Email service is disabled", to=to_email, subject=subject)
            return False

        if not self.smtp_username or not self.smtp_password:
            logger.error("Email credentials not configured")
            return False

        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.email_from_name} <{self.email_from}>"
            message["To"] = to_email

            # Add text and HTML parts
            if text_content:
                part1 = MIMEText(text_content, "plain")
                message.attach(part1)

            part2 = MIMEText(html_content, "html")
            message.attach(part2)

            # Send email
            context = ssl.create_default_context()

            if self.smtp_ssl:
                with smtplib.SMTP_SSL(
                    self.smtp_host, self.smtp_port, context=context
                ) as server:
                    server.login(self.smtp_username, self.smtp_password)
                    server.sendmail(self.email_from, to_email, message.as_string())
            else:
                with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                    if self.smtp_tls:
                        server.starttls(context=context)
                    server.login(self.smtp_username, self.smtp_password)
                    server.sendmail(self.email_from, to_email, message.as_string())

            logger.info("Email sent successfully", to=to_email, subject=subject)
            return True

        except Exception as e:
            logger.error(
                "Failed to send email",
                to=to_email,
                subject=subject,
                error=str(e),
                exc_info=True,
            )
            return False

    async def send_verification_email(self, email: str, token: str) -> bool:
        """Send email verification email."""
        verification_url = f"{settings.cors_origins[0]}/auth/verify-email?token={token}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #3b82f6; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background: #f9fafb; }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    background: #3b82f6;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    margin: 20px 0;
                }}
                .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Echo!</h1>
                </div>
                <div class="content">
                    <p>Thank you for registering with Echo. Please verify your email address to activate your account.</p>
                    <p style="text-align: center;">
                        <a href="{verification_url}" class="button">Verify Email Address</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd;">
                        {verification_url}
                    </p>
                    <p>This link will expire in 24 hours.</p>
                </div>
                <div class="footer">
                    <p>If you didn't create an account with Echo, please ignore this email.</p>
                    <p>&copy; 2025 Echo Platform. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Welcome to Echo!

        Thank you for registering. Please verify your email address by clicking the link below:

        {verification_url}

        This link will expire in 24 hours.

        If you didn't create an account with Echo, please ignore this email.
        """

        return await self.send_email(
            to_email=email,
            subject="Verify your Echo account",
            html_content=html_content,
            text_content=text_content,
        )

    async def send_otp_email(self, email: str, otp: str) -> bool:
        """Send OTP verification email."""
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #3b82f6; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background: #f9fafb; }}
                .otp-code {{
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #3b82f6;
                    background: white;
                    padding: 20px;
                    text-align: center;
                    border: 2px dashed #3b82f6;
                    margin: 20px 0;
                }}
                .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Echo Verification Code</h1>
                </div>
                <div class="content">
                    <p>Your verification code is:</p>
                    <div class="otp-code">{otp}</div>
                    <p>This code will expire in 10 minutes.</p>
                    <p><strong>Important:</strong> Never share this code with anyone. Echo staff will never ask for your verification code.</p>
                </div>
                <div class="footer">
                    <p>If you didn't request this code, please ignore this email or contact support if you're concerned.</p>
                    <p>&copy; 2025 Echo Platform. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Echo Verification Code

        Your verification code is: {otp}

        This code will expire in 10 minutes.

        Important: Never share this code with anyone. Echo staff will never ask for your verification code.

        If you didn't request this code, please ignore this email.
        """

        return await self.send_email(
            to_email=email,
            subject="Your Echo verification code",
            html_content=html_content,
            text_content=text_content,
        )

    async def send_password_reset_email(self, email: str, reset_token: str) -> bool:
        """Send password reset email."""
        reset_url = f"{settings.cors_origins[0]}/auth/reset-password?token={reset_token}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #ef4444; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background: #f9fafb; }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    background: #ef4444;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    margin: 20px 0;
                }}
                .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Reset Your Password</h1>
                </div>
                <div class="content">
                    <p>We received a request to reset your Echo account password.</p>
                    <p style="text-align: center;">
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd;">
                        {reset_url}
                    </p>
                    <p>This link will expire in 1 hour.</p>
                    <p><strong>Important:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 Echo Platform. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Reset Your Password

        We received a request to reset your Echo account password.

        Click the link below to reset your password:

        {reset_url}

        This link will expire in 1 hour.

        If you didn't request a password reset, please ignore this email and ensure your account is secure.
        """

        return await self.send_email(
            to_email=email,
            subject="Reset your Echo password",
            html_content=html_content,
            text_content=text_content,
        )

    async def send_2fa_enabled_notification(self, email: str) -> bool:
        """Send notification that 2FA has been enabled."""
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #10b981; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background: #f9fafb; }}
                .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>2FA Enabled</h1>
                </div>
                <div class="content">
                    <p>Two-factor authentication (2FA) has been successfully enabled on your Echo account.</p>
                    <p>Your account is now more secure! You'll need to enter a verification code from your authenticator app each time you sign in.</p>
                    <p>If you didn't enable 2FA, please contact our support team immediately.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 Echo Platform. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = """
        2FA Enabled

        Two-factor authentication (2FA) has been successfully enabled on your Echo account.

        Your account is now more secure! You'll need to enter a verification code from your authenticator app each time you sign in.

        If you didn't enable 2FA, please contact our support team immediately.
        """

        return await self.send_email(
            to_email=email,
            subject="Two-factor authentication enabled",
            html_content=html_content,
            text_content=text_content,
        )


# Global email service instance
email_service = EmailService()
