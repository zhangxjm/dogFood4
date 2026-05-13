from fastapi import Depends, HTTPException, status, WebSocket, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.models import User
from ..core.security import decode_access_token
from typing import Optional


async def get_current_user(
    token: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = await db.get(User, int(user_id))
    if user is None:
        raise credentials_exception
    return user


async def get_current_user_optional(
    token: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if payload is None:
        return None
    user_id: str = payload.get("sub")
    if user_id is None:
        return None
    user = await db.get(User, int(user_id))
    return user
