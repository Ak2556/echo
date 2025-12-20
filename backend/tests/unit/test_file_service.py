"""
Unit tests for File Service.
"""

import io
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, mock_open, patch

import pytest

from app.core.exceptions import ValidationException
from app.services.file_service import FileService


@pytest.fixture
def file_service():
    """Create file service instance"""
    return FileService()


@pytest.fixture
def mock_upload_file():
    """Create mock upload file"""

    def _create_mock(filename: str, content: bytes = b"test content", size: int = None):
        mock_file = MagicMock()
        mock_file.filename = filename
        mock_file.read = AsyncMock(return_value=content)

        # Mock file object for size checking
        if size is not None:
            # Create a mock that returns the specified size
            file_obj = MagicMock()
            file_obj.seek = MagicMock()
            file_obj.tell = MagicMock(return_value=size)
        else:
            # Use actual BytesIO for normal cases
            file_obj = io.BytesIO(content)

        mock_file.file = file_obj
        return mock_file

    return _create_mock


class TestFileServiceInitialization:
    """Tests for FileService initialization"""

    def test_file_service_initialization(self, file_service):
        """Test file service initialization"""
        assert file_service.upload_dir == Path("uploads")
        assert file_service.max_file_size == 50 * 1024 * 1024  # 50MB
        assert "images" in file_service.allowed_extensions
        assert "documents" in file_service.allowed_extensions
        assert "videos" in file_service.allowed_extensions
        assert "audio" in file_service.allowed_extensions
        assert "archives" in file_service.allowed_extensions

    def test_allowed_extensions_structure(self, file_service):
        """Test that allowed extensions are properly structured"""
        assert ".jpg" in file_service.allowed_extensions["images"]
        assert ".pdf" in file_service.allowed_extensions["documents"]
        assert ".mp4" in file_service.allowed_extensions["videos"]
        assert ".mp3" in file_service.allowed_extensions["audio"]
        assert ".zip" in file_service.allowed_extensions["archives"]


