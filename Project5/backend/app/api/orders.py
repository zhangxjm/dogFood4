from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional
from datetime import datetime
import uuid
from ..database import get_db
from ..models.models import Order, Product, User, OrderStatus
from ..schemas.schemas import OrderCreate, OrderResponse
from .deps import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])


def generate_order_no():
    return f"ORD{uuid.uuid4().hex[:16].upper()}"


@router.post("", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    product_stmt = select(Product).where(Product.id == order_data.product_id)
    product = await db.scalar(product_stmt)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )

    if product.seller_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能购买自己的商品"
        )

    if product.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="商品已售出或已预定"
        )

    order = Order(
        order_no=generate_order_no(),
        product_id=order_data.product_id,
        buyer_id=current_user.id,
        seller_id=product.seller_id,
        price=product.price,
        pickup_location=order_data.pickup_location,
        pickup_time=order_data.pickup_time,
        note=order_data.note,
        status=OrderStatus.PENDING
    )

    product.status = "reserved"
    db.add(order)
    await db.commit()
    await db.refresh(order)

    return OrderResponse(
        id=order.id,
        order_no=order.order_no,
        product_id=order.product_id,
        buyer_id=order.buyer_id,
        seller_id=order.seller_id,
        price=order.price,
        status=order.status,
        pickup_location=order.pickup_location,
        pickup_time=order.pickup_time,
        note=order.note,
        created_at=order.created_at,
        product=ProductResponse(
            id=product.id,
            title=product.title,
            description=product.description,
            price=product.price,
            original_price=product.original_price,
            category=product.category,
            condition=product.condition,
            campus=product.campus,
            images=product.images,
            status=product.status,
            seller_id=product.seller_id,
            view_count=product.view_count,
            favorite_count=product.favorite_count,
            created_at=product.created_at
        )
    )


@router.get("")
async def list_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    role: str = Query("buyer", description="buyer或seller"),
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    if role == "buyer":
        user_condition = Order.buyer_id == current_user.id
    else:
        user_condition = Order.seller_id == current_user.id

    conditions = [user_condition]
    if status:
        conditions.append(Order.status == status)

    count_stmt = select(func.count(Order.id)).where(and_(*conditions))
    total = await db.scalar(count_stmt)

    stmt = select(Order).where(and_(*conditions)).order_by(Order.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    orders = result.scalars().all()

    items = []
    for order in orders:
        product_stmt = select(Product).where(Product.id == order.product_id)
        product = await db.scalar(product_stmt)
        items.append({
            "id": order.id,
            "order_no": order.order_no,
            "product_id": order.product_id,
            "buyer_id": order.buyer_id,
            "seller_id": order.seller_id,
            "price": order.price,
            "status": order.status,
            "pickup_location": order.pickup_location,
            "pickup_time": order.pickup_time,
            "note": order.note,
            "created_at": order.created_at,
            "product": ProductResponse.model_validate(product) if product else None
        })

    return {"total": total, "items": items}


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Order).where(Order.id == order_id)
    order = await db.scalar(stmt)

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在"
        )

    if order.buyer_id != current_user.id and order.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权查看"
        )

    product_stmt = select(Product).where(Product.id == order.product_id)
    product = await db.scalar(product_stmt)

    return OrderResponse(
        id=order.id,
        order_no=order.order_no,
        product_id=order.product_id,
        buyer_id=order.buyer_id,
        seller_id=order.seller_id,
        price=order.price,
        status=order.status,
        pickup_location=order.pickup_location,
        pickup_time=order.pickup_time,
        note=order.note,
        created_at=order.created_at,
        product=ProductResponse.model_validate(product) if product else None
    )


@router.post("/{order_id}/pay")
async def pay_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Order).where(Order.id == order_id)
    order = await db.scalar(stmt)

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在"
        )

    if order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权操作"
        )

    if order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="订单状态不允许支付"
        )

    order.status = OrderStatus.PAID
    await db.commit()
    return {"message": "支付成功", "status": order.status}


@router.post("/{order_id}/confirm")
async def confirm_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Order).where(Order.id == order_id)
    order = await db.scalar(stmt)

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在"
        )

    if order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权操作"
        )

    if order.status not in [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="订单状态不允许确认"
        )

    order.status = OrderStatus.COMPLETED

    product_stmt = select(Product).where(Product.id == order.product_id)
    product = await db.scalar(product_stmt)
    if product:
        product.status = "sold"

    await db.commit()
    return {"message": "确认收货成功", "status": order.status}


@router.post("/{order_id}/cancel")
async def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Order).where(Order.id == order_id)
    order = await db.scalar(stmt)

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在"
        )

    if order.buyer_id != current_user.id and order.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权操作"
        )

    if order.status not in [OrderStatus.PENDING, OrderStatus.PAID]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="订单状态不允许取消"
        )

    order.status = OrderStatus.CANCELLED

    product_stmt = select(Product).where(Product.id == order.product_id)
    product = await db.scalar(product_stmt)
    if product:
        product.status = "available"

    await db.commit()
    return {"message": "订单已取消", "status": order.status}
