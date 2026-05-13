from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import os
import uuid
from datetime import datetime
from ..core.config import settings
from ..database import get_db
from .deps import get_current_user
from ..models.models import User
from ..schemas.schemas import UploadResponse

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
MAX_FILE_SIZE = 10 * 1024 * 1024


def get_upload_dir():
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    date_dir = os.path.join(upload_dir, datetime.now().strftime("%Y/%m/%d"))
    os.makedirs(date_dir, exist_ok=True)
    return date_dir


def allowed_file(filename: str) -> bool:
    ext = os.path.splitext(filename.lower())[1]
    return ext in ALLOWED_EXTENSIONS


def generate_filename(original_filename: str) -> str:
    ext = os.path.splitext(original_filename)[1]
    return f"{uuid.uuid4().hex}{ext}"


@router.post("/images", response_model=List[UploadResponse])
async def upload_images(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    uploaded_files = []
    upload_dir = get_upload_dir()

    for file in files:
        if not allowed_file(file.filename or ""):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"不支持的文件格式: {file.filename}"
            )

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"文件过大: {file.filename}"
            )

        filename = generate_filename(file.filename or "image.jpg")
        file_path = os.path.join(upload_dir, filename)

        with open(file_path, "wb") as f:
            f.write(content)

        relative_path = os.path.relpath(file_path, settings.UPLOAD_DIR).replace("\\", "/")
        url = f"/static/uploads/{relative_path}"

        uploaded_files.append(UploadResponse(
            url=url,
            filename=filename
        ))

    return uploaded_files


@router.post("/image", response_model=UploadResponse)
async def upload_single_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not allowed_file(file.filename or ""):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不支持的文件格式"
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件过大，最大10MB"
        )

    upload_dir = get_upload_dir()
    filename = generate_filename(file.filename or "image.jpg")
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        f.write(content)

    relative_path = os.path.relpath(file_path, settings.UPLOAD_DIR).replace("\\", "/")
    url = f"/static/uploads/{relative_path}"

    return UploadResponse(url=url, filename=filename)
