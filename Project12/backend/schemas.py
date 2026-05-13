from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ScoreBase(BaseModel):
    subject: str
    score_value: float
    exam_date: Optional[str] = None


class ScoreCreate(ScoreBase):
    student_id: int


class ScoreResponse(ScoreBase):
    id: int
    student_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ClassBase(BaseModel):
    name: str
    grade: str


class ClassCreate(ClassBase):
    pass


class ClassResponse(ClassBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class StudentBase(BaseModel):
    name: str
    student_no: str
    gender: str
    age: Optional[int] = None
    class_id: Optional[int] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    student_no: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    class_id: Optional[int] = None


class StudentResponse(StudentBase):
    id: int
    created_at: datetime
    scores: List[ScoreResponse] = []
    class_info: Optional[ClassResponse] = None

    class Config:
        from_attributes = True
