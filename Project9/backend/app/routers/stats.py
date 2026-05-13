from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from decimal import Decimal

from ..database import get_db
from ..models import Book, Reader, BorrowRecord, Reservation

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/overview")
async def get_overview_stats(db: AsyncSession = Depends(get_db)):
    total_books_result = await db.execute(select(func.count(Book.id)))
    total_books = total_books_result.scalar_one()
    
    total_readers_result = await db.execute(select(func.count(Reader.id)))
    total_readers = total_readers_result.scalar_one()
    
    total_borrowed_result = await db.execute(
        select(func.count(BorrowRecord.id)).where(
            BorrowRecord.status == "borrowed",
        )
    )
    total_borrowed = total_borrowed_result.scalar_one()
    
    today = datetime.now().date()
    total_overdue_result = await db.execute(
        select(func.count(BorrowRecord.id)).where(
            BorrowRecord.status == "borrowed",
            BorrowRecord.due_date < today,
        )
    )
    total_overdue = total_overdue_result.scalar_one()
    
    total_reservations_result = await db.execute(
        select(func.count(Reservation.id)).where(
            Reservation.status == "pending",
        )
    )
    total_reservations = total_reservations_result.scalar_one()
    
    return {
        "total_books": total_books,
        "total_readers": total_readers,
        "total_borrowed": total_borrowed,
        "total_overdue": total_overdue,
        "total_reservations": total_reservations,
    }


@router.get("/borrows")
async def get_borrow_stats(db: AsyncSession = Depends(get_db)):
    today = datetime.now().date()
    daily_borrows = []
    
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        result = await db.execute(
            select(func.count(BorrowRecord.id)).where(
                func.date(BorrowRecord.borrow_date) == date
            )
        )
        daily_borrows.append({
            "date": date.isoformat(),
            "count": result.scalar_one()
        })
    
    category_result = await db.execute(
        select(Book.category, func.count(BorrowRecord.id))
        .select_from(Book)
        .join(BorrowRecord, BorrowRecord.book_id == Book.id)
        .group_by(Book.category)
    )
    category_distribution = []
    for row in category_result.fetchall():
        category_distribution.append({
            "category": row[0] or "未分类",
            "count": row[1]
        })
    
    return {
        "daily_borrows": daily_borrows,
        "category_distribution": category_distribution,
    }


@router.get("/overdue")
async def get_overdue_stats(db: AsyncSession = Depends(get_db)):
    today = datetime.now().date()
    
    overdue_records = await db.execute(
        select(BorrowRecord).options(
            selectinload(BorrowRecord.book),
            selectinload(BorrowRecord.reader),
        ).where(
            BorrowRecord.status == "borrowed",
            BorrowRecord.due_date < today,
        )
    )
    overdue_list = []
    total_fine = Decimal("0")
    
    for record in overdue_records.scalars().all():
        overdue_days = (today - record.due_date).days
        fine = overdue_days * 0.5
        total_fine += Decimal(str(fine))
        
        overdue_list.append({
            "id": record.id,
            "book_title": record.book.title,
            "reader_name": record.reader.name,
            "borrow_date": record.borrow_date.isoformat(),
            "due_date": record.due_date.isoformat(),
            "overdue_days": overdue_days,
            "current_fine": fine,
        })
    
    return {
        "total_overdue_count": len(overdue_list),
        "total_fine_amount": total_fine,
        "overdue_list": overdue_list,
    }


@router.get("/trending")
async def get_trending_books(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Book.id, Book.title, func.count(BorrowRecord.id).label("borrow_count"))
        .select_from(Book)
        .join(BorrowRecord, BorrowRecord.book_id == Book.id)
        .group_by(Book.id)
        .order_by(func.count(BorrowRecord.id).desc())
        .limit(10)
    )
    
    trending = []
    for row in result.fetchall():
        trending.append({
            "id": row[0],
            "title": row[1],
            "borrow_count": row[2] if row[2] else 0,
        })
    
    return {"trending": trending}
