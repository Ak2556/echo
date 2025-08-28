"""
Security utilities: password hashing, OTP, TOTP, breach checking, rate limiting.
"""
import hashlib
import secrets
import string
from datetime import datetime, timedelta
from typing import Optional, Tuple
import pyotp
import qrcode
import io
import base64
import os
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import httpx
import structlog

logger = structlog.get_logger(__name__)

# Argon2id password hasher with secure defaults
password_hasher = PasswordHasher(
    time_cost=2,
    memory_cost=65536,
    parallelism=2,
    hash_len=32,
    salt_len=16,
)


def hash_password(password: str) -> str:
    """Hash a password using Argon2id."""
    return password_hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    """Verify a password against its hash."""
    try:
        password_hasher.verify(password_hash, password)
        return True
    except VerifyMismatchError:
        return False


def needs_rehash(password_hash: str) -> bool:
    """Check if password hash needs updating to current parameters."""
    return password_hasher.check_needs_rehash(password_hash)


def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP code."""
    return ''.join(secrets.choice(string.digits) for _ in range(length))


def generate_secure_token(length: int = 32) -> str:
    """Generate a secure random token."""
    return secrets.token_urlsafe(length)


def hash_token(token: str) -> str:
    """Hash a token for secure storage."""
    return hashlib.sha256(token.encode()).hexdigest()


def get_encryption_key() -> bytes:
    """
    Get or generate encryption key for TOTP secrets.
    In production, this should be stored in a secure location (e.g., KMS, env variable).
    """
    secret_key = os.getenv("TOTP_ENCRYPTION_KEY")
    if not secret_key:
        # For development only - in production, this MUST be set in environment
        secret_key = os.getenv("SECRET_KEY", "default-dev-key-change-in-production")

    # Derive a consistent encryption key from the secret
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b'echo-totp-encryption-salt',  # In production, use a random salt stored securely
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(secret_key.encode()))
    return key


def encrypt_totp_secret(secret: str) -> str:
    """
    Encrypt TOTP secret before storing in database.
    Returns base64 encoded encrypted secret.
    """
    try:
        key = get_encryption_key()
        f = Fernet(key)
        encrypted = f.encrypt(secret.encode())
        return base64.b64encode(encrypted).decode()
    except Exception as e:
        logger.error("Failed to encrypt TOTP secret", error=str(e))
        raise


def decrypt_totp_secret(encrypted_secret: str) -> str:
    """
    Decrypt TOTP secret retrieved from database.
    Takes base64 encoded encrypted secret.
    """
    try:
        key = get_encryption_key()
        f = Fernet(key)
        encrypted_bytes = base64.b64decode(encrypted_secret.encode())
        decrypted = f.decrypt(encrypted_bytes)
        return decrypted.decode()
    except Exception as e:
        logger.error("Failed to decrypt TOTP secret", error=str(e))
        raise


def generate_totp_secret() -> str:
    """Generate a TOTP secret key."""
    return pyotp.random_base32()


def get_totp_provisioning_uri(secret: str, email: str, issuer: str = "Echo") -> str:
    """Get TOTP provisioning URI for QR code."""
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name=issuer)


def generate_qr_code(data: str) -> str:
    """Generate a QR code and return as base64 PNG."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()

    return f"data:image/png;base64,{img_str}"


def verify_totp(secret: str, code: str, window: int = 1) -> bool:
    """Verify a TOTP code with time window for clock skew."""
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=window)


def generate_backup_codes(count: int = 10, length: int = 8) -> list[str]:
    """Generate backup codes for 2FA recovery."""
    codes = []
    for _ in range(count):
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(length))
        # Format as XXXX-XXXX
        formatted = f"{code[:4]}-{code[4:]}"
        codes.append(formatted)
    return codes


def verify_backup_code(stored_codes: list[str], provided_code: str) -> Tuple[bool, list[str]]:
    """Verify and consume a backup code."""
    provided_code = provided_code.upper().replace(' ', '').replace('-', '')

    for i, stored in enumerate(stored_codes):
        stored_clean = stored.upper().replace(' ', '').replace('-', '')
        if secrets.compare_digest(stored_clean, provided_code):
            # Remove used code
            remaining_codes = stored_codes[:i] + stored_codes[i+1:]
            return True, remaining_codes

    return False, stored_codes


