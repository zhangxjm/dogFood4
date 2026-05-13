from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class UserBase(BaseModel):
    username: str
    nickname: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    school: Optional[str] = None
    college: Optional[str] = None
    location: Optional[str] = None
    building: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    avatar: Optional[str] = None
    role: str
    is_verified: bool
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProductBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    category: str
    condition: Optional[str] = None
    campus: Optional[str] = None
    college: Optional[str] = None
    building: Optional[str] = None


class ProductCreate(ProductBase):
    images: Optional[List[str]] = None


class ProductResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    category: str
    condition: Optional[str] = None
    campus: Optional[str] = None
    college: Optional[str] = None
    building: Optional[str] = None
    images: Optional[str] = None
    status: str
    seller_id: int
    view_count: int
    favorite_count: int
    created_at: datetime
    seller: Optional[Any] = None

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    total: int
    items: List[ProductResponse]


class FavoriteResponse(BaseModel):
    id: int
    product_id: int
    created_at: datetime
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    product_id: int
    pickup_location: Optional[str] = None
    pickup_time: Optional[datetime] = None
    note: Optional[str] = None


class OrderCreate(OrderBase):
    pass


class OrderResponse(BaseModel):
    id: int
    order_no: str
    product_id: int
    buyer_id: int
    seller_id: int
    price: float
    status: str
    pickup_location: Optional[str] = None
    pickup_time: Optional[datetime] = None
    note: Optional[str] = None
    created_at: datetime
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class VerificationBase(BaseModel):
    student_id: str
    real_name: str
    school: str


class VerificationCreate(VerificationBase):
    id_card_image: Optional[str] = None
    student_card_image: Optional[str] = None


class VerificationResponse(VerificationBase):
    id: int
    user_id: int
    status: str
    feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MessageBase(BaseModel):
    content: str
    message_type: str = "text"


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: str
    message_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: int
    user1_id: int
    user2_id: int
    product_id: Optional[int] = None
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    url: str
    filename: str


class DemandBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    condition: Optional[str] = None
    campus: Optional[str] = None
    college: Optional[str] = None
    building: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    urgency: Optional[str] = "normal"


class DemandCreate(DemandBase):
    pass


class DemandResponse(DemandBase):
    id: int
    buyer_id: int
    matched_product_id: Optional[int] = None
    status: str
    view_count: int
    created_at: datetime
    buyer: Optional[Any] = None
    matched_product: Optional[Any] = None

    class Config:
        from_attributes = True


class DemandListResponse(BaseModel):
    total: int
    items: List[DemandResponse]


class MatchResult(BaseModel):
    product: ProductResponse
    match_score: int
    match_reasons: List[str]
