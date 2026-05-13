from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from database import engine, get_db, Base
import models
import schemas

Base.metadata.create_all(bind=engine)

app = FastAPI(title="班级学生管理系统")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "班级学生管理系统 API 运行中"}


@app.get("/api/classes", response_model=List[schemas.ClassResponse])
def get_classes(db: Session = Depends(get_db)):
    classes = db.query(models.Class).all()
    return classes


@app.post("/api/classes", response_model=schemas.ClassResponse)
def create_class(class_data: schemas.ClassCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Class).filter(models.Class.name == class_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="班级名称已存在")
    db_class = models.Class(**class_data.dict())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class


@app.delete("/api/classes/{class_id}")
def delete_class(class_id: int, db: Session = Depends(get_db)):
    db_class = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="班级不存在")
    students_count = db.query(models.Student).filter(models.Student.class_id == class_id).count()
    if students_count > 0:
        raise HTTPException(status_code=400, detail="该班级还有学生，无法删除")
    db.delete(db_class)
    db.commit()
    return {"message": "删除成功"}


@app.get("/api/students", response_model=List[schemas.StudentResponse])
def get_students(class_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Student)
    if class_id:
        query = query.filter(models.Student.class_id == class_id)
    students = query.all()
    return students


@app.get("/api/students/{student_id}", response_model=schemas.StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="学生不存在")
    return student


@app.post("/api/students", response_model=schemas.StudentResponse)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Student).filter(models.Student.student_no == student.student_no).first()
    if existing:
        raise HTTPException(status_code=400, detail="学号已存在")
    db_student = models.Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


@app.put("/api/students/{student_id}", response_model=schemas.StudentResponse)
def update_student(student_id: int, student_data: schemas.StudentUpdate, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="学生不存在")
    update_data = student_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_student, key, value)
    db.commit()
    db.refresh(db_student)
    return db_student


@app.delete("/api/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="学生不存在")
    db.query(models.Score).filter(models.Score.student_id == student_id).delete()
    db.delete(db_student)
    db.commit()
    return {"message": "删除成功"}


@app.get("/api/scores", response_model=List[schemas.ScoreResponse])
def get_scores(student_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Score)
    if student_id:
        query = query.filter(models.Score.student_id == student_id)
    scores = query.all()
    return scores


@app.post("/api/scores", response_model=schemas.ScoreResponse)
def create_score(score: schemas.ScoreCreate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == score.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="学生不存在")
    db_score = models.Score(**score.dict())
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score


@app.delete("/api/scores/{score_id}")
def delete_score(score_id: int, db: Session = Depends(get_db)):
    db_score = db.query(models.Score).filter(models.Score.id == score_id).first()
    if not db_score:
        raise HTTPException(status_code=404, detail="成绩不存在")
    db.delete(db_score)
    db.commit()
    return {"message": "删除成功"}