class TestUploadFile:
    """Tests for upload_file method"""

    @pytest.mark.asyncio
    async def test_upload_file_success_image(self, file_service, mock_upload_file):
        """Test uploading image file successfully"""
        mock_file = mock_upload_file("test.jpg", b"fake image content")

        with patch("pathlib.Path.mkdir") as mock_mkdir:
            with patch("aiofiles.open") as mock_aio_open:
                mock_file_handle = AsyncMock()
                mock_file_handle.write = AsyncMock()
                mock_aio_open.return_value.__aenter__ = AsyncMock(return_value=mock_file_handle)
                mock_aio_open.return_value.__aexit__ = AsyncMock()

                result = await file_service.upload_file(
                    file=mock_file, folder="images", user_id=123
                )

        assert result.startswith("/uploads/images/123/")
        assert result.endswith(".jpg")
        mock_mkdir.assert_called_once()

    @pytest.mark.asyncio
    async def test_upload_file_success_document(self, file_service, mock_upload_file):
        """Test uploading document file successfully"""
        mock_file = mock_upload_file("document.pdf", b"fake pdf content")

        with patch("pathlib.Path.mkdir"):
            with patch("aiofiles.open") as mock_aio_open:
                mock_file_handle = AsyncMock()
                mock_file_handle.write = AsyncMock()
                mock_aio_open.return_value.__aenter__ = AsyncMock(return_value=mock_file_handle)
                mock_aio_open.return_value.__aexit__ = AsyncMock()

                result = await file_service.upload_file(
                    file=mock_file, folder="documents", user_id=456
                )

        assert result.startswith("/uploads/documents/456/")
        assert result.endswith(".pdf")

    @pytest.mark.asyncio
    async def test_upload_file_with_allowed_types(self, file_service, mock_upload_file):
        """Test uploading file with specific allowed types"""
        mock_file = mock_upload_file("photo.png", b"fake image")

        with patch("pathlib.Path.mkdir"):
            with patch("aiofiles.open") as mock_aio_open:
                mock_file_handle = AsyncMock()
                mock_file_handle.write = AsyncMock()
                mock_aio_open.return_value.__aenter__ = AsyncMock(return_value=mock_file_handle)
                mock_aio_open.return_value.__aexit__ = AsyncMock()

                result = await file_service.upload_file(
                    file=mock_file, folder="images", user_id=789, allowed_types=["images"]
                )

        assert result.startswith("/uploads/images/789/")
        assert result.endswith(".png")

    @pytest.mark.asyncio
    async def test_upload_file_creates_directory_structure(self, file_service, mock_upload_file):
        """Test that upload creates proper directory structure"""
        mock_file = mock_upload_file("test.jpg", b"content")

        with patch("pathlib.Path.mkdir") as mock_mkdir:
            with patch("aiofiles.open") as mock_aio_open:
                mock_file_handle = AsyncMock()
                mock_file_handle.write = AsyncMock()
                mock_aio_open.return_value.__aenter__ = AsyncMock(return_value=mock_file_handle)
                mock_aio_open.return_value.__aexit__ = AsyncMock()

                await file_service.upload_file(file=mock_file, folder="test", user_id=1)

        mock_mkdir.assert_called_once_with(parents=True, exist_ok=True)

    @pytest.mark.asyncio
    async def test_upload_file_generates_unique_filename(self, file_service, mock_upload_file):
        """Test that upload generates unique filename"""
        mock_file1 = mock_upload_file("test.jpg", b"content1")
        mock_file2 = mock_upload_file("test.jpg", b"content2")

        with patch("pathlib.Path.mkdir"):
            with patch("aiofiles.open") as mock_aio_open:
                mock_file_handle = AsyncMock()
                mock_file_handle.write = AsyncMock()
                mock_aio_open.return_value.__aenter__ = AsyncMock(return_value=mock_file_handle)
                mock_aio_open.return_value.__aexit__ = AsyncMock()

                result1 = await file_service.upload_file(mock_file1, "images", 1)
                result2 = await file_service.upload_file(mock_file2, "images", 1)

        # Filenames should be different despite same original name
        assert result1 != result2


class TestDeleteFile:
    """Tests for delete_file method"""

    @pytest.mark.asyncio
    async def test_delete_file_success(self, file_service):
        """Test deleting file successfully"""
        mock_path = MagicMock(spec=Path)
        mock_path.exists.return_value = True
        mock_path.unlink = MagicMock()

        with patch("app.services.file_service.Path", return_value=mock_path):
            result = await file_service.delete_file("/uploads/test/file.jpg")

        assert result is True
        mock_path.unlink.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_file_not_found(self, file_service):
        """Test deleting non-existent file"""
        mock_path = MagicMock(spec=Path)
        mock_path.exists.return_value = False

        with patch("app.services.file_service.Path", return_value=mock_path):
            result = await file_service.delete_file("/uploads/test/nonexistent.jpg")

        assert result is False

    @pytest.mark.asyncio
    async def test_delete_file_exception_handled(self, file_service):
        """Test that delete_file handles exceptions gracefully"""
        mock_path = MagicMock(spec=Path)
        mock_path.exists.return_value = True
        mock_path.unlink.side_effect = Exception("Permission denied")

        with patch("app.services.file_service.Path", return_value=mock_path):
            result = await file_service.delete_file("/uploads/test/file.jpg")

        assert result is False


