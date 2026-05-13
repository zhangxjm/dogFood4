from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional, List
from models import VALID_STATUSES, PLAN_STATUS_ACTIVE

class StudyPlanBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = PLAN_STATUS_ACTIVE

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if v is None:
            return PLAN_STATUS_ACTIVE
        if v not in VALID_STATUSES:
            raise ValueError(f'Status must be one of: {VALID_STATUSES}')
        return v

class StudyPlanCreate(StudyPlanBase):
    pass

class StudyPlanUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if v is None:
            return None
        if v not in VALID_STATUSES:
            raise ValueError(f'Status must be one of: {VALID_STATUSES}')
        return v

class StudyPlanResponse(StudyPlanBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StudyPlanWithStats(StudyPlanResponse):
    total_check_ins: int

class CheckInBase(BaseModel):
    notes: Optional[str] = None

class CheckInCreate(CheckInBase):
    plan_id: int
    check_in_date: date

class CheckInUpdate(CheckInBase):
    pass

class CheckInResponse(CheckInBase):
    id: int
    plan_id: int
    check_in_date: date
    created_at: datetime

    class Config:
        from_attributes = True

class CalendarDayResponse(BaseModel):
    date: date
    has_check_in: bool
    check_in_ids: List[int] = []
