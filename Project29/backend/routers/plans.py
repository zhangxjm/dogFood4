from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import StudyPlan
from schemas import (
    StudyPlanCreate,
    StudyPlanUpdate,
    StudyPlanResponse,
    StudyPlanWithStats
)

router = APIRouter(prefix="/api/plans", tags=["study_plans"])

@router.post("", response_model=StudyPlanResponse)
def create_plan(plan: StudyPlanCreate, db: Session = Depends(get_db)):
    db_plan = StudyPlan(
        title=plan.title,
        description=plan.description,
        status=plan.status
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("", response_model=List[StudyPlanWithStats])
def get_plans(db: Session = Depends(get_db)):
    plans = db.query(StudyPlan).order_by(StudyPlan.created_at.desc()).all()
    return [
        StudyPlanWithStats(
            id=p.id,
            title=p.title,
            description=p.description,
            status=p.status,
            created_at=p.created_at,
            updated_at=p.updated_at,
            total_check_ins=len(p.check_ins)
        )
        for p in plans
    ]

@router.get("/{plan_id}", response_model=StudyPlanWithStats)
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")
    return StudyPlanWithStats(
        id=plan.id,
        title=plan.title,
        description=plan.description,
        status=plan.status,
        created_at=plan.created_at,
        updated_at=plan.updated_at,
        total_check_ins=len(plan.check_ins)
    )

@router.put("/{plan_id}", response_model=StudyPlanResponse)
def update_plan(plan_id: int, plan_update: StudyPlanUpdate, db: Session = Depends(get_db)):
    db_plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Study plan not found")
    
    if plan_update.title is not None:
        db_plan.title = plan_update.title
    if plan_update.description is not None:
        db_plan.description = plan_update.description
    if plan_update.status is not None:
        db_plan.status = plan_update.status
    
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.delete("/{plan_id}")
def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    db_plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Study plan not found")
    db.delete(db_plan)
    db.commit()
    return {"message": "Study plan deleted successfully"}