class TestValidateFile:
    """Tests for _validate_file method"""

    @pytest.mark.asyncio
    async def test_validate_file_no_filename(self, file_service):
        """Test validation fails when no filename provided"""
        mock_file = MagicMock()
        mock_file.filename = None

        with pytest.raises(ValidationException, match="No file provided"):
            await file_service._validate_file(mock_file)

    @pytest.mark.asyncio
    async def test_validate_file_empty_filename(self, file_service):
        """Test validation fails when filename is empty"""
        mock_file = MagicMock()
        mock_file.filename = ""

        with pytest.raises(ValidationException, match="No file provided"):
            await file_service._validate_file(mock_file)

    @pytest.mark.asyncio
    async def test_validate_file_exceeds_size_limit(self, file_service, mock_upload_file):
        """Test validation fails when file exceeds size limit"""
        # Create file larger than 50MB
        oversized = 51 * 1024 * 1024
        mock_file = mock_upload_file("large.jpg", b"x", size=oversized)

        with pytest.raises(ValidationException, match="File size exceeds maximum"):
            await file_service._validate_file(mock_file)

    @pytest.mark.asyncio
    async def test_validate_file_allowed_extension(self, file_service, mock_upload_file):
        """Test validation succeeds for allowed extension"""
        mock_file = mock_upload_file("image.jpg", b"content")

        # Should not raise
        await file_service._validate_file(mock_file)

    @pytest.mark.asyncio
    async def test_validate_file_disallowed_extension(self, file_service, mock_upload_file):
        """Test validation fails for disallowed extension"""
        mock_file = mock_upload_file("malware.exe", b"content")

        with pytest.raises(ValidationException, match="File type .exe not allowed"):
            await file_service._validate_file(mock_file)

    @pytest.mark.asyncio
    async def test_validate_file_with_allowed_types_success(self, file_service, mock_upload_file):
        """Test validation with specific allowed types - success"""
        mock_file = mock_upload_file("photo.jpg", b"content")

        # Should not raise
        await file_service._validate_file(mock_file, allowed_types=["images"])

    @pytest.mark.asyncio
    async def test_validate_file_with_allowed_types_failure(self, file_service, mock_upload_file):
        """Test validation with specific allowed types - failure"""
        mock_file = mock_upload_file("document.pdf", b"content")

        with pytest.raises(ValidationException, match="File type .pdf not allowed"):
            await file_service._validate_file(mock_file, allowed_types=["images"])

    @pytest.mark.asyncio
    async def test_validate_file_multiple_allowed_types(self, file_service, mock_upload_file):
        """Test validation with multiple allowed types"""
        mock_file1 = mock_upload_file("image.jpg", b"content")
        mock_file2 = mock_upload_file("doc.pdf", b"content")

        allowed_types = ["images", "documents"]

        # Both should succeed
        await file_service._validate_file(mock_file1, allowed_types=allowed_types)
        await file_service._validate_file(mock_file2, allowed_types=allowed_types)

    @pytest.mark.asyncio
    async def test_validate_file_case_insensitive_extension(self, file_service, mock_upload_file):
        """Test that extension validation is case-insensitive"""
        mock_file_upper = mock_upload_file("IMAGE.JPG", b"content")
        mock_file_mixed = mock_upload_file("photo.JpG", b"content")

        # Should not raise for either case
        await file_service._validate_file(mock_file_upper)
        await file_service._validate_file(mock_file_mixed)


class TestGetFileType:
    """Tests for get_file_type method"""

    def test_get_file_type_image(self, file_service):
        """Test getting file type for images"""
        assert file_service.get_file_type("photo.jpg") == "images"
        assert file_service.get_file_type("picture.png") == "images"
        assert file_service.get_file_type("image.gif") == "images"
        assert file_service.get_file_type("photo.webp") == "images"

    def test_get_file_type_document(self, file_service):
        """Test getting file type for documents"""
        assert file_service.get_file_type("document.pdf") == "documents"
        assert file_service.get_file_type("file.doc") == "documents"
        assert file_service.get_file_type("text.txt") == "documents"
        assert file_service.get_file_type("doc.docx") == "documents"

    def test_get_file_type_video(self, file_service):
        """Test getting file type for videos"""
        assert file_service.get_file_type("video.mp4") == "videos"
        assert file_service.get_file_type("movie.avi") == "videos"
        assert file_service.get_file_type("clip.mov") == "videos"

    def test_get_file_type_audio(self, file_service):
        """Test getting file type for audio"""
        assert file_service.get_file_type("song.mp3") == "audio"
        assert file_service.get_file_type("sound.wav") == "audio"
        assert file_service.get_file_type("music.ogg") == "audio"

    def test_get_file_type_archive(self, file_service):
        """Test getting file type for archives"""
        assert file_service.get_file_type("archive.zip") == "archives"
        assert file_service.get_file_type("package.rar") == "archives"
        assert file_service.get_file_type("backup.tar") == "archives"

    def test_get_file_type_unknown(self, file_service):
        """Test getting file type for unknown extensions"""
        assert file_service.get_file_type("file.xyz") == "unknown"
        assert file_service.get_file_type("malware.exe") == "unknown"
        assert file_service.get_file_type("script.sh") == "unknown"

    def test_get_file_type_case_insensitive(self, file_service):
        """Test that get_file_type is case-insensitive"""
        assert file_service.get_file_type("PHOTO.JPG") == "images"
        assert file_service.get_file_type("Document.PDF") == "documents"
        assert file_service.get_file_type("Video.MP4") == "videos"

    def test_get_file_type_no_extension(self, file_service):
        """Test getting file type for file without extension"""
        assert file_service.get_file_type("file") == "unknown"
        assert file_service.get_file_type("noextension") == "unknown"


