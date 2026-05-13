from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct, and_, case
from typing import Optional, List, Dict, Any
from ..database import get_db
from ..models.models import Product, User
from ..api.products import product_to_dict, user_to_dict
from ..api.deps import get_current_user, get_current_user_optional

router = APIRouter(prefix="/campus", tags=["campus"])

CAMPUS_ZONES = {
    "清华大学": {
        "colleges": [
            {"name": "计算机科学与技术系", "buildings": ["东主楼", "FIT楼", "罗姆楼"]},
            {"name": "软件学院", "buildings": ["FIT楼", "东主楼"]},
            {"name": "电子工程系", "buildings": ["罗姆楼", "东主楼"]},
            {"name": "自动化系", "buildings": ["主楼", "FIT楼"]},
            {"name": "机械工程系", "buildings": ["李兆基大楼"]},
            {"name": "经济管理学院", "buildings": ["舜德楼", "伟伦楼"]},
            {"name": "法学院", "buildings": ["明理楼"]},
            {"name": "新闻与传播学院", "buildings": ["宏盟楼"]},
            {"name": "建筑学院", "buildings": ["王泽生楼", "建筑馆"]},
            {"name": "医学院", "buildings": ["医学科学楼"]},
        ],
        "dormitories": [
            "紫荆公寓1号楼", "紫荆公寓2号楼", "紫荆公寓3号楼", "紫荆公寓4号楼",
            "紫荆公寓5号楼", "紫荆公寓6号楼", "紫荆公寓7号楼", "紫荆公寓8号楼",
            "紫荆公寓9号楼", "紫荆公寓10号楼", "紫荆公寓11号楼", "紫荆公寓12号楼",
            "紫荆公寓13号楼", "紫荆公寓14号楼", "紫荆公寓15号楼", "紫荆公寓16号楼",
            "南区1号楼", "南区2号楼", "南区3号楼", "南区4号楼", "南区5号楼",
            "北区学生公寓", "研究生公寓"
        ]
    },
    "北京大学": {
        "colleges": [
            {"name": "数学科学学院", "buildings": ["理科一号楼"]},
            {"name": "物理学院", "buildings": ["物理楼", "逸夫楼"]},
            {"name": "化学与分子工程学院", "buildings": ["化学楼"]},
            {"name": "生命科学学院", "buildings": ["金光生命科学楼"]},
            {"name": "计算机科学技术系", "buildings": ["理科一号楼", "计算中心"]},
            {"name": "信息科学技术学院", "buildings": ["理科一号楼", "计算中心"]},
            {"name": "光华管理学院", "buildings": ["光华楼"]},
            {"name": "法学院", "buildings": ["凯原楼"]},
            {"name": "外国语学院", "buildings": ["外院楼"]},
            {"name": "哲学系", "buildings": ["李兆基人文楼"]},
        ],
        "dormitories": [
            "勺园1号楼", "勺园2号楼", "勺园3号楼", "勺园4号楼", "勺园5号楼",
            "勺园6号楼", "勺园7号楼", "勺园8号楼", "勺园9号楼",
            "36楼", "37楼", "38楼", "39楼", "40楼", "41楼", "42楼",
            "43楼", "44楼", "45楼", "46楼", "47楼", "48楼", "49楼",
            "畅春新园1号楼", "畅春新园2号楼", "畅春新园3号楼", "畅春新园4号楼",
            "万柳公寓"
        ]
    },
    "复旦大学": {
        "colleges": [
            {"name": "计算机科学技术学院", "buildings": ["光华楼", "计算机楼"]},
            {"name": "软件学院", "buildings": ["计算机楼"]},
            {"name": "新闻学院", "buildings": ["光华楼"]},
            {"name": "经济学院", "buildings": ["光华楼"]},
            {"name": "管理学院", "buildings": ["史带楼"]},
            {"name": "国际关系与公共事务学院", "buildings": ["光华楼"]},
            {"name": "化学系", "buildings": ["光华楼"]},
            {"name": "物理学系", "buildings": ["光华楼"]},
            {"name": "生命科学学院", "buildings": ["生科楼"]},
            {"name": "数学科学学院", "buildings": ["光华楼"]},
        ],
        "dormitories": [
            "邯郸校区北区", "邯郸校区南区", "邯郸校区东区", "邯郸校区本部",
            "枫林校区", "张江校区", "江湾校区"
        ]
    },
    "上海交通大学": {
        "colleges": [
            {"name": "电子信息与电气工程学院", "buildings": ["电院群楼", "电信群楼"]},
            {"name": "计算机科学与工程系", "buildings": ["电院群楼"]},
            {"name": "机械与动力工程学院", "buildings": ["机动楼"]},
            {"name": "材料科学与工程学院", "buildings": ["材料楼"]},
            {"name": "安泰经济与管理学院", "buildings": ["安泰楼"]},
            {"name": "凯原法学院", "buildings": ["法学楼"]},
            {"name": "农业与生物学院", "buildings": ["农科楼"]},
            {"name": "生命科学技术学院", "buildings": ["生科楼"]},
            {"name": "化学化工学院", "buildings": ["化院楼"]},
            {"name": "船舶海洋与建筑工程学院", "buildings": ["船建楼"]},
        ],
        "dormitories": [
            "东1宿舍", "东2宿舍", "东3宿舍", "东4宿舍", "东5宿舍",
            "东6宿舍", "东7宿舍", "东8宿舍",
            "西1宿舍", "西2宿舍", "西3宿舍", "西4宿舍",
            "南1宿舍", "南2宿舍", "南3宿舍", "南4宿舍", "南5宿舍", "南6宿舍",
            "北1宿舍", "北2宿舍", "北3宿舍", "北4宿舍", "北5宿舍",
            "研究生宿舍"
        ]
    },
    "浙江大学": {
        "colleges": [
            {"name": "计算机科学与技术学院", "buildings": ["计算机学院楼", "紫金港校区"]},
            {"name": "软件学院", "buildings": ["软件楼"]},
            {"name": "电气工程学院", "buildings": ["电机楼", "紫金港校区"]},
            {"name": "机械工程学院", "buildings": ["教7楼"]},
            {"name": "材料科学与工程学院", "buildings": ["材料楼"]},
            {"name": "建筑工程学院", "buildings": ["安中大楼"]},
            {"name": "经济学院", "buildings": ["经院楼"]},
            {"name": "管理学院", "buildings": ["管理楼"]},
            {"name": "医学院", "buildings": ["医学院楼"]},
            {"name": "药学院", "buildings": ["药学院楼"]},
        ],
        "dormitories": [
            "紫金港校区紫云学园", "紫金港校区碧峰学园", "紫金港校区蓝田学园",
            "紫金港校区丹青学园", "紫金港校区云峰学园", "紫金港校区启真学园",
            "玉泉校区1舍", "玉泉校区2舍", "玉泉校区3舍", "玉泉校区4舍",
            "玉泉校区5舍", "玉泉校区6舍", "玉泉校区7舍", "玉泉校区8舍",
            "西溪校区", "华家池校区", "之江校区", "海宁国际校区"
        ]
    },
    "南京大学": {
        "colleges": [
            {"name": "计算机科学与技术系", "buildings": ["计算机楼"]},
            {"name": "软件学院", "buildings": ["软件学院大楼"]},
            {"name": "物理系", "buildings": ["物理楼"]},
            {"name": "化学化工学院", "buildings": ["化学楼"]},
            {"name": "天文与空间科学学院", "buildings": ["天文楼"]},
            {"name": "商学院", "buildings": ["安中楼"]},
            {"name": "法学院", "buildings": ["法学楼"]},
            {"name": "文学院", "buildings": ["文科楼"]},
            {"name": "历史学院", "buildings": ["文科楼"]},
            {"name": "哲学系", "buildings": ["哲学楼"]},
        ],
        "dormitories": [
            "仙林校区1-10栋", "仙林校区11-20栋", "仙林校区21-30栋",
            "仙林校区31-40栋", "仙林校区研究生公寓",
            "鼓楼校区北园1舍", "鼓楼校区北园2舍", "鼓楼校区北园3舍",
            "鼓楼校区北园4舍", "鼓楼校区北园5舍", "鼓楼校区南园"
        ]
    }
}

