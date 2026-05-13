from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    grade = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    students = relationship("Student", back_populates="class_info")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    student_no = Column(String(20), unique=True, index=True, nullable=False)
    gender = Column(String(10), nullable=False)
    age = Column(Integer)
    class_id = Column(Integer, ForeignKey("classes.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    class_info = relationship("Class", back_populates="students")
    scores = relationship("Score", back_populates="student")


class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject = Column(String(50), nullable=False)
    score_value = Column(Float, nullable=False)
    exam_date = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="scores")
