from sqlalchemy import String, Integer, Float, DateTime, Text, Boolean, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from ..database import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"


class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class ProductStatus(str, enum.Enum):
    AVAILABLE = "available"
    SOLD = "sold"
    RESERVED = "reserved"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255))
    nickname: Mapped[str] = mapped_column(String(50), nullable=True)
    avatar: Mapped[str] = mapped_column(String(255), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    email: Mapped[str] = mapped_column(String(100), nullable=True)
    school: Mapped[str] = mapped_column(String(100), nullable=True)
    college: Mapped[str] = mapped_column(String(100), nullable=True)
    student_id: Mapped[str] = mapped_column(String(50), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default=UserRole.STUDENT)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verification_status: Mapped[str] = mapped_column(String(20), default=VerificationStatus.PENDING)
    location: Mapped[str] = mapped_column(String(200), nullable=True)
    building: Mapped[str] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    products: Mapped[list["Product"]] = relationship("Product", back_populates="seller", cascade="all, delete-orphan")
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    orders_as_buyer: Mapped[list["Order"]] = relationship(
        "Order",
        foreign_keys="Order.buyer_id",
        back_populates="buyer"
    )
    orders_as_seller: Mapped[list["Order"]] = relationship(
        "Order",
        foreign_keys="Order.seller_id",
        back_populates="seller"
    )


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Float)
    original_price: Mapped[float] = mapped_column(Float, nullable=True)
    category: Mapped[str] = mapped_column(String(50))
    images: Mapped[str] = mapped_column(Text, nullable=True)
    condition: Mapped[str] = mapped_column(String(50), nullable=True)
    campus: Mapped[str] = mapped_column(String(100), nullable=True)
    college: Mapped[str] = mapped_column(String(100), nullable=True)
    building: Mapped[str] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default=ProductStatus.AVAILABLE)
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    favorite_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    seller: Mapped["User"] = relationship("User", back_populates="products")
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="product", cascade="all, delete-orphan")


class Favorite(Base):
    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="favorites")
    product: Mapped["Product"] = relationship("Product", back_populates="favorites")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_no: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    buyer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    price: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default=OrderStatus.PENDING)
    pickup_location: Mapped[str] = mapped_column(String(200), nullable=True)
    pickup_time: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    note: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    buyer: Mapped["User"] = relationship("User", foreign_keys=[buyer_id], back_populates="orders_as_buyer")
    seller: Mapped["User"] = relationship("User", foreign_keys=[seller_id], back_populates="orders_as_seller")


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user1_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user2_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=True)
    last_message: Mapped[str] = mapped_column(String(500), nullable=True)
    last_message_time: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    messages: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan"
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    conversation_id: Mapped[int] = mapped_column(ForeignKey("conversations.id"))
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(Text)
    message_type: Mapped[str] = mapped_column(String(20), default="text")
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="messages")


class Verification(Base):
    __tablename__ = "verifications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    student_id: Mapped[str] = mapped_column(String(50))
    real_name: Mapped[str] = mapped_column(String(50))
    school: Mapped[str] = mapped_column(String(100))
    id_card_image: Mapped[str] = mapped_column(String(255), nullable=True)
    student_card_image: Mapped[str] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default=VerificationStatus.PENDING)
    feedback: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class DemandStatus(str, enum.Enum):
    OPEN = "open"
    MATCHED = "matched"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class Demand(Base):
    __tablename__ = "demands"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50))
    condition: Mapped[str] = mapped_column(String(50), nullable=True)
    campus: Mapped[str] = mapped_column(String(100), nullable=True)
    college: Mapped[str] = mapped_column(String(100), nullable=True)
    building: Mapped[str] = mapped_column(String(100), nullable=True)
    min_price: Mapped[float] = mapped_column(Float, nullable=True)
    max_price: Mapped[float] = mapped_column(Float, nullable=True)
    urgency: Mapped[str] = mapped_column(String(20), default="normal")
    buyer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    matched_product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default=DemandStatus.OPEN)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    buyer: Mapped["User"] = relationship("User")
    matched_product: Mapped["Product"] = relationship("Product")
