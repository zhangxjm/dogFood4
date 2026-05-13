from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional

from ..database import get_db
from ..models import Reader, BorrowRecord
from ..schemas import ReaderCreate, ReaderUpdate, Reader as ReaderSchema

router = APIRouter(prefix="/api/readers", tags=["readers"])


@router.get("")
async def get_readers(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * page_size
    
    count_query = select(func.count(Reader.id))
    query = select(Reader)
    
    if search:
        search_pattern = f"%{search}%"
        condition = or_(
            Reader.name.ilike(search_pattern),
            Reader.card_number.ilike(search_pattern),
            Reader.phone.ilike(search_pattern),
        )
        query = query.where(condition)
        count_query = count_query.where(condition)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    query = query.offset(offset).limit(page_size)
    result = await db.execute(query)
    readers = result.scalars().all()
    
    return {"total": total, "items": readers}


@router.get("/{reader_id}", response_model=ReaderSchema)
async def get_reader(reader_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Reader).where(Reader.id == reader_id))
    reader = result.scalar_one_or_none()
    if not reader:
        raise HTTPException(status_code=404, detail="Reader not found")
    return reader


@router.get("/card/{card_number}", response_model=ReaderSchema)
async def get_reader_by_card(card_number: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Reader).where(Reader.card_number == card_number))
    reader = result.scalar_one_or_none()
    if not reader:
        raise HTTPException(status_code=404, detail="Reader not found")
    return reader


@router.post("", response_model=ReaderSchema)
async def create_reader(reader: ReaderCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Reader).where(Reader.card_number == reader.card_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Reader with this card number already exists")
    
    db_reader = Reader(**reader.model_dump())
    db.add(db_reader)
    await db.commit()
    await db.refresh(db_reader)
    return db_reader


@router.put("/{reader_id}", response_model=ReaderSchema)
async def update_reader(reader_id: int, reader: ReaderUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Reader).where(Reader.id == reader_id))
    db_reader = result.scalar_one_or_none()
    if not db_reader:
        raise HTTPException(status_code=404, detail="Reader not found")
    
    update_data = reader.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_reader, key, value)
    
    await db.commit()
    await db.refresh(db_reader)
    return db_reader


@router.delete("/{reader_id}")
async def delete_reader(reader_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Reader).where(Reader.id == reader_id))
    reader = result.scalar_one_or_none()
    if not reader:
        raise HTTPException(status_code=404, detail="Reader not found")
    
    borrow_result = await db.execute(
        select(BorrowRecord).where(
            BorrowRecord.reader_id == reader_id,
            BorrowRecord.status == "borrowed",
        )
    )
    if borrow_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Cannot delete reader with active borrows")
    
    await db.delete(reader)
    await db.commit()
    return {"message": "Reader deleted successfully"}
