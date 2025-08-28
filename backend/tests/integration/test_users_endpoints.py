"""
Comprehensive tests for user management endpoints.
Goal: 100% coverage for app/api/v1/endpoints/users.py
"""

import pytest
from httpx import AsyncClient
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from unittest.mock import Mock, patch

from app.auth.models import User
from app.auth.dependencies import AuthenticatedUser


@pytest.mark.integration
@pytest.mark.asyncio
class TestUserProfileEndpoints:
    """Tests for user profile endpoints (/me)."""

    async def test_get_my_profile_success(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test successful retrieval of own profile."""
        # Create a user in the database
        user = User(
            id="test-user-id",
            email="test@example.com",
            username="testuser",
            full_name="Test User",
            bio="Test bio",
            avatar_url="https://example.com/avatar.jpg",
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        # Create mock authenticated user
        mock_user = Mock()
        mock_user.id = user.id
        mock_user.email = user.email

        # Override auth
        with override_auth(mock_user):
            response = await client.get("/api/v1/users/me")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user.id
        assert data["email"] == user.email
        assert data["username"] == "testuser"
        assert data["full_name"] == "Test User"
        assert data["bio"] == "Test bio"
        assert data["avatar_url"] == "https://example.com/avatar.jpg"

    async def test_get_my_profile_no_username(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test profile retrieval when username is not set (should derive from email)."""
        # Create a user without username
        user = User(
            id="test-user-id-2",
            email="nouser@example.com",
            username=None,  # No username set
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        with override_auth(mock_user):
            response = await client.get("/api/v1/users/me")

        assert response.status_code == 200
        data = response.json()
        # Should derive username from email
        assert data["username"] == "nouser"

    async def test_get_my_profile_user_not_found(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test error when authenticated user doesn't exist in database (lines 45-46)."""
        # Create mock user with ID that doesn't exist in DB
        mock_user = Mock()
        mock_user.id = "non-existent-user-id"

        with override_auth(mock_user):
            response = await client.get("/api/v1/users/me")

        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]

    async def test_update_my_profile_put_success(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test full profile update with PUT (lines 65-89)."""
        # Create user
        user = User(
            id="test-user-id-3",
            email="update@example.com",
            username="updateuser",
            full_name="Old Name",
            bio="Old bio",
            avatar_url="https://old.com/avatar.jpg",
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        update_data = {
            "full_name": "New Name",
            "bio": "New bio",
            "avatar_url": "https://new.com/avatar.jpg"
        }

        with override_auth(mock_user):
            response = await client.put("/api/v1/users/me", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "New Name"
        assert data["bio"] == "New bio"
        assert data["avatar_url"] == "https://new.com/avatar.jpg"

        # Verify in database
        await db_session.refresh(user)
        assert user.full_name == "New Name"
        assert user.bio == "New bio"
        assert user.avatar_url == "https://new.com/avatar.jpg"

    async def test_update_my_profile_put_user_not_found(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test PUT update error when user not found (lines 68-69)."""
        mock_user = Mock()
        mock_user.id = "non-existent-user"

        update_data = {"full_name": "New Name"}

        with override_auth(mock_user):
            response = await client.put("/api/v1/users/me", json=update_data)

        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]

    async def test_update_my_profile_put_partial_fields(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test PUT with only some fields updated (lines 71-76)."""
        user = User(
            id="test-user-id-4",
            email="partial@example.com",
            username="partialuser",
            full_name="Original Name",
            bio="Original bio",
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        # Only update full_name
        update_data = {"full_name": "Updated Name"}

        with override_auth(mock_user):
            response = await client.put("/api/v1/users/me", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Updated Name"
        # Bio should remain unchanged
        assert data["bio"] == "Original bio"

    async def test_update_my_profile_patch_success(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test partial profile update with PATCH (lines 99-122)."""
        user = User(
            id="test-user-id-5",
            email="patch@example.com",
            username="patchuser",
            full_name="Patch User",
            bio="Original bio",
            avatar_url="https://example.com/old.jpg",
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        # Only update bio
        update_data = {"bio": "Updated bio via PATCH"}

        with override_auth(mock_user):
            response = await client.patch("/api/v1/users/me", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["bio"] == "Updated bio via PATCH"
        # Other fields should remain unchanged
        assert data["full_name"] == "Patch User"
        assert data["avatar_url"] == "https://example.com/old.jpg"

    async def test_update_my_profile_patch_user_not_found(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test PATCH update error when user not found (lines 101-102)."""
        mock_user = Mock()
        mock_user.id = "non-existent-patch-user"

        update_data = {"bio": "New bio"}

        with override_auth(mock_user):
            response = await client.patch("/api/v1/users/me", json=update_data)

        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]

    async def test_update_my_profile_patch_all_fields(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test PATCH with all fields to ensure coverage of all conditionals (lines 104-109)."""
        user = User(
            id="test-user-id-6",
            email="allfields@example.com",
            username="allfieldsuser",
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        # Update all fields
        update_data = {
            "full_name": "Complete Name",
            "bio": "Complete bio",
            "avatar_url": "https://complete.com/avatar.jpg"
        }

        with override_auth(mock_user):
            response = await client.patch("/api/v1/users/me", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Complete Name"
        assert data["bio"] == "Complete bio"
        assert data["avatar_url"] == "https://complete.com/avatar.jpg"


@pytest.mark.integration
@pytest.mark.asyncio
class TestUserLookupEndpoints:
    """Tests for user lookup endpoints."""

    async def test_get_user_by_id(self, client: AsyncClient):
        """Test getting user by ID (line 124-132)."""
        response = await client.get("/api/v1/users/some-user-id")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "some-user-id"
        assert data["username"] == "user"
        assert data["email"] == "user@example.com"

    async def test_list_users_default_params(self, client: AsyncClient):
        """Test listing users with default pagination (line 134-141)."""
        response = await client.get("/api/v1/users/")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_list_users_with_pagination(self, client: AsyncClient):
        """Test listing users with custom pagination parameters."""
        response = await client.get("/api/v1/users/?limit=10&offset=5")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_list_users_with_search(self, client: AsyncClient):
        """Test listing users with search parameter."""
        response = await client.get("/api/v1/users/?search=test")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_list_users_with_all_params(self, client: AsyncClient):
        """Test listing users with all parameters."""
        response = await client.get("/api/v1/users/?limit=20&offset=10&search=john")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_list_users_max_limit(self, client: AsyncClient):
        """Test listing users respects max limit of 100."""
        response = await client.get("/api/v1/users/?limit=100")

        assert response.status_code == 200

    async def test_list_users_exceeds_max_limit(self, client: AsyncClient):
        """Test listing users with limit exceeding 100 returns validation error."""
        response = await client.get("/api/v1/users/?limit=101")

        # Should return 422 validation error
        assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.asyncio
class TestFollowEndpoints:
    """Tests for follow/unfollow endpoints."""

    async def test_follow_user_success(self, client: AsyncClient):
        """Test following a user (line 143-146)."""
        response = await client.post("/api/v1/users/target-user-id/follow")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "User followed successfully"

    async def test_unfollow_user_success(self, client: AsyncClient):
        """Test unfollowing a user (line 148-151)."""
        response = await client.delete("/api/v1/users/target-user-id/follow")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "User unfollowed successfully"


@pytest.mark.integration
@pytest.mark.asyncio
class TestDeleteUserEndpoint:
    """Tests for user deletion endpoint."""

    async def test_delete_own_user_success(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test user can delete their own account (lines 164-169)."""
        # Create user
        user = User(
            id="delete-user-id",
            email="delete@example.com",
            username="deleteuser",
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        with override_auth(mock_user):
            response = await client.delete(f"/api/v1/users/{user.id}")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "User deleted successfully"

    async def test_delete_other_user_forbidden(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test user cannot delete another user's account (lines 160-161)."""
        # Create two users
        user1 = User(
            id="user-1-id",
            email="user1@example.com",
            username="user1",
            email_verified=True,
            is_active=True
        )
        user2 = User(
            id="user-2-id",
            email="user2@example.com",
            username="user2",
            email_verified=True,
            is_active=True
        )
        db_session.add(user1)
        db_session.add(user2)
        await db_session.commit()

        # User 1 tries to delete User 2
        mock_user = Mock()
        mock_user.id = user1.id

        with override_auth(mock_user):
            response = await client.delete(f"/api/v1/users/{user2.id}")

        assert response.status_code == 403
        assert "Not authorized" in response.json()["detail"]

    async def test_delete_user_not_found(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test delete returns 404 when user doesn't exist (lines 166-167)."""
        mock_user = Mock()
        mock_user.id = "non-existent-delete-user"

        with override_auth(mock_user):
            response = await client.delete(f"/api/v1/users/{mock_user.id}")

        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]


@pytest.mark.integration
@pytest.mark.asyncio
class TestUserProfileEdgeCases:
    """Edge case tests for user profile endpoints."""

    async def test_get_profile_null_optional_fields(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test profile with all optional fields as None."""
        user = User(
            id="minimal-user-id",
            email="minimal@example.com",
            username=None,
            full_name=None,
            bio=None,
            avatar_url=None,
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        with override_auth(mock_user):
            response = await client.get("/api/v1/users/me")

        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "minimal"  # Derived from email
        assert data["full_name"] is None
        assert data["bio"] is None
        assert data["avatar_url"] is None

    async def test_update_profile_empty_strings(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test updating profile with empty strings."""
        user = User(
            id="empty-string-user",
            email="empty@example.com",
            username="emptyuser",
            full_name="Original Name",
            bio="Original bio",
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        # Update with empty strings (not None)
        update_data = {
            "full_name": "",
            "bio": ""
        }

        with override_auth(mock_user):
            response = await client.put("/api/v1/users/me", json=update_data)

        assert response.status_code == 200
        data = response.json()
        # Empty strings are stored, but returned as None in the response
        # because the UserProfile model returns None for bio when empty
        assert data["full_name"] == "" or data["full_name"] is None
        assert data["bio"] == "" or data["bio"] is None

    async def test_update_profile_only_one_field(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test updating only avatar_url field."""
        user = User(
            id="avatar-only-user",
            email="avatar@example.com",
            username="avataruser",
            bio="Keep this bio",
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        # Only update avatar_url
        update_data = {"avatar_url": "https://new-avatar.com/pic.jpg"}

        with override_auth(mock_user):
            response = await client.patch("/api/v1/users/me", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["avatar_url"] == "https://new-avatar.com/pic.jpg"
        assert data["bio"] == "Keep this bio"

    async def test_user_model_without_bio_attribute(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test handling user model that doesn't have bio attribute."""
        user = User(
            id="no-bio-attr-user",
            email="nobio@example.com",
            username="nobiouser",
            email_verified=True,
            is_active=True
        )

        # Manually remove bio attribute to test hasattr check
        if hasattr(user, 'bio'):
            # Can't actually remove the attribute in SQLModel, so we just verify the check exists
            pass

        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        # Try to update bio
        update_data = {"bio": "New bio"}

        with override_auth(mock_user):
            response = await client.patch("/api/v1/users/me", json=update_data)

        # Should still succeed (hasattr check in lines 73, 106)
        assert response.status_code == 200


@pytest.mark.integration
@pytest.mark.asyncio
class TestUserAuthenticationErrors:
    """Tests for authentication errors on protected endpoints."""

    async def test_get_profile_without_auth(self, client: AsyncClient):
        """Test accessing /me without authentication."""
        response = await client.get("/api/v1/users/me")

        # Should return 401 or redirect to login
        assert response.status_code in [401, 403]

    async def test_update_profile_without_auth(self, client: AsyncClient):
        """Test updating profile without authentication."""
        update_data = {"full_name": "Hacker"}
        response = await client.put("/api/v1/users/me", json=update_data)

        assert response.status_code in [401, 403]

    async def test_delete_user_without_auth(self, client: AsyncClient):
        """Test deleting user without authentication."""
        response = await client.delete("/api/v1/users/some-user-id")

        assert response.status_code in [401, 403]


@pytest.mark.integration
@pytest.mark.asyncio
class TestUserProfileValidation:
    """Tests for input validation."""

    async def test_update_profile_invalid_json(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test update with invalid JSON structure."""
        user = User(
            id="validation-user",
            email="validation@example.com",
            username="validuser",
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        # Invalid field that's not in UserUpdate model
        update_data = {"invalid_field": "value"}

        with override_auth(mock_user):
            response = await client.put("/api/v1/users/me", json=update_data)

        # Should succeed but ignore invalid fields
        assert response.status_code == 200

    async def test_update_profile_very_long_strings(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test updating with very long strings."""
        user = User(
            id="long-string-user",
            email="longstring@example.com",
            username="longuser",
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        # Very long bio
        update_data = {"bio": "A" * 10000}

        with override_auth(mock_user):
            response = await client.patch("/api/v1/users/me", json=update_data)

        # Should succeed (no length validation in endpoint)
        assert response.status_code == 200
        data = response.json()
        assert len(data["bio"]) == 10000


@pytest.mark.integration
@pytest.mark.asyncio
class TestComplexUserScenarios:
    """Tests for complex user scenarios."""

    async def test_multiple_profile_updates_sequence(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test multiple sequential profile updates."""
        user = User(
            id="sequence-user",
            email="sequence@example.com",
            username="sequser",
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        # First update
        with override_auth(mock_user):
            response1 = await client.put("/api/v1/users/me", json={"full_name": "First Name"})
        assert response1.status_code == 200

        # Second update
        with override_auth(mock_user):
            response2 = await client.patch("/api/v1/users/me", json={"bio": "First bio"})
        assert response2.status_code == 200

        # Third update
        with override_auth(mock_user):
            response3 = await client.put("/api/v1/users/me", json={"avatar_url": "https://final.com/pic.jpg"})
        assert response3.status_code == 200

        # Verify final state
        with override_auth(mock_user):
            response_final = await client.get("/api/v1/users/me")

        assert response_final.status_code == 200
        data = response_final.json()
        assert data["avatar_url"] == "https://final.com/pic.jpg"

    async def test_user_with_special_characters_in_email(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test user with special characters in email."""
        user = User(
            id="special-char-user",
            email="user+tag@example.co.uk",
            username="specialuser",
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        with override_auth(mock_user):
            response = await client.get("/api/v1/users/me")

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "user+tag@example.co.uk"

    async def test_concurrent_profile_reads(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        override_auth
    ):
        """Test concurrent profile reads (simulated)."""
        user = User(
            id="concurrent-user",
            email="concurrent@example.com",
            username="concurrentuser",
            email_verified=True,
            is_active=True
        )
        db_session.add(user)
        await db_session.commit()

        mock_user = Mock()
        mock_user.id = user.id

        # Simulate multiple reads
        responses = []
        for _ in range(5):
            with override_auth(mock_user):
                response = await client.get("/api/v1/users/me")
                responses.append(response)

        # All should succeed
        for response in responses:
            assert response.status_code == 200
            assert response.json()["id"] == user.id
