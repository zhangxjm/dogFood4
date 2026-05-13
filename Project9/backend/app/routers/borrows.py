from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import datetime, timedelta, date

from ..database import get_db
from ..config import settings
from ..models import BorrowRecord, Book, Reader
from ..schemas import BorrowRecordCreate, BorrowRecord as BorrowRecordSchema

router = APIRouter(prefix="/api/borrows", tags=["borrows"])


@router.get("")
async def get_borrow_records(
    status: Optional[str] = None,
    reader_id: Optional[int] = None,
    book_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * page_size
    
    count_query = select(func.count(BorrowRecord.id))
    query = select(BorrowRecord).options(
        selectinload(BorrowRecord.book),
        selectinload(BorrowRecord.reader),
    )
    
    if status:
        query = query.where(BorrowRecord.status == status)
        count_query = count_query.where(BorrowRecord.status == status)
    
    if reader_id:
        query = query.where(BorrowRecord.reader_id == reader_id)
        count_query = count_query.where(BorrowRecord.reader_id == reader_id)
    
    if book_id:
        query = query.where(BorrowRecord.book_id == book_id)
        count_query = count_query.where(BorrowRecord.book_id == book_id)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    query = query.order_by(BorrowRecord.created_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(query)
    records = result.scalars().all()
    
    return {"total": total, "items": records}


@router.post("", response_model=BorrowRecordSchema)
async def create_borrow(record: BorrowRecordCreate, db: AsyncSession = Depends(get_db)):
    book_result = await db.execute(select(Book).where(Book.id == record.book_id))
    book = book_result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book.available_quantity <= 0:
        raise HTTPException(status_code=400, detail="Book not available")
    
    reader_result = await db.execute(select(Reader).where(Reader.id == record.reader_id))
    reader = reader_result.scalar_one_or_none()
    if not reader:
        raise HTTPException(status_code=404, detail="Reader not found")
    
    active_borrows = await db.execute(
        select(func.count(BorrowRecord.id)).where(
            BorrowRecord.reader_id == record.reader_id,
            BorrowRecord.status == "borrowed",
        )
    )
    if active_borrows.scalar_one() >= reader.max_borrow_count:
        raise HTTPException(status_code=400, detail="Reader has reached maximum borrow limit")
    
    borrow_date = datetime.now().date()
    due_date = borrow_date + timedelta(days=settings.BORROW_DAYS)
    
    db_record = BorrowRecord(
        book_id=record.book_id,
        reader_id=record.reader_id,
        borrow_date=borrow_date,
        due_date=due_date,
        status="borrowed",
    )
    
    book.available_quantity -= 1
    
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    
    return db_record


@router.post("/{record_id}/return", response_model=BorrowRecordSchema)
async def return_book(record_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BorrowRecord).options(
            selectinload(BorrowRecord.book),
            selectinload(BorrowRecord.reader),
        ).where(BorrowRecord.id == record_id)
    )
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(status_code=404, detail="Borrow record not found")
    
    if record.status != "borrowed":
        raise HTTPException(status_code=400, detail="Book already returned")
    
    return_date = datetime.now().date()
    record.return_date = return_date
    record.status = "returned"
    
    if return_date > record.due_date:
        overdue_days = (return_date - record.due_date).days
        fine_amount = overdue_days * settings.FINE_PER_DAY
        record.fine_amount = fine_amount
    
    book_result = await db.execute(select(Book).where(Book.id == record.book_id))
    book = book_result.scalar_one()
    book.available_quantity += 1
    
    await db.commit()
    await db.refresh(record)
    
    return record


@router.post("/{record_id}/pay-fine")
async def pay_fine(record_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BorrowRecord).where(BorrowRecord.id == record_id))
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(status_code=404, detail="Borrow record not found")
    
    if record.fine_amount <= 0:
        raise HTTPException(status_code=400, detail="No fine to pay")
    
    if record.fine_paid:
        raise HTTPException(status_code=400, detail="Fine already paid")
    
    record.fine_paid = True
    await db.commit()
    
    return {"message": "Fine paid successfully", "amount": record.fine_amount}


@router.get("/reader/{reader_id}/active")
async def get_reader_active_borrows(reader_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BorrowRecord).options(
            selectinload(BorrowRecord.book),
        ).where(
            BorrowRecord.reader_id == reader_id,
            BorrowRecord.status == "borrowed",
        )
    )
    records = result.scalars().all()
    
    today = datetime.now().date()
    for record in records:
        if today > record.due_date:
            overdue_days = (today - record.due_date).days
            record.current_fine = overdue_days * settings.FINE_PER_DAY
    
    return {"items": records}