ALL_CAMPUSES = list(CAMPUS_ZONES.keys())


def compute_location_score(
    user_school: Optional[str],
    user_college: Optional[str],
    user_building: Optional[str],
    user_location: Optional[str],
    product_campus: Optional[str],
    product_college: Optional[str],
    product_building: Optional[str]
) -> int:
    score = 0
    if user_school and product_campus:
        if user_school == product_campus:
            score += 50
            if user_college and product_college:
                if user_college == product_college:
                    score += 30
                    if user_building and product_building:
                        if user_building == product_building:
                            score += 20
                        elif product_building in (user_building or ""):
                            score += 10
                elif user_college in product_college or product_college in user_college:
                    score += 10
        elif product_campus in user_school or user_school in product_campus:
            score += 10
    if user_location and product_building:
        if product_building in user_location:
            score += 15
    return score


@router.get("/zones")
async def get_campus_zones(
    campus: Optional[str] = None
):
    if campus:
        return CAMPUS_ZONES.get(campus, {"colleges": [], "dormitories": []})
    return {
        "campuses": ALL_CAMPUSES,
        "zones": CAMPUS_ZONES
    }


@router.get("/zones/colleges")
async def get_colleges(
    campus: Optional[str] = None
):
    if not campus:
        result = {}
        for c, data in CAMPUS_ZONES.items():
            result[c] = [col["name"] for col in data["colleges"]]
        return result
    zone = CAMPUS_ZONES.get(campus)
    if not zone:
        return []
    return [col["name"] for col in zone["colleges"]]


@router.get("/zones/buildings")
async def get_buildings(
    campus: Optional[str] = None,
    college: Optional[str] = None
):
    if not campus:
        return []
    zone = CAMPUS_ZONES.get(campus)
    if not zone:
        return []
    if college:
        for col in zone["colleges"]:
            if col["name"] == college:
                return col["buildings"]
        return []
    buildings = set()
    for col in zone["colleges"]:
        buildings.update(col["buildings"])
    buildings.update(zone["dormitories"])
    return list(buildings)


