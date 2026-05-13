from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional, List, Dict, Any
from ..database import get_db
from ..models.models import Demand, User, Product, DemandStatus
from ..schemas.schemas import DemandCreate, DemandResponse, DemandListResponse
from .deps import get_current_user, get_current_user_optional
from .products import product_to_dict, user_to_dict

router = APIRouter(prefix="/demands", tags=["demands"])


def demand_to_dict(demand: Demand):
    return {
        "id": demand.id,
        "title": demand.title,
        "description": demand.description,
        "category": demand.category,
        "condition": demand.condition,
        "campus": demand.campus,
        "college": demand.college,
        "building": demand.building,
        "min_price": demand.min_price,
        "max_price": demand.max_price,
        "urgency": demand.urgency,
        "buyer_id": demand.buyer_id,
        "matched_product_id": demand.matched_product_id,
        "status": demand.status,
        "view_count": demand.view_count,
        "created_at": demand.created_at,
        "buyer": None,
        "matched_product": None
    }


def compute_match_score(
    demand: Demand,
    product: Product
) -> tuple[int, List[str]]:
    score = 0
    reasons = []

    if demand.category == product.category:
        score += 40
        reasons.append(f"同分类：{product.category}")
    elif product.category in demand.category or demand.category in product.category:
        score += 20
        reasons.append(f"分类相近：{product.category}")

    if demand.min_price is not None and demand.max_price is not None:
        if demand.min_price <= product.price <= demand.max_price:
            score += 25
            reasons.append(f"价格符合预算：¥{product.price}")
        elif abs(product.price - demand.min_price) < 50:
            score += 10
            reasons.append(f"价格接近预算")
    elif demand.min_price is not None and product.price >= demand.min_price:
        score += 15
        reasons.append(f"价格高于最低预算")
    elif demand.max_price is not None and product.price <= demand.max_price:
        score += 15
        reasons.append(f"价格在预算范围内")

    if demand.condition:
        if product.condition == demand.condition:
            score += 15
            reasons.append(f"成色符合：{product.condition}")

    if demand.campus and product.campus:
        if demand.campus == product.campus:
            score += 30
            reasons.append(f"同校园：{product.campus}")
            if demand.college and product.college:
                if demand.college == product.college:
                    score += 15
                    reasons.append(f"同学院：{product.college}")
                    if demand.building and product.building:
                        if demand.building == product.building:
                            score += 10
                            reasons.append(f"同楼栋：{product.building}")

    score += min(product.view_count, 10)
    score += min(product.favorite_count * 3, 15)

    return score, reasons


@router.get("", response_model=DemandListResponse)
async def list_demands(
    db: AsyncSession = Depends(get_db),
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    campus: Optional[str] = None,
    status: Optional[str] = "open",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    conditions = []
    if status:
        conditions.append(Demand.status == status)
    if keyword:
        conditions.append(or_(
            Demand.title.contains(keyword),
            Demand.description.contains(keyword)
        ))
    if category:
        conditions.append(Demand.category == category)
    if campus:
        conditions.append(Demand.campus == campus)

    count_stmt = select(func.count(Demand.id))
    if conditions:
        count_stmt = count_stmt.where(and_(*conditions))
    total = await db.scalar(count_stmt)

    stmt = select(Demand).order_by(
        case(
            (Demand.urgency == "urgent", 0),
            (Demand.urgency == "normal", 1),
            else_=2
        ),
        Demand.created_at.desc()
    )
    if conditions:
        stmt = stmt.where(and_(*conditions))
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    demands = result.scalars().all()

    items = []
    for demand in demands:
        item = demand_to_dict(demand)
        buyer_stmt = select(User).where(User.id == demand.buyer_id)
        buyer = await db.scalar(buyer_stmt)
        item["buyer"] = user_to_dict(buyer)
        items.append(item)

    return DemandListResponse(total=total, items=items)


@router.post("", response_model=DemandResponse)
async def create_demand(
    demand_data: DemandCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    demand = Demand(
        title=demand_data.title,
        description=demand_data.description,
        category=demand_data.category,
        condition=demand_data.condition,
        campus=demand_data.campus or current_user.school,
        college=demand_data.college or current_user.college,
        building=demand_data.building or current_user.building,
        min_price=demand_data.min_price,
        max_price=demand_data.max_price,
        urgency=demand_data.urgency or "normal",
        buyer_id=current_user.id,
        status=DemandStatus.OPEN
    )
    db.add(demand)
    await db.commit()
    await db.refresh(demand)

    result = demand_to_dict(demand)
    result["buyer"] = user_to_dict(current_user)
    return result


@router.get("/{demand_id}", response_model=DemandResponse)
async def get_demand(
    demand_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    stmt = select(Demand).where(Demand.id == demand_id)
    demand = await db.scalar(stmt)
    if not demand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="求购需求不存在"
        )

    if current_user and current_user.id != demand.buyer_id:
        demand.view_count += 1
        await db.commit()
        await db.refresh(demand)

    result = demand_to_dict(demand)

    buyer_stmt = select(User).where(User.id == demand.buyer_id)
    buyer = await db.scalar(buyer_stmt)
    result["buyer"] = user_to_dict(buyer)

    if demand.matched_product_id:
        product_stmt = select(Product).where(Product.id == demand.matched_product_id)
        product = await db.scalar(product_stmt)
        if product:
            result["matched_product"] = product_to_dict(product)

    return result


@router.get("/{demand_id}/matches")
async def get_demand_matches(
    demand_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Demand).where(Demand.id == demand_id)
    demand = await db.scalar(stmt)
    if not demand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="求购需求不存在"
        )

    if demand.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权查看匹配结果"
        )

    product_conditions = [Product.status == "available"]

    if demand.category:
        product_conditions.append(
            or_(
                Product.category == demand.category,
                Product.category.contains(demand.category),
                demand.category.contains(Product.category)
            )
        )

    if demand.max_price is not None:
        product_conditions.append(Product.price <= demand.max_price + 100)

    product_stmt = select(Product).where(and_(*product_conditions)).order_by(Product.created_at.desc())
    result = await db.execute(product_stmt)
    products = result.scalars().all()

    matches = []
    for product in products:
        score, reasons = compute_match_score(demand, product)
        if score > 0:
            matches.append({
                "product": product_to_dict(product),
                "match_score": score,
                "match_reasons": reasons
            })

    matches.sort(key=lambda x: x["match_score"], reverse=True)

    return {
        "demand": demand_to_dict(demand),
        "matches": matches[:10],
        "total_matches": len(matches)
    }


