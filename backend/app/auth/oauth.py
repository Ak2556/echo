"""
OAuth integration for Google and GitHub using Authlib.
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from authlib.integrations.starlette_client import OAuth
from datetime import datetime, timedelta, timezone
import structlog
import os
import uuid

from ..config.database import get_session
from .models import User, OAuthAccount, RefreshToken, Session
from .jwt_utils import get_jwt_manager
from .redis_service import get_redis_service
from .security import generate_device_fingerprint, parse_user_agent
from .routes import log_audit_event, create_session_record

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/api/auth/oauth", tags=["oauth"])

# Initialize OAuth client
oauth = OAuth()

# Register OAuth providers
oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile',
        'prompt': 'select_account',
    }
)

oauth.register(
    name='github',
    client_id=os.getenv('GITHUB_CLIENT_ID'),
    client_secret=os.getenv('GITHUB_CLIENT_SECRET'),
    authorize_url='https://github.com/login/oauth/authorize',
    authorize_params=None,
    access_token_url='https://github.com/login/oauth/access_token',
    access_token_params=None,
    refresh_token_url=None,
    client_kwargs={'scope': 'user:email'},
)


@router.get('/{provider}/start')
async def oauth_start(provider: str, request: Request):
    """
    Initiate OAuth flow.

    Supported providers: google, github
    """
    if provider not in ['google', 'github']:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    try:
        client = oauth.create_client(provider)

        # Callback URL
        redirect_uri = f"{os.getenv('API_URL', 'http://localhost:8000')}/api/auth/oauth/{provider}/callback"

        # Store state in session for CSRF protection
        return await client.authorize_redirect(request, redirect_uri)

    except Exception as e:
        logger.error("OAuth start failed", provider=provider, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to initiate OAuth flow")


@router.get('/{provider}/callback')
async def oauth_callback(
    provider: str,
    request: Request,
    db: AsyncSession = Depends(get_session)
):
    """
    Handle OAuth callback and link or create user.

    Flow:
    1. Exchange code for access token
    2. Get user info from provider
    3. Check if OAuth account exists
    4. If exists: login
    5. If not: check if email exists
       - If yes: link accounts (require confirmation?)
       - If no: create new user
    6. Generate JWT tokens
    7. Redirect to frontend with tokens
    """
    redis = get_redis_service()
    jwt_manager = get_jwt_manager()

    try:
        # Exchange authorization code for token
        client = oauth.create_client(provider)
        token = await client.authorize_access_token(request)

        # Get user info
        if provider == 'google':
            user_info = token.get('userinfo')
            provider_user_id = user_info['sub']
            email = user_info['email']
            name = user_info.get('name')
            avatar = user_info.get('picture')
            profile_data = {
                'name': name,
                'email': email,
                'picture': avatar,
                'email_verified': user_info.get('email_verified'),
            }

        elif provider == 'github':
            # GitHub requires separate API call for user info
            resp = await client.get('https://api.github.com/user', token=token)
            user_info = resp.json()

            provider_user_id = str(user_info['id'])
            email = user_info.get('email')

            # If email is null, fetch from /user/emails
            if not email:
                emails_resp = await client.get('https://api.github.com/user/emails', token=token)
                emails = emails_resp.json()
                # Get primary verified email
                for email_obj in emails:
                    if email_obj.get('primary') and email_obj.get('verified'):
                        email = email_obj['email']
                        break

            name = user_info.get('name') or user_info.get('login')
            avatar = user_info.get('avatar_url')
            profile_data = {
                'login': user_info.get('login'),
                'name': name,
                'avatar_url': avatar,
                'bio': user_info.get('bio'),
            }
        else:
            raise HTTPException(status_code=400, detail="Unsupported provider")

        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by OAuth provider")

        # Check if OAuth account already exists
        result = await db.execute(
            select(OAuthAccount)
            .where(OAuthAccount.provider == provider)
            .where(OAuthAccount.provider_user_id == provider_user_id)
        )
        oauth_account = result.scalar_one_or_none()

        if oauth_account:
            # Existing OAuth account - login
            user_id = oauth_account.user_id

            # Update OAuth tokens
            oauth_account.access_token = token.get('access_token')
            oauth_account.refresh_token = token.get('refresh_token')
            oauth_account.expires_at = datetime.now(timezone.utc) + timedelta(seconds=token.get('expires_in', 3600))
            oauth_account.profile_data = profile_data
            oauth_account.updated_at = datetime.now(timezone.utc)

        else:
            # Check if user exists by email
            user_result = await db.execute(select(User).where(User.email == email))
            user = user_result.scalar_one_or_none()

            if user:
                # User exists - link OAuth account
                user_id = user.id
            else:
                # Create new user
                user = User(
                    email=email,
                    email_verified=True,  # OAuth emails are verified
                    email_verified_at=datetime.now(timezone.utc),
                    full_name=name,
                    avatar_url=avatar,
                )
                db.add(user)
                await db.flush()
                user_id = user.id

            # Create OAuth account link
            oauth_account = OAuthAccount(
                user_id=user_id,
                provider=provider,
                provider_user_id=provider_user_id,
                provider_email=email,
                access_token=token.get('access_token'),
                refresh_token=token.get('refresh_token'),
                expires_at=datetime.now(timezone.utc) + timedelta(seconds=token.get('expires_in', 3600)),
                profile_data=profile_data,
            )
            db.add(oauth_account)

        await db.commit()

        # Get user
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one()

        # Generate JWT tokens
        family_id = str(uuid.uuid4())

        access_token = jwt_manager.create_access_token(
            user_id=user.id,
            email=user.email,
            token_version=user.token_version,
            auth_methods=['oauth', provider],
        )

        refresh_token, jti = jwt_manager.create_refresh_token(
            user_id=user.id,
            family_id=family_id,
            rotation_count=0,
        )

        # Store refresh token
        device_fp = generate_device_fingerprint(
            request.headers.get("user-agent", ""),
            request.client.host
        )

        refresh_record = RefreshToken(
            jti=jti,
            user_id=user.id,
            family_id=family_id,
            device_fingerprint=device_fp,
            user_agent=request.headers.get("user-agent"),
            ip_address=request.client.host,
            expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        )
        db.add(refresh_record)

        # Create session
        session = await create_session_record(
            db, user.id, jti, request,
            datetime.now(timezone.utc) + timedelta(days=30)
        )

        # Update user last login
        user.last_login_at = datetime.now(timezone.utc)
        await db.commit()

        # Log audit event
        await log_audit_event(
            db, user.id, user.email,
            "login", "success", request,
            auth_method=f"oauth_{provider}"
        )

        # Redirect to frontend with tokens
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f"{frontend_url}/auth/oauth-success?access_token={access_token}&refresh_token={refresh_token}"

        return RedirectResponse(url=redirect_url)

    except Exception as e:
        logger.error("OAuth callback failed", provider=provider, error=str(e), exc_info=True)

        # Redirect to frontend with error
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        error_url = f"{frontend_url}/auth/oauth-error?error={str(e)}"
        return RedirectResponse(url=error_url)


@router.post('/{provider}/link')
async def link_oauth_account(
    provider: str,
    request: Request,
    db: AsyncSession = Depends(get_session),
    # current_user: dict = Depends(get_current_user)  # TODO: Add when middleware is ready
):
    """
    Link an OAuth account to existing authenticated user.
    Similar to oauth_start but for linking instead of login.
    """
    # This would follow similar pattern to oauth_start
    # but would require current user to be authenticated
    # and would only link the account without creating new user
    raise HTTPException(status_code=501, detail="OAuth linking not yet implemented")


@router.delete('/{provider}/unlink')
async def unlink_oauth_account(
    provider: str,
    db: AsyncSession = Depends(get_session),
    # current_user: dict = Depends(get_current_user)
):
    """
    Unlink an OAuth account from user.
    """
    # TODO: Implement unlinking
    # - Check user has password or another OAuth method
    # - Delete OAuthAccount record
    # - Log audit event
    raise HTTPException(status_code=501, detail="OAuth unlinking not yet implemented")
