"""
File service for handling file uploads and management.
"""
import os
import uuid
import aiofiles
from typing import Optional
from fastapi import UploadFile
from pathlib import Path

from ..core.exceptions import ValidationException


class FileService:
    """Service class for file operations"""
    
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.max_file_size = 50 * 1024 * 1024  # 50MB
        self.allowed_extensions = {
            'images': {'.jpg', '.jpeg', '.png', '.gif', '.webp'},
            'documents': {'.pdf', '.doc', '.docx', '.txt', '.rtf'},
            'videos': {'.mp4', '.avi', '.mov', '.wmv', '.flv'},
            'audio': {'.mp3', '.wav', '.ogg', '.m4a'},
            'archives': {'.zip', '.rar', '.7z', '.tar', '.gz'}
        }
    
    async def upload_file(
        self,
        file: UploadFile,
        folder: str,
        user_id: int,
        allowed_types: Optional[list] = None
    ) -> str:
        """Upload a file and return the file URL"""
        # Validate file
        await self._validate_file(file, allowed_types)
        
        # Create directory structure
        upload_path = self.upload_dir / folder / str(user_id)
        upload_path.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        unique_filename = f"{uuid.uuid4().hex}{file_extension}"
        file_path = upload_path / unique_filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Return relative URL
        return f"/uploads/{folder}/{user_id}/{unique_filename}"
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete a file"""
        try:
            full_path = Path(file_path.lstrip('/'))
            if full_path.exists():
                full_path.unlink()
                return True
        except Exception:
            pass
        return False
    
    async def _validate_file(self, file: UploadFile, allowed_types: Optional[list] = None) -> None:
        """Validate uploaded file"""
        if not file.filename:
            raise ValidationException("No file provided")
        
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > self.max_file_size:
            raise ValidationException(f"File size exceeds maximum allowed size of {self.max_file_size // (1024*1024)}MB")
        
        # Check file extension
        file_extension = Path(file.filename).suffix.lower()
        
        if allowed_types:
            allowed_extensions = set()
            for file_type in allowed_types:
                if file_type in self.allowed_extensions:
                    allowed_extensions.update(self.allowed_extensions[file_type])
            
            if file_extension not in allowed_extensions:
                raise ValidationException(f"File type {file_extension} not allowed")
        else:
            # Check against all allowed extensions
            all_extensions = set()
            for extensions in self.allowed_extensions.values():
                all_extensions.update(extensions)
            
            if file_extension not in all_extensions:
                raise ValidationException(f"File type {file_extension} not allowed")
    
    def get_file_type(self, filename: str) -> str:
        """Get file type category"""
        extension = Path(filename).suffix.lower()
        
        for file_type, extensions in self.allowed_extensions.items():
            if extension in extensions:
                return file_type
        
        return "unknown"