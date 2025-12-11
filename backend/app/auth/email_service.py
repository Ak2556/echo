"""
Email service for sending verification codes, password reset links, etc.
Supports SMTP and SendGrid.
"""

import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Dict, Optional

import aiosmtplib
import structlog

logger = structlog.get_logger(__name__)


class EmailService:
    """Email service for authentication flows."""

    def __init__(
        self,
        smtp_host: str,
        smtp_port: int,
        smtp_user: str,
        smtp_password: str,
        from_email: str,
        from_name: str = "Echo",
        use_tls: bool = True,
    ):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.smtp_user = smtp_user
        self.smtp_password = smtp_password
        self.from_email = from_email
        self.from_name = from_name
        self.use_tls = use_tls

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Send an email via SMTP."""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email
            message["Subject"] = subject

            # Add text version
            if text_content:
                part1 = MIMEText(text_content, "plain")
                message.attach(part1)

            # Add HTML version
            part2 = MIMEText(html_content, "html")
            message.attach(part2)

            # Send via SMTP
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                use_tls=self.use_tls,
            )

            logger.info("Email sent", to=to_email, subject=subject)
            return True

        except Exception as e:
            logger.error("Failed to send email", to=to_email, error=str(e))
            return False

    async def send_verification_code(
        self,
        to_email: str,
        code: str,
        user_name: Optional[str] = None,
    ) -> bool:
        """Send email verification code."""
        subject = "Verify your email address"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Echo</h1>
            </div>

            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>

                <p>Hi{' ' + user_name if user_name else ''},</p>

                <p>Welcome to Echo! Please verify your email address by entering this code:</p>

                <div style="background: #f7fafc; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
                        {code}
                    </div>
                </div>

                <p style="color: #718096; font-size: 14px;">This code will expire in 10 minutes.</p>

                <p>If you didn't create an account with Echo, you can safely ignore this email.</p>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

                <p style="color: #a0aec0; font-size: 12px; text-align: center;">
                    © 2024 Echo. All rights reserved.
                </p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Verify Your Email

        Hi{' ' + user_name if user_name else ''},

        Welcome to Echo! Please verify your email address by entering this code:

        {code}

        This code will expire in 10 minutes.

        If you didn't create an account with Echo, you can safely ignore this email.
        """

        return await self.send_email(to_email, subject, html_content, text_content)

    async def send_password_reset(
        self,
        to_email: str,
        reset_link: str,
        user_name: Optional[str] = None,
    ) -> bool:
        """Send password reset email."""
        subject = "Reset your password"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Echo</h1>
            </div>

            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>

                <p>Hi{' ' + user_name if user_name else ''},</p>

                <p>We received a request to reset your password. Click the button below to create a new password:</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Reset Password
                    </a>
                </div>

                <p style="color: #718096; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <p style="background: #f7fafc; padding: 10px; border-radius: 4px; font-size: 12px; word-break: break-all; color: #4a5568;">
                    {reset_link}
                </p>

                <p style="color: #e53e3e; font-weight: bold; margin-top: 30px;">⚠️ This link will expire in 1 hour.</p>

                <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

                <p style="color: #a0aec0; font-size: 12px; text-align: center;">
                    © 2024 Echo. All rights reserved.
                </p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Reset Your Password

        Hi{' ' + user_name if user_name else ''},

        We received a request to reset your password. Click the link below to create a new password:

        {reset_link}

        This link will expire in 1 hour.

        If you didn't request a password reset, please ignore this email.
        """

        return await self.send_email(to_email, subject, html_content, text_content)

    async def send_password_changed_notification(
        self,
        to_email: str,
        user_name: Optional[str] = None,
    ) -> bool:
        """Send notification that password was changed."""
        subject = "Your password was changed"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">✓ Password Changed</h1>
            </div>

            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p>Hi{' ' + user_name if user_name else ''},</p>

                <p>Your Echo account password was successfully changed.</p>

                <p style="background: #f0fff4; border-left: 4px solid #48bb78; padding: 15px; margin: 20px 0;">
                    <strong>If you made this change,</strong> no action is needed.
                </p>

                <p style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0;">
                    <strong>If you didn't make this change,</strong> please contact our support team immediately.
                </p>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

                <p style="color: #a0aec0; font-size: 12px; text-align: center;">
                    © 2024 Echo. All rights reserved.
                </p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Password Changed

        Hi{' ' + user_name if user_name else ''},

        Your Echo account password was successfully changed.

        If you made this change, no action is needed.

        If you didn't make this change, please contact our support team immediately.
        """

        return await self.send_email(to_email, subject, html_content, text_content)

    async def send_welcome_email(
        self,
        to_email: str,
        user_name: Optional[str] = None,
    ) -> bool:
        """Send welcome email after successful registration."""
        subject = "Welcome to Echo!"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Echo!</h1>
            </div>

            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 18px;">Hi {user_name or 'there'},</p>

                <p>Welcome to Echo! We're excited to have you as part of our community.</p>

                <p>Here are some things you can do to get started:</p>

                <ul style="line-height: 2;">
                    <li>📝 Complete your profile</li>
                    <li>🔒 Enable two-factor authentication for extra security</li>
                    <li>👥 Connect with friends and discover new content</li>
                    <li>🎨 Customize your experience</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Get Started
                    </a>
                </div>

                <p>If you have any questions, feel free to reach out to our support team.</p>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

                <p style="color: #a0aec0; font-size: 12px; text-align: center;">
                    © 2024 Echo. All rights reserved.
                </p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Welcome to Echo!

        Hi {user_name or 'there'},

        Welcome to Echo! We're excited to have you as part of our community.

        Here are some things you can do to get started:
        - Complete your profile
        - Enable two-factor authentication for extra security
        - Connect with friends and discover new content
        - Customize your experience

        If you have any questions, feel free to reach out to our support team.
        """

        return await self.send_email(to_email, subject, html_content, text_content)


# Global instance
email_service: Optional[EmailService] = None


def init_email_service(
    smtp_host: str,
    smtp_port: int,
    smtp_user: str,
    smtp_password: str,
    from_email: str,
    from_name: str = "Echo",
    use_tls: bool = True,
) -> EmailService:
    """Initialize the global email service."""
    global email_service
    email_service = EmailService(
        smtp_host=smtp_host,
        smtp_port=smtp_port,
        smtp_user=smtp_user,
        smtp_password=smtp_password,
        from_email=from_email,
        from_name=from_name,
        use_tls=use_tls,
    )
    logger.info("Email service initialized", from_email=from_email)
    return email_service


def get_email_service() -> EmailService:
    """Get the global email service instance."""
    if email_service is None:
        raise RuntimeError("Email service not initialized")
    return email_service
