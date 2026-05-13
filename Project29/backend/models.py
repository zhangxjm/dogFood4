from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

PLAN_STATUS_ACTIVE = "active"
PLAN_STATUS_COMPLETED = "completed"
PLAN_STATUS_PAUSED = "paused"

VALID_STATUSES = [PLAN_STATUS_ACTIVE, PLAN_STATUS_COMPLETED, PLAN_STATUS_PAUSED]

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(20), default=PLAN_STATUS_ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    check_ins = relationship("CheckIn", back_populates="plan", cascade="all, delete-orphan")

class CheckIn(Base):
    __tablename__ = "check_ins"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("study_plans.id", ondelete="CASCADE"), nullable=False)
    check_in_date = Column(Date, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    plan = relationship("StudyPlan", back_populates="check_ins")
