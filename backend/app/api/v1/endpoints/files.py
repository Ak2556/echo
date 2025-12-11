import os
import re
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from fastapi.responses import FileResponse, StreamingResponse

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# SECURITY: Whitelist of allowed file extensions
ALLOWED_EXTENSIONS = {
    # Images
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".bmp",
    ".ico",
    # Videos
    ".mp4",
    ".webm",
    ".ogg",
    ".mov",
    ".avi",
    ".mkv",
    ".flv",
    # Audio
    ".mp3",
    ".wav",
    ".ogg",
    ".m4a",
    ".flac",
    # Documents
    ".pdf",
    ".txt",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    # Archives
    ".zip",
    ".rar",
    ".7z",
    ".tar",
    ".gz",
}

# SECURITY: Maximum file size (50MB)
MAX_FILE_SIZE = 50 * 1024 * 1024


def validate_filename(filename: str) -> bool:
    """SECURITY: Validate filename to prevent path traversal and malicious filenames."""
    if not filename:
        return False
    # Reject path traversal attempts
    if ".." in filename or "/" in filename or "\\" in filename:
        return False
    # Reject files starting with dot (hidden files)
    if filename.startswith("."):
        return False
    # Check extension
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS


def validate_uuid(file_id: str) -> bool:
    """SECURITY: Validate that file_id is a proper UUID to prevent path traversal."""
    uuid_pattern = re.compile(
        r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE
    )
    return bool(uuid_pattern.match(file_id))


def is_safe_path(basedir: str, path: str) -> bool:
    """SECURITY: Ensure resolved path is within the base directory."""
    base = os.path.realpath(basedir)
    target = os.path.realpath(path)
    return target.startswith(base)


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file to the server with security validations."""
    try:
        # SECURITY FIX: Validate filename
        if not validate_filename(file.filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid filename or file type not allowed",
            )

        # SECURITY FIX: Check file size before saving
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024)}MB",
            )

        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1].lower()
        unique_filename = f"{file_id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # SECURITY FIX: Verify path is safe
        if not is_safe_path(UPLOAD_DIR, file_path):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file path")

        # Save file with size limit enforcement
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer, length=8192)

        # Determine media type
        media_type = "unknown"
        if file.content_type:
            if file.content_type.startswith("image/"):
                media_type = "image"
            elif file.content_type.startswith("video/"):
                media_type = "video"
            elif file.content_type.startswith("audio/"):
                media_type = "audio"

        return {
            "success": True,
            "file_id": file_id,
            "filename": file.filename,
            "url": f"/api/files/{file_id}",
            "media_type": media_type,
            "content_type": file.content_type,
            "size": os.path.getsize(file_path),
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}",
        )


@router.get("/{file_id}")
async def serve_file(file_id: str, request: Request):
    """
    Serve a file by ID with support for Range requests (video streaming).
    SECURITY: Validates UUID and prevents path traversal.
    """
    # SECURITY FIX: Validate file_id is a proper UUID
    if not validate_uuid(file_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file ID format"
        )

    # Find file with this ID
    files = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(file_id)]
    if not files:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    file_path = os.path.join(UPLOAD_DIR, files[0])

    # SECURITY FIX: Verify path is safe (prevents path traversal)
    if not is_safe_path(UPLOAD_DIR, file_path):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    file_size = os.path.getsize(file_path)

    # Determine content type from extension
    extension = Path(file_path).suffix.lower()
    content_type_map = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".ogg": "video/ogg",
        ".mov": "video/quicktime",
        ".avi": "video/x-msvideo",
        ".mkv": "video/x-matroska",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
    }
    content_type = content_type_map.get(extension, "application/octet-stream")

    # Check if Range header is present (for video seeking)
    range_header = request.headers.get("range")

    if range_header:
        # Parse range header (format: "bytes=start-end")
        range_str = range_header.replace("bytes=", "")
        start, end = range_str.split("-")
        start = int(start)
        end = int(end) if end else file_size - 1

        # Ensure end doesn't exceed file size
        end = min(end, file_size - 1)
        content_length = end - start + 1

        # Read the requested range
        def iterfile():
            with open(file_path, "rb") as f:
                f.seek(start)
                remaining = content_length
                while remaining > 0:
                    chunk_size = min(8192, remaining)
                    data = f.read(chunk_size)
                    if not data:
                        break
                    remaining -= len(data)
                    yield data

        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(content_length),
            "Content-Type": content_type,
        }

        return StreamingResponse(
            iterfile(), status_code=206, headers=headers, media_type=content_type
        )

    # No range header - return full file
    return FileResponse(file_path, media_type=content_type, headers={"Accept-Ranges": "bytes"})


@router.get("/download/{file_id}")
async def download_file(file_id: str):
    """Download a file by ID (legacy endpoint). SECURITY: UUID validation and path check."""
    # SECURITY FIX: Validate file_id
    if not validate_uuid(file_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file ID format"
        )

    # Find file with this ID
    files = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(file_id)]
    if not files:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    file_path = os.path.join(UPLOAD_DIR, files[0])

    # SECURITY FIX: Verify path is safe
    if not is_safe_path(UPLOAD_DIR, file_path):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return FileResponse(file_path)


@router.get("/")
@router.get("/list")
async def list_files():
    """List all uploaded files. SECURITY: Only returns filenames, not full paths."""
    files = []
    for filename in os.listdir(UPLOAD_DIR):
        file_path = os.path.join(UPLOAD_DIR, filename)
        # SECURITY: Verify each path is safe before including
        if not is_safe_path(UPLOAD_DIR, file_path):
            continue
        files.append(
            {
                "filename": filename,
                "size": os.path.getsize(file_path),
                "uploaded_at": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat(),
            }
        )
    return {"files": files}


@router.delete("/{file_id}")
async def delete_file(file_id: str):
    """Delete a file by ID. SECURITY: UUID validation and path verification."""
    # SECURITY FIX: Validate file_id
    if not validate_uuid(file_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file ID format"
        )

    # Find file with this ID
    files = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(file_id)]
    if not files:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    file_path = os.path.join(UPLOAD_DIR, files[0])

    # SECURITY FIX: Verify path is safe
    if not is_safe_path(UPLOAD_DIR, file_path):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    os.remove(file_path)
    return {"success": True, "message": "File deleted"}
