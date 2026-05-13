from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models import Reservation, Book, Reader
from ..schemas import ReservationCreate, Reservation as ReservationSchema

router = APIRouter(prefix="/api/reservations", tags=["reservations"])


@router.get("")
async def get_reservations(
    status: Optional[str] = None,
    reader_id: Optional[int] = None,
    book_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * page_size
    
    count_query = select(func.count(Reservation.id))
    query = select(Reservation).options(
        selectinload(Reservation.book),
        selectinload(Reservation.reader),
    )
    
    if status:
        query = query.where(Reservation.status == status)
        count_query = count_query.where(Reservation.status == status)
    
    if reader_id:
        query = query.where(Reservation.reader_id == reader_id)
        count_query = count_query.where(Reservation.reader_id == reader_id)
    
    if book_id:
        query = query.where(Reservation.book_id == book_id)
        count_query = count_query.where(Reservation.book_id == book_id)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    query = query.order_by(Reservation.created_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(query)
    reservations = result.scalars().all()
    
    return {"total": total, "items": reservations}


@router.post("", response_model=ReservationSchema)
async def create_reservation(reservation: ReservationCreate, db: AsyncSession = Depends(get_db)):
    book_result = await db.execute(select(Book).where(Book.id == reservation.book_id))
    book = book_result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    reader_result = await db.execute(select(Reader).where(Reader.id == reservation.reader_id))
    reader = reader_result.scalar_one_or_none()
    if not reader:
        raise HTTPException(status_code=404, detail="Reader not found")
    
    if book.available_quantity > 0:
        raise HTTPException(status_code=400, detail="Book is available, no need to reserve")
    
    existing = await db.execute(
        select(Reservation).where(
            Reservation.book_id == reservation.book_id,
            Reservation.reader_id == reservation.reader_id,
            Reservation.status == "pending",
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You already have a pending reservation for this book")
    
    reservation_date = datetime.now().date()
    expiry_date = reservation_date + timedelta(days=7)
    
    db_reservation = Reservation(
        book_id=reservation.book_id,
        reader_id=reservation.reader_id,
        reservation_date=reservation_date,
        expiry_date=expiry_date,
        status="pending",
    )
    
    db.add(db_reservation)
    await db.commit()
    await db.refresh(db_reservation)
    
    return db_reservation


@router.post("/{reservation_id}/cancel")
async def cancel_reservation(reservation_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Reservation).where(Reservation.id == reservation_id))
    reservation = result.scalar_one_or_none()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation.status != "pending":
        raise HTTPException(status_code=400, detail="Cannot cancel this reservation")
    
    reservation.status = "cancelled"
    await db.commit()
    
    return {"message": "Reservation cancelled successfully"}


@router.post("/{reservation_id}/complete")
async def complete_reservation(reservation_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Reservation).where(Reservation.id == reservation_id))
    reservation = result.scalar_one_or_none()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation.status != "pending":
        raise HTTPException(status_code=400, detail="Cannot complete this reservation")
    
    reservation.status = "completed"
    await db.commit()
    
    return {"message": "Reservation completed successfully"}
