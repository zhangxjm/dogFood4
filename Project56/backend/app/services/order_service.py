from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timedelta
from app.models import Order
from app.schemas import OrderCreate, OrderUpdate


class OrderService:
    @staticmethod
    def get_next_order_number(db: Session) -> int:
        today_start = datetime.combine(date.today(), datetime.min.time())
        today_end = today_start + timedelta(days=1)
        
        last_order = db.query(Order).filter(
            Order.created_at >= today_start,
            Order.created_at < today_end
        ).order_by(Order.order_number.desc()).first()
        
        if last_order:
            return last_order.order_number + 1
        return 1

    @staticmethod
    def create_order(db: Session, order: OrderCreate) -> Order:
        order_number = OrderService.get_next_order_number(db)
        db_order = Order(
            order_number=order_number,
            customer_name=order.customer_name,
            items=order.items,
            total_amount=order.total_amount,
            status="pending",
            is_called=False
        )
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order

    @staticmethod
    def get_orders(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_pending_orders(db: Session):
        return db.query(Order).filter(Order.status == "pending").order_by(Order.created_at).all()

    @staticmethod
    def get_order_by_id(db: Session, order_id: int):
        return db.query(Order).filter(Order.id == order_id).first()

    @staticmethod
    def get_order_by_number(db: Session, order_number: int):
        return db.query(Order).filter(Order.order_number == order_number).first()

    @staticmethod
    def update_order(db: Session, order_id: int, order_update: OrderUpdate):
        db_order = OrderService.get_order_by_id(db, order_id)
        if db_order:
            for key, value in order_update.model_dump(exclude_unset=True).items():
                setattr(db_order, key, value)
            db.commit()
            db.refresh(db_order)
        return db_order

    @staticmethod
    def get_today_orders(db: Session):
        today_start = datetime.combine(date.today(), datetime.min.time())
        today_end = today_start + timedelta(days=1)
        return db.query(Order).filter(
            Order.created_at >= today_start,
            Order.created_at < today_end
        ).all()

    @staticmethod
    def get_today_statistics(db: Session):
        today_start = datetime.combine(date.today(), datetime.min.time())
        today_end = today_start + timedelta(days=1)
        orders = db.query(Order).filter(
            Order.created_at >= today_start,
            Order.created_at < today_end
        ).all()
        
        total_orders = len(orders)
        total_amount = sum(order.total_amount for order in orders)
        completed_orders = len([o for o in orders if o.status == "completed"])
        pending_orders = len([o for o in orders if o.status == "pending"])
        
        return {
            "total_orders": total_orders,
            "total_amount": total_amount,
            "completed_orders": completed_orders,
            "pending_orders": pending_orders
        }