@router.get("/zones/dormitories")
async def get_dormitories(
    campus: Optional[str] = None
):
    if not campus:
        result = {}
        for c, data in CAMPUS_ZONES.items():
            result[c] = data["dormitories"]
        return result
    zone = CAMPUS_ZONES.get(campus)
    if not zone:
        return []
    return zone["dormitories"]


@router.get("/recommendations")
async def get_smart_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50)
):
    if not current_user:
        stmt = select(Product).where(
            Product.status == "available"
        ).order_by(
            Product.view_count.desc(),
            Product.favorite_count.desc(),
            Product.created_at.desc()
        ).offset((page - 1) * page_size).limit(page_size)

        count_stmt = select(func.count(Product.id)).where(Product.status == "available")
        total = await db.scalar(count_stmt)
        result = await db.execute(stmt)
        products = result.scalars().all()
        items = [product_to_dict(p) for p in products]
        return {
            "total": total,
            "items": items,
            "recommendation_type": "hot",
            "reason": "未登录，展示热门商品"
        }

    user_school = current_user.school
    user_college = current_user.college
    user_building = current_user.building
    user_location = current_user.location

    stmt = select(Product).where(Product.status == "available")
    result = await db.execute(stmt)
    all_products = result.scalars().all()

    scored_products = []
    for product in all_products:
        score = compute_location_score(
            user_school,
            user_college,
            user_building,
            user_location,
            product.campus,
            product.college,
            product.building
        )
        score += min(product.view_count, 50)
        score += min(product.favorite_count * 5, 30)
        scored_products.append((score, product))

    scored_products.sort(key=lambda x: x[0], reverse=True)

    total = len(scored_products)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = scored_products[start:end]

    items = []
    for score, product in paginated:
        item = product_to_dict(product)
        seller_stmt = select(User).where(User.id == product.seller_id)
        seller = await db.scalar(seller_stmt)
        item["seller"] = user_to_dict(seller)
        item["match_score"] = score
        item["match_reasons"] = []

        if user_school and product.campus == user_school:
            item["match_reasons"].append(f"同校：{product.campus}")
            if user_college and product.college == user_college:
                item["match_reasons"].append(f"同学院：{product.college}")
                if user_building and product.building == user_building:
                    item["match_reasons"].append(f"同楼栋：{product.building}")
        items.append(item)

    reason_parts = []
    if user_school:
        reason_parts.append(f"学校：{user_school}")
    if user_college:
        reason_parts.append(f"学院：{user_college}")
    if user_building:
        reason_parts.append(f"楼栋：{user_building}")

    return {
        "total": total,
        "items": items,
        "recommendation_type": "smart",
        "reason": "基于位置智能推荐" if reason_parts else "综合推荐",
        "user_location": {
            "school": user_school,
            "college": user_college,
            "building": user_building,
            "location": user_location
        }
    }


@router.get("/products/by-zone")
async def get_products_by_zone(
    db: AsyncSession = Depends(get_db),
    campus: Optional[str] = None,
    college: Optional[str] = None,
    building: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    conditions = [Product.status == "available"]

    if campus:
        conditions.append(Product.campus == campus)
    if college:
        conditions.append(Product.college == college)
    if building:
        conditions.append(Product.building == building)

    count_stmt = select(func.count(Product.id)).where(and_(*conditions))
    total = await db.scalar(count_stmt)

    stmt = select(Product).where(and_(*conditions)).order_by(
        Product.created_at.desc()
    ).offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    products = result.scalars().all()

    items = [product_to_dict(p) for p in products]
    for item in items:
        seller_stmt = select(User).where(User.id == item["seller_id"])
        seller = await db.scalar(seller_stmt)
        item["seller"] = user_to_dict(seller)

    return {
        "total": total,
        "items": items,
        "zone": {
            "campus": campus,
            "college": college,
            "building": building
        }
    }


@router.get("/zones/stats")
async def get_zone_statistics(
    db: AsyncSession = Depends(get_db)
):
    campus_stmt = select(
        Product.campus,
        func.count(Product.id).label("product_count")
    ).where(
        Product.status == "available"
    ).group_by(Product.campus)

    campus_result = await db.execute(campus_stmt)
    campus_stats = []
    for row in campus_result:
        if row.campus:
            campus_stats.append({
                "campus": row.campus,
                "product_count": row.product_count
            })

    college_stmt = select(
        Product.campus,
        Product.college,
        func.count(Product.id).label("product_count")
    ).where(
        and_(
            Product.status == "available",
            Product.college.isnot(None)
        )
    ).group_by(Product.campus, Product.college)

    college_result = await db.execute(college_stmt)
    college_stats = []
    for row in college_result:
        college_stats.append({
            "campus": row.campus,
            "college": row.college,
            "product_count": row.product_count
        })

    return {
        "campus_stats": campus_stats,
        "college_stats": college_stats
    }
