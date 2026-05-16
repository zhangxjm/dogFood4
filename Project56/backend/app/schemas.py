from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class OrderBase(BaseModel):
    customer_name: str
    items: str
    total_amount: float


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    is_called: Optional[bool] = None


class Order(OrderBase):
    id: int
    order_number: int
    status: str
    is_called: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CallNumber(BaseModel):
    order_number: int
    message: str
