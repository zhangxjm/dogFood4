from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List
from decimal import Decimal


class BookBase(BaseModel):
    isbn: str
    title: str
    author: str
    publisher: Optional[str] = None
    publish_date: Optional[date] = None
    category: Optional[str] = None
    description: Optional[str] = None
    total_quantity: int = 1
    available_quantity: int = 1
    location: Optional[str] = None
    cover_url: Optional[str] = None


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    isbn: Optional[str] = None
    title: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    publish_date: Optional[date] = None
    category: Optional[str] = None
    description: Optional[str] = None
    total_quantity: Optional[int] = None
    available_quantity: Optional[int] = None
    location: Optional[str] = None
    cover_url: Optional[str] = None


class Book(BookBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReaderBase(BaseModel):
    name: str
    card_number: str
    phone: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    status: str = "active"
    max_borrow_count: int = 5


class ReaderCreate(ReaderBase):
    pass


class ReaderUpdate(BaseModel):
    name: Optional[str] = None
    card_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    max_borrow_count: Optional[int] = None


class Reader(ReaderBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BorrowRecordBase(BaseModel):
    book_id: int
    reader_id: int


class BorrowRecordCreate(BorrowRecordBase):
    pass


class BorrowRecord(BaseModel):
    id: int
    book_id: int
    reader_id: int
    borrow_date: date
    due_date: date
    return_date: Optional[date] = None
    status: str
    fine_amount: Optional[Decimal] = None
    fine_paid: bool
    book: Optional[Book] = None
    reader: Optional[Reader] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReservationBase(BaseModel):
    book_id: int
    reader_id: int


class ReservationCreate(ReservationBase):
    pass


class Reservation(BaseModel):
    id: int
    book_id: int
    reader_id: int
    reservation_date: date
    expiry_date: Optional[date] = None
    status: str
    book: Optional[Book] = None
    reader: Optional[Reader] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedResponse(BaseModel):
    total: int
    items: List[Book]


class StatsOverview(BaseModel):
    total_books: int
    total_readers: int
    total_borrowed: int
    total_overdue: int
    total_reservations: int


class BorrowStats(BaseModel):
    daily_borrows: List[dict]
    category_distribution: List[dict]


class OverdueStats(BaseModel):
    total_overdue_count: int
    total_fine_amount: Decimal
    overdue_list: List[dict]