@router.post("/{demand_id}/match/{product_id}")
async def match_demand(
    demand_id: int,
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    demand_stmt = select(Demand).where(Demand.id == demand_id)
    demand = await db.scalar(demand_stmt)
    if not demand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="求购需求不存在"
        )

    if demand.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权操作此求购需求"
        )

    product_stmt = select(Product).where(Product.id == product_id)
    product = await db.scalar(product_stmt)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )

    if product.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="商品已售出或已预留"
        )

    demand.matched_product_id = product_id
    demand.status = DemandStatus.MATCHED
    await db.commit()
    await db.refresh(demand)

    return {"message": "匹配成功", "demand_id": demand.id, "product_id": product_id}


@router.post("/{demand_id}/close")
async def close_demand(
    demand_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Demand).where(Demand.id == demand_id)
    demand = await db.scalar(stmt)
    if not demand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="求购需求不存在"
        )

    if demand.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权操作此求购需求"
        )

    demand.status = DemandStatus.CLOSED
    await db.commit()
    await db.refresh(demand)

    return {"message": "关闭成功", "demand_id": demand.id}


@router.post("/{demand_id}/cancel")
async def cancel_demand(
    demand_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Demand).where(Demand.id == demand_id)
    demand = await db.scalar(stmt)
    if not demand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="求购需求不存在"
        )

    if demand.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权操作此求购需求"
        )

    demand.status = DemandStatus.CANCELLED
    await db.commit()
    await db.refresh(demand)

    return {"message": "取消成功", "demand_id": demand.id}


@router.get("/mine", response_model=DemandListResponse)
async def list_my_demands(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    conditions = [Demand.buyer_id == current_user.id]
    if status:
        conditions.append(Demand.status == status)

    count_stmt = select(func.count(Demand.id)).where(and_(*conditions))
    total = await db.scalar(count_stmt)

    stmt = select(Demand).where(and_(*conditions)).order_by(
        Demand.created_at.desc()
    ).offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    demands = result.scalars().all()

    items = []
    for demand in demands:
        item = demand_to_dict(demand)
        item["buyer"] = user_to_dict(current_user)

        if demand.matched_product_id:
            product_stmt = select(Product).where(Product.id == demand.matched_product_id)
            product = await db.scalar(product_stmt)
            if product:
                item["matched_product"] = product_to_dict(product)

        items.append(item)

    return DemandListResponse(total=total, items=items)


@router.get("/recommendations/for-products")
async def get_demands_for_product(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50)
):
    product_stmt = select(Product).where(Product.seller_id == current_user.id, Product.status == "available")
    product_result = await db.execute(product_stmt)
    my_products = product_result.scalars().all()

    if not my_products:
        return {
            "my_products": [],
            "demands": [],
            "total": 0
        }

    demand_conditions = [Demand.status == "open"]

    categories = set(p.category for p in my_products)
    campi = set(p.campus for p in my_products if p.campus)

    if categories:
        category_conditions = [Demand.category == c for c in categories]
        demand_conditions.append(or_(*category_conditions))

    if campi:
        campus_conditions = [Demand.campus == c for c in campi]
        demand_conditions.append(or_(*campus_conditions))

    count_stmt = select(func.count(Demand.id)).where(and_(*demand_conditions))
    total = await db.scalar(count_stmt)

    demand_stmt = select(Demand).where(and_(*demand_conditions)).order_by(
        case(
            (Demand.urgency == "urgent", 0),
            (Demand.urgency == "normal", 1),
            else_=2
        ),
        Demand.created_at.desc()
    ).offset((page - 1) * page_size).limit(page_size)

    demand_result = await db.execute(demand_stmt)
    demands = demand_result.scalars().all()

    items = []
    for demand in demands:
        item = demand_to_dict(demand)
        buyer_stmt = select(User).where(User.id == demand.buyer_id)
        buyer = await db.scalar(buyer_stmt)
        item["buyer"] = user_to_dict(buyer)

        for product in my_products:
            score, reasons = compute_match_score(demand, product)
            if score > 0:
                item.setdefault("matched_products", []).append({
                    "product": product_to_dict(product),
                    "match_score": score,
                    "match_reasons": reasons
                })

        items.append(item)

    return {
        "my_products": [product_to_dict(p) for p in my_products],
        "demands": items,
        "total": total
    }
