from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import calendar
from database import get_db
from models import CheckIn, StudyPlan
from schemas import CheckInCreate, CheckInUpdate, CheckInResponse, CalendarDayResponse

router = APIRouter(prefix="/api/checkins", tags=["check_ins"])

@router.post("", response_model=CheckInResponse)
def create_check_in(checkin: CheckInCreate, db: Session = Depends(get_db)):
    plan = db.query(StudyPlan).filter(StudyPlan.id == checkin.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")
    
    existing = db.query(CheckIn).filter(
        CheckIn.plan_id == checkin.plan_id,
        CheckIn.check_in_date == checkin.check_in_date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already checked in for this date")
    
    db_checkin = CheckIn(
        plan_id=checkin.plan_id,
        check_in_date=checkin.check_in_date,
        notes=checkin.notes
    )
    db.add(db_checkin)
    db.commit()
    db.refresh(db_checkin)
    return db_checkin

@router.get("/plan/{plan_id}", response_model=List[CheckInResponse])
def get_check_ins(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")
    
    checkins = db.query(CheckIn).filter(
        CheckIn.plan_id == plan_id
    ).order_by(CheckIn.check_in_date.desc()).all()
    return checkins

@router.get("/date/{checkin_date}", response_model=List[CheckInResponse])
def get_check_ins_by_date(checkin_date: date, db: Session = Depends(get_db)):
    checkins = db.query(CheckIn).filter(
        CheckIn.check_in_date == checkin_date
    ).order_by(CheckIn.created_at.desc()).all()
    return checkins

@router.get("/calendar/{year}/{month}", response_model=List[CalendarDayResponse])
def get_calendar(
    year: int,
    month: int,
    plan_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Invalid month")
    if year < 2000 or year > 2100:
        raise HTTPException(status_code=400, detail="Invalid year")
    
    _, num_days = calendar.monthrange(year, month)
    days = []
    
    for day in range(1, num_days + 1):
        current_date = date(year, month, day)
        query = db.query(CheckIn).filter(CheckIn.check_in_date == current_date)
        if plan_id:
            query = query.filter(CheckIn.plan_id == plan_id)
        
        checkins = query.all()
        days.append(CalendarDayResponse(
            date=current_date,
            has_check_in=len(checkins) > 0,
            check_in_ids=[c.id for c in checkins]
        ))
    
    return days

@router.put("/{checkin_id}", response_model=CheckInResponse)
def update_check_in(checkin_id: int, checkin_update: CheckInUpdate, db: Session = Depends(get_db)):
    db_checkin = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    if not db_checkin:
        raise HTTPException(status_code=404, detail="Check-in not found")
    
    if checkin_update.notes is not None:
        db_checkin.notes = checkin_update.notes
    
    db.commit()
    db.refresh(db_checkin)
    return db_checkin

@router.delete("/{checkin_id}")
def delete_check_in(checkin_id: int, db: Session = Depends(get_db)):
    db_checkin = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    if not db_checkin:
        raise HTTPException(status_code=404, detail="Check-in not found")
    db.delete(db_checkin)
    db.commit()
    return {"message": "Check-in deleted successfully"}
