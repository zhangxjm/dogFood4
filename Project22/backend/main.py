from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

import models
import schemas
import crud
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="外卖小店商家后台 API",
    description="菜品分类、菜品上下架、价格修改、菜品列表管理",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/categories", response_model=List[schemas.CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@app.get("/api/categories/{category_id}", response_model=schemas.CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = crud.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    return category


@app.post("/api/categories", response_model=schemas.CategoryResponse, status_code=201)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    existing = crud.get_category_by_name(db, category.name)
    if existing:
        raise HTTPException(status_code=400, detail="分类名称已存在")
    return crud.create_category(db, category)


@app.put("/api/categories/{category_id}", response_model=schemas.CategoryResponse)
def update_category(category_id: int, category: schemas.CategoryUpdate, db: Session = Depends(get_db)):
    db_category = crud.update_category(db, category_id, category)
    if not db_category:
        raise HTTPException(status_code=404, detail="分类不存在")
    return db_category


@app.delete("/api/categories/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    if not crud.delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="分类不存在")


@app.get("/api/dishes", response_model=List[schemas.DishResponse])
def list_dishes(
    category_id: Optional[int] = Query(None),
    is_available: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    return crud.get_dishes(db, category_id, is_available)


@app.get("/api/dishes/{dish_id}", response_model=schemas.DishDetailResponse)
def get_dish(dish_id: int, db: Session = Depends(get_db)):
    dish = crud.get_dish(db, dish_id)
    if not dish:
        raise HTTPException(status_code=404, detail="菜品不存在")
    return dish


@app.post("/api/dishes", response_model=schemas.DishResponse, status_code=201)
def create_dish(dish: schemas.DishCreate, db: Session = Depends(get_db)):
    category = crud.get_category(db, dish.category_id)
    if not category:
        raise HTTPException(status_code=400, detail="分类不存在")
    return crud.create_dish(db, dish)


@app.put("/api/dishes/{dish_id}", response_model=schemas.DishResponse)
def update_dish(dish_id: int, dish: schemas.DishUpdate, db: Session = Depends(get_db)):
    if dish.category_id:
        category = crud.get_category(db, dish.category_id)
        if not category:
            raise HTTPException(status_code=400, detail="分类不存在")
    db_dish = crud.update_dish(db, dish_id, dish)
    if not db_dish:
        raise HTTPException(status_code=404, detail="菜品不存在")
    return db_dish


@app.delete("/api/dishes/{dish_id}", status_code=204)
def delete_dish(dish_id: int, db: Session = Depends(get_db)):
    if not crud.delete_dish(db, dish_id):
        raise HTTPException(status_code=404, detail="菜品不存在")


@app.get("/")
def root():
    return {"message": "外卖小店商家后台 API", "docs": "/docs"}
