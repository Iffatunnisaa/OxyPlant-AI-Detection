from pathlib import Path

from fastapi import UploadFile

from backend.config import ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES


def validate_upload_file(file: UploadFile) -> None:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file extension. Use jpg, jpeg, or png")

    if (file.content_type or "").lower() not in ALLOWED_MIME_TYPES:
        raise ValueError("Unsupported file content type. Use image/jpeg or image/png")
