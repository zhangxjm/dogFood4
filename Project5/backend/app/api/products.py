from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional
from ..database import get_db
from ..models.models import Product, User, Favorite
from ..schemas.schemas import ProductCreate, ProductResponse, ProductListResponse
from .deps import get_current_user, get_current_user_optional
import json

router = APIRouter(prefix="/products", tags=["products"])


def product_to_dict(product: Product):
    return {
        "id": product.id,
        "title": product.title,
        "description": product.description,
        "price": product.price,
        "original_price": product.original_price,
        "category": product.category,
        "condition": product.condition,
        "campus": product.campus,
        "college": product.college,
        "building": product.building,
        "images": product.images,
        "status": product.status,
        "seller_id": product.seller_id,
        "view_count": product.view_count,
        "favorite_count": product.favorite_count,
        "created_at": product.created_at,
        "seller": None
    }


def user_to_dict(user: User):
    if not user:
        return None
    return {
        "id": user.id,
        "username": user.username,
        "nickname": user.nickname,
        "phone": user.phone,
        "email": user.email,
        "school": user.school,
        "avatar": user.avatar,
        "role": user.role,
        "is_verified": user.is_verified,
        "verification_status": user.verification_status,
        "created_at": user.created_at
    }


@router.get("", response_model=ProductListResponse)
async def list_products(
    db: AsyncSession = Depends(get_db),
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    campus: Optional[str] = None,
    college: Optional[str] = None,
    building: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[str] = "available",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    conditions = []
    if status:
        conditions.append(Product.status == status)
    if keyword:
        conditions.append(or_(
            Product.title.contains(keyword),
            Product.description.contains(keyword)
        ))
    if category:
        conditions.append(Product.category == category)
    if campus:
        conditions.append(Product.campus == campus)
    if college:
        conditions.append(Product.college == college)
    if building:
        conditions.append(Product.building == building)
    if min_price is not None:
        conditions.append(Product.price >= min_price)
    if max_price is not None:
        conditions.append(Product.price <= max_price)

    count_stmt = select(func.count(Product.id))
    if conditions:
        count_stmt = count_stmt.where(and_(*conditions))
    total = await db.scalar(count_stmt)

    stmt = select(Product).order_by(Product.created_at.desc())
    if conditions:
        stmt = stmt.where(and_(*conditions))
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    products = result.scalars().all()

    items = [product_to_dict(p) for p in products]
    return ProductListResponse(total=total, items=items)


@router.post("", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    product = Product(
        title=product_data.title,
        description=product_data.description,
        price=product_data.price,
        original_price=product_data.original_price,
        category=product_data.category,
        condition=product_data.condition,
        campus=product_data.campus,
        college=product_data.college,
        building=product_data.building,
        seller_id=current_user.id,
        images=json.dumps(product_data.images, ensure_ascii=False) if product_data.images else None,
        status="available"
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product_to_dict(product)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    stmt = select(Product).where(Product.id == product_id)
    product = await db.scalar(stmt)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )
    if current_user and current_user.id != product.seller_id:
        product.view_count += 1
        await db.commit()
        await db.refresh(product)

    seller_stmt = select(User).where(User.id == product.seller_id)
    seller = await db.scalar(seller_stmt)

    result = product_to_dict(product)
    result["seller"] = user_to_dict(seller)
    return result


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Product).where(Product.id == product_id)
    product = await db.scalar(stmt)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )
    if product.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权修改"
        )
    for key, value in product_data.items():
        if key == "images":
            value = json.dumps(value, ensure_ascii=False) if value else None
        if hasattr(product, key) and key not in ["id", "seller_id", "view_count", "favorite_count"]:
            setattr(product, key, value)
    await db.commit()
    await db.refresh(product)
    return product_to_dict(product)


@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Product).where(Product.id == product_id)
    product = await db.scalar(stmt)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )
    if product.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权删除"
        )
    await db.delete(product)
    await db.commit()
    return {"message": "删除成功"}


@router.post("/{product_id}/favorite")
async def toggle_favorite(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt_product = select(Product).where(Product.id == product_id)
    product = await db.scalar(stmt_product)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )

    stmt = select(Favorite).where(
        and_(Favorite.user_id == current_user.id, Favorite.product_id == product_id)
    )
    favorite = await db.scalar(stmt)

    if favorite:
        await db.delete(favorite)
        product.favorite_count = max(0, product.favorite_count - 1)
        await db.commit()
        return {"favorited": False}
    else:
        new_favorite = Favorite(user_id=current_user.id, product_id=product_id)
        db.add(new_favorite)
        product.favorite_count += 1
        await db.commit()
        return {"favorited": True}


@router.get("/mine", response_model=ProductListResponse)
async def list_my_products(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    conditions = [Product.seller_id == current_user.id]
    if status:
        conditions.append(Product.status == status)

    count_stmt = select(func.count(Product.id)).where(and_(*conditions))
    total = await db.scalar(count_stmt)

    stmt = select(Product).where(and_(*conditions)).order_by(Product.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    products = result.scalars().all()

    items = [product_to_dict(p) for p in products]
    return ProductListResponse(total=total, items=items)


@router.get("/favorites/list")
async def list_favorites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    count_stmt = select(func.count(Favorite.id)).where(Favorite.user_id == current_user.id)
    total = await db.scalar(count_stmt)

    stmt = select(Favorite).where(Favorite.user_id == current_user.id).order_by(Favorite.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    favorites = result.scalars().all()

    items = []
    for fav in favorites:
        product_stmt = select(Product).where(Product.id == fav.product_id)
        product = await db.scalar(product_stmt)
        if product:
            items.append({
                "id": fav.id,
                "product_id": fav.product_id,
                "created_at": fav.created_at,
                "product": product_to_dict(product)
            })

    return {"total": total, "items": items}
