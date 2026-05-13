from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from typing import Optional
from ..database import get_db
from ..models.models import User, Verification
from ..schemas.schemas import UserCreate, UserLogin, UserResponse, TokenResponse, VerificationCreate, VerificationResponse
from ..core.security import get_password_hash, verify_password, create_access_token
from .deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_user = await db.scalar(select(User).where(User.username == user_data.username))
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    hashed_password = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        password=hashed_password,
        nickname=user_data.nickname or user_data.username,
        phone=user_data.phone,
        email=user_data.email,
        school=user_data.school,
    )
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="注册失败"
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.username == user_data.username))
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_user(
    user_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    for key, value in user_data.items():
        if hasattr(current_user, key) and key not in ["id", "username", "password", "role"]:
            setattr(current_user, key, value)
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/verify", response_model=VerificationResponse)
async def verify_student(
    verification_data: VerificationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    existing_verification = await db.scalar(
        select(Verification).where(Verification.user_id == current_user.id)
    )
    if existing_verification:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="已提交实名认证"
        )
    verification = Verification(
        user_id=current_user.id,
        student_id=verification_data.student_id,
        real_name=verification_data.real_name,
        school=verification_data.school,
        id_card_image=verification_data.id_card_image,
        student_card_image=verification_data.student_card_image,
        status="pending"
    )
    db.add(verification)
    current_user.student_id = verification_data.student_id
    current_user.school = verification_data.school
    await db.commit()
    await db.refresh(verification)
    return VerificationResponse.model_validate(verification)


@router.get("/verify/status", response_model=Optional[VerificationResponse])
async def get_verification_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    verification = await db.scalar(
        select(Verification).where(Verification.user_id == current_user.id)
    )
    return VerificationResponse.model_validate(verification) if verification else None