class TestFileServiceEdgeCases:
    """Tests for edge cases and error scenarios"""

    @pytest.mark.asyncio
    async def test_upload_file_with_special_characters(self, file_service, mock_upload_file):
        """Test uploading file with special characters in name"""
        mock_file = mock_upload_file("test file (1).jpg", b"content")

        with patch("pathlib.Path.mkdir"):
            with patch("aiofiles.open") as mock_aio_open:
                mock_file_handle = AsyncMock()
                mock_file_handle.write = AsyncMock()
                mock_aio_open.return_value.__aenter__ = AsyncMock(return_value=mock_file_handle)
                mock_aio_open.return_value.__aexit__ = AsyncMock()

                result = await file_service.upload_file(mock_file, "images", 1)

        # Original name doesn't matter, unique name is generated
        assert result.endswith(".jpg")

    @pytest.mark.asyncio
    async def test_validate_file_exact_size_limit(self, file_service, mock_upload_file):
        """Test validation at exact size limit"""
        # Create file exactly at 50MB limit
        exact_size = 50 * 1024 * 1024
        mock_file = mock_upload_file("limit.jpg", b"x", size=exact_size)

        # Should not raise - at limit is okay
        await file_service._validate_file(mock_file)

    @pytest.mark.asyncio
    async def test_validate_file_one_byte_over_limit(self, file_service, mock_upload_file):
        """Test validation one byte over size limit"""
        # Create file one byte over 50MB limit
        over_limit = 50 * 1024 * 1024 + 1
        mock_file = mock_upload_file("overlimit.jpg", b"x", size=over_limit)

        with pytest.raises(ValidationException, match="File size exceeds maximum"):
            await file_service._validate_file(mock_file)

    @pytest.mark.asyncio
    async def test_upload_different_users_same_folder(self, file_service, mock_upload_file):
        """Test uploading files from different users to same folder"""
        mock_file1 = mock_upload_file("test.jpg", b"user1")
        mock_file2 = mock_upload_file("test.jpg", b"user2")

        with patch("pathlib.Path.mkdir"):
            with patch("aiofiles.open") as mock_aio_open:
                mock_file_handle = AsyncMock()
                mock_file_handle.write = AsyncMock()
                mock_aio_open.return_value.__aenter__ = AsyncMock(return_value=mock_file_handle)
                mock_aio_open.return_value.__aexit__ = AsyncMock()

                result1 = await file_service.upload_file(mock_file1, "images", 1)
                result2 = await file_service.upload_file(mock_file2, "images", 2)

        # Files should be in different user directories
        assert "/1/" in result1
        assert "/2/" in result2

    def test_get_file_type_with_multiple_dots(self, file_service):
        """Test getting file type for filename with multiple dots"""
        assert file_service.get_file_type("my.file.name.jpg") == "images"
        assert file_service.get_file_type("archive.tar.gz") == "archives"
        assert file_service.get_file_type("document.backup.pdf") == "documents"
