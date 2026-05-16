from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import Order, OrderCreate, OrderUpdate, CallNumber
from app.services.order_service import OrderService
from app.services.websocket_manager import manager

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("/", response_model=Order)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    return OrderService.create_order(db, order)


@router.get("/", response_model=List[Order])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return OrderService.get_orders(db, skip, limit)


@router.get("/pending", response_model=List[Order])
def get_pending_orders(db: Session = Depends(get_db)):
    return OrderService.get_pending_orders(db)


@router.get("/today", response_model=List[Order])
def get_today_orders(db: Session = Depends(get_db)):
    return OrderService.get_today_orders(db)


@router.get("/statistics")
def get_today_statistics(db: Session = Depends(get_db)):
    return OrderService.get_today_statistics(db)


@router.get("/{order_id}", response_model=Order)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = OrderService.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}", response_model=Order)
def update_order(order_id: int, order_update: OrderUpdate, db: Session = Depends(get_db)):
    order = OrderService.update_order(db, order_id, order_update)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/call/{order_number}")
async def call_order(order_number: int, db: Session = Depends(get_db)):
    order = OrderService.get_order_by_number(db, order_number)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order_update = OrderUpdate(is_called=True)
    OrderService.update_order(db, order.id, order_update)
    
    message = {
        "type": "call",
        "order_number": order_number,
        "message": f"请{order.customer_name}顾客，您的{order_number}号订单已准备好！"
    }
    await manager.broadcast(message)
    return {"status": "success", "message": f"已呼叫{order_number}号"}


@router.post("/status/{order_id}/{status}")
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    valid_statuses = ["pending", "preparing", "ready", "completed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    order_update = OrderUpdate(status=status)
    order = OrderService.update_order(db, order_id, order_update)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
