from sqlalchemy.orm import Session
from sqlalchemy import desc
import models
import schemas


def get_categories(db: Session):
    return db.query(models.Category).order_by(models.Category.sort_order).all()


def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def get_category_by_name(db: Session, name: str):
    return db.query(models.Category).filter(models.Category.name == name).first()


def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(name=category.name, sort_order=category.sort_order)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category: schemas.CategoryUpdate):
    db_category = get_category(db, category_id)
    if not db_category:
        return None
    update_data = category.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)
    if not db_category:
        return False
    db.delete(db_category)
    db.commit()
    return True


def get_dishes(db: Session, category_id: int = None, is_available: bool = None):
    query = db.query(models.Dish)
    if category_id is not None:
        query = query.filter(models.Dish.category_id == category_id)
    if is_available is not None:
        query = query.filter(models.Dish.is_available == is_available)
    return query.order_by(desc(models.Dish.created_at)).all()


def get_dish(db: Session, dish_id: int):
    return db.query(models.Dish).filter(models.Dish.id == dish_id).first()


def create_dish(db: Session, dish: schemas.DishCreate):
    db_dish = models.Dish(**dish.model_dump())
    db.add(db_dish)
    db.commit()
    db.refresh(db_dish)
    return db_dish


def update_dish(db: Session, dish_id: int, dish: schemas.DishUpdate):
    db_dish = get_dish(db, dish_id)
    if not db_dish:
        return None
    update_data = dish.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_dish, key, value)
    db.commit()
    db.refresh(db_dish)
    return db_dish


def delete_dish(db: Session, dish_id: int):
    db_dish = get_dish(db, dish_id)
    if not db_dish:
        return False
    db.delete(db_dish)
    db.commit()
    return True