async def check_password_breach(password: str) -> Tuple[bool, int]:
    """
    Check if password appears in Have I Been Pwned database.
    Returns (is_breached, count_in_database).
    """
    # Hash password with SHA-1
    sha1_hash = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    prefix = sha1_hash[:5]
    suffix = sha1_hash[5:]

    try:
        # Query HIBP API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.pwnedpasswords.com/range/{prefix}",
                timeout=5.0
            )

        if response.status_code == 200:
            # Parse response
            hashes = response.text.splitlines()
            for hash_line in hashes:
                hash_suffix, count = hash_line.split(':')
                if hash_suffix == suffix:
                    return True, int(count)
            return False, 0
        else:
            logger.warning("HIBP API returned non-200", status=response.status_code)
            return False, 0

    except Exception as e:
        logger.error("Failed to check password breach", error=str(e))
        # Fail open - don't block registration if API is down
        return False, 0


def calculate_password_strength(password: str) -> dict:
    """
    Calculate password strength score and provide feedback.
    Returns score (0-100) and list of suggestions.
    """
    score = 0
    suggestions = []

    # Length check
    length = len(password)
    if length >= 12:
        score += 30
    elif length >= 8:
        score += 20
        suggestions.append("Use at least 12 characters for better security")
    else:
        score += 10
        suggestions.append("Password is too short (minimum 8 characters)")

    # Character variety
    has_lower = any(c.islower() for c in password)
    has_upper = any(c.isupper() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in string.punctuation for c in password)

    variety_score = sum([has_lower, has_upper, has_digit, has_special])
    score += variety_score * 15

    if not has_lower:
        suggestions.append("Add lowercase letters")
    if not has_upper:
        suggestions.append("Add uppercase letters")
    if not has_digit:
        suggestions.append("Add numbers")
    if not has_special:
        suggestions.append("Add special characters (!@#$%^&*)")

    # Penalize common patterns
    common_patterns = ['123', 'abc', 'password', 'qwerty', '111', '000']
    if any(pattern in password.lower() for pattern in common_patterns):
        score -= 20
        suggestions.append("Avoid common patterns and sequences")

    # Bonus for length
    if length >= 16:
        score += 10

    # Cap score
    score = min(max(score, 0), 100)

    return {
        "score": score,
        "strength": _get_strength_label(score),
        "suggestions": suggestions,
    }


def _get_strength_label(score: int) -> str:
    """Get strength label from score."""
    if score >= 80:
        return "strong"
    elif score >= 60:
        return "good"
    elif score >= 40:
        return "fair"
    else:
        return "weak"


def generate_device_fingerprint(user_agent: str, ip_address: str) -> str:
    """Generate a simple device fingerprint for session tracking."""
    data = f"{user_agent}:{ip_address[:10]}"  # Partial IP for privacy
    return hashlib.sha256(data.encode()).hexdigest()[:16]


def parse_user_agent(user_agent: str) -> dict:
    """Parse user agent string to extract device info."""
    ua_lower = user_agent.lower()

    # Simple device type detection
    if 'mobile' in ua_lower or 'android' in ua_lower or 'iphone' in ua_lower:
        device_type = 'mobile'
    elif 'tablet' in ua_lower or 'ipad' in ua_lower:
        device_type = 'tablet'
    else:
        device_type = 'desktop'

    # Extract device name
    device_name = "Unknown Device"
    if 'windows' in ua_lower:
        device_name = "Windows PC"
    elif 'mac' in ua_lower:
        device_name = "Mac"
    elif 'linux' in ua_lower:
        device_name = "Linux"
    elif 'android' in ua_lower:
        device_name = "Android Device"
    elif 'iphone' in ua_lower:
        device_name = "iPhone"
    elif 'ipad' in ua_lower:
        device_name = "iPad"

    return {
        "device_type": device_type,
        "device_name": device_name,
        "user_agent": user_agent,
    }
