"""
Unit tests for files endpoints.
"""

from io import BytesIO
from unittest.mock import AsyncMock, MagicMock, Mock, mock_open, patch

import pytest
from fastapi import HTTPException, UploadFile

from app.api.v1.endpoints.files import (
    delete_file,
    download_file,
    list_files,
    upload_file,
)


class TestFileEndpoints:
    """Tests for file endpoints."""

    @pytest.mark.asyncio
    async def test_upload_file_success(self):
        """Test successful file upload."""
        # Create mock file
        file_content = b"test file content"
        mock_file = Mock(spec=UploadFile)
        mock_file.filename = "test.txt"
        mock_file.file = BytesIO(file_content)

        with patch("app.api.v1.endpoints.files.os.makedirs"):
            with patch("builtins.open", mock_open()) as m_open:
                with patch("app.api.v1.endpoints.files.shutil.copyfileobj"):
                    with patch(
                        "app.api.v1.endpoints.files.os.path.getsize", return_value=len(file_content)
                    ):
                        response = await upload_file(file=mock_file)

                        assert response["success"] is True
                        assert "file_id" in response
                        assert response["filename"] == "test.txt"

    @pytest.mark.asyncio
    async def test_upload_file_error(self):
        """Test upload file with error."""
        mock_file = Mock(spec=UploadFile)
        mock_file.filename = "test.txt"
        mock_file.file = Mock()

        with patch("builtins.open", side_effect=Exception("Write error")):
            with pytest.raises(HTTPException) as exc_info:
                await upload_file(file=mock_file)

            assert exc_info.value.status_code == 500

    @pytest.mark.asyncio
    async def test_list_files(self):
        """Test listing files."""
        with patch(
            "app.api.v1.endpoints.files.os.listdir", return_value=["file1.txt", "file2.pdf"]
        ):
            with patch("app.api.v1.endpoints.files.os.path.getsize", return_value=1000):
                with patch("app.api.v1.endpoints.files.os.path.getctime", return_value=1234567890):
                    response = await list_files()

                    assert "files" in response
                    assert len(response["files"]) == 2

    @pytest.mark.asyncio
    async def test_download_file_success(self):
        """Test downloading existing file."""
        # Use valid UUID format for security validation
        file_id = "550e8400-e29b-41d4-a716-446655440000"

        with patch("app.api.v1.endpoints.files.os.listdir", return_value=[f"{file_id}.txt"]):
            response = await download_file(file_id)

            # FileResponse is returned
            assert response is not None

    @pytest.mark.asyncio
    async def test_download_file_not_found(self):
        """Test downloading non-existent file."""
        # Use valid UUID format for security validation
        file_id = "550e8400-e29b-41d4-a716-446655440001"

        with patch("app.api.v1.endpoints.files.os.listdir", return_value=[]):
            with pytest.raises(HTTPException) as exc_info:
                await download_file(file_id)

            assert exc_info.value.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_file_success(self):
        """Test successful file deletion."""
        # Use valid UUID format for security validation
        file_id = "550e8400-e29b-41d4-a716-446655440002"

        with patch("app.api.v1.endpoints.files.os.listdir", return_value=[f"{file_id}.txt"]):
            with patch("app.api.v1.endpoints.files.os.remove") as mock_remove:
                response = await delete_file(file_id)

                assert response["success"] is True
                mock_remove.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_file_not_found(self):
        """Test deleting non-existent file."""
        # Use valid UUID format for security validation
        file_id = "550e8400-e29b-41d4-a716-446655440003"

        with patch("app.api.v1.endpoints.files.os.listdir", return_value=[]):
            with pytest.raises(HTTPException) as exc_info:
                await delete_file(file_id)

            assert exc_info.value.status_code == 404
