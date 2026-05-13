from sqlalchemy import Column, Integer, String, Date, DateTime, Text, DECIMAL, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String(20), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=False)
    publisher = Column(String(255))
    publish_date = Column(Date)
    category = Column(String(100))
    description = Column(Text)
    total_quantity = Column(Integer, default=1)
    available_quantity = Column(Integer, default=1)
    location = Column(String(100))
    cover_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    borrow_records = relationship("BorrowRecord", back_populates="book")
    reservations = relationship("Reservation", back_populates="book")


class Reader(Base):
    __tablename__ = "readers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    card_number = Column(String(50), unique=True, nullable=False, index=True)
    phone = Column(String(20))
    email = Column(String(100))
    department = Column(String(100))
    status = Column(String(20), default="active")
    max_borrow_count = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    borrow_records = relationship("BorrowRecord", back_populates="reader")
    reservations = relationship("Reservation", back_populates="reader")


class BorrowRecord(Base):
    __tablename__ = "borrow_records"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), index=True)
    reader_id = Column(Integer, ForeignKey("readers.id"), index=True)
    borrow_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    return_date = Column(Date)
    status = Column(String(20), default="borrowed")
    fine_amount = Column(DECIMAL(10, 2), default=0)
    fine_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    book = relationship("Book", back_populates="borrow_records")
    reader = relationship("Reader", back_populates="borrow_records")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), index=True)
    reader_id = Column(Integer, ForeignKey("readers.id"), index=True)
    reservation_date = Column(Date, nullable=False)
    expiry_date = Column(Date)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    book = relationship("Book", back_populates="reservations")
    reader = relationship("Reader", back_populates="reservations")
