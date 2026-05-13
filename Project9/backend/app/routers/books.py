from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import datetime
import httpx

from ..database import get_db
from ..models import Book, BorrowRecord
from ..schemas import BookCreate, BookUpdate, Book as BookSchema
from ..schemas import PaginatedResponse

router = APIRouter(prefix="/api/books", tags=["books"])


async def fetch_book_info_from_isbn(isbn: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data", timeout=10.0)
            data = response.json()
            key = f"ISBN:{isbn}"
            if key in data:
                book_data = data[key]
                return {
                    "title": book_data.get("title", ""),
                    "authors": [a.get("name", "") for a in book_data.get("authors", [])],
                    "publishers": [p.get("name", "") for p in book_data.get("publishers", [])],
                    "number_of_pages": book_data.get("number_of_pages"),
                    "cover": book_data.get("cover", {}).get("large"),
                }
        except Exception:
            pass
    return None


@router.post("/isbn/{isbn}", response_model=BookSchema)
async def create_book_by_isbn(isbn: str, db: AsyncSession = Depends(get_db)):
    existing_book = await db.execute(select(Book).where(Book.isbn == isbn))
    if existing_book.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Book with this ISBN already exists")
    
    book_info = await fetch_book_info_from_isbn(isbn)
    
    if not book_info:
        return BookCreate(
            isbn=isbn,
            title=f"未知图书-{isbn}",
            author="未知作者",
        )
    
    book = Book(
        isbn=isbn,
        title=book_info["title"] or f"图书-{isbn}",
        author=", ".join(book_info["authors"]) if book_info["authors"] else "未知作者",
        publisher=", ".join(book_info["publishers"]) if book_info["publishers"] else None,
        cover_url=book_info["cover"],
        total_quantity=1,
        available_quantity=1,
    )
    
    db.add(book)
    await db.commit()
    await db.refresh(book)
    return book


@router.get("", response_model=PaginatedResponse)
async def get_books(
    search: Optional[str] = None,
    category: Optional[str] = None,
    available_only: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * page_size
    
    count_query = select(func.count(Book.id))
    query = select(Book)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Book.title.ilike(search_pattern),
                Book.author.ilike(search_pattern),
                Book.isbn.ilike(search_pattern),
            )
        )
        count_query = count_query.where(
            or_(
                Book.title.ilike(search_pattern),
                Book.author.ilike(search_pattern),
                Book.isbn.ilike(search_pattern),
            )
        )
    
    if category:
        query = query.where(Book.category == category)
        count_query = count_query.where(Book.category == category)
    
    if available_only:
        query = query.where(Book.available_quantity > 0)
        count_query = count_query.where(Book.available_quantity > 0)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    query = query.offset(offset).limit(page_size)
    result = await db.execute(query)
    books = result.scalars().all()
    
    return {"total": total, "items": books}


@router.get("/{book_id}", response_model=BookSchema)
async def get_book(book_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("", response_model=BookSchema)
async def create_book(book: BookCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Book).where(Book.isbn == book.isbn))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Book with this ISBN already exists")
    
    db_book = Book(**book.model_dump())
    db.add(db_book)
    await db.commit()
    await db.refresh(db_book)
    return db_book


@router.put("/{book_id}", response_model=BookSchema)
async def update_book(book_id: int, book: BookUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book).where(Book.id == book_id))
    db_book = result.scalar_one_or_none()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    update_data = book.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_book, key, value)
    
    await db.commit()
    await db.refresh(db_book)
    return db_book


@router.delete("/{book_id}")
async def delete_book(book_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    borrow_result = await db.execute(
        select(BorrowRecord).where(
            BorrowRecord.book_id == book_id,
            BorrowRecord.status == "borrowed",
        )
    )
    if borrow_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Cannot delete book with active borrows")
    
    await db.delete(book)
    await db.commit()
    return {"message": "Book deleted successfully"}


@router.get("/categories/list")
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Book.category).where(Book.category.isnot(None)).distinct())
    categories = result.scalars().all()
    return {"categories": categories}
