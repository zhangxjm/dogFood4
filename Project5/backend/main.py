from fastapi import FastAPI, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from app.core.config import settings
from app.database import init_db, AsyncSessionLocal
from app.models.models import User, Product, Demand, UserRole, ProductStatus, DemandStatus
from app.core.security import get_password_hash
from app.api.auth import router as auth_router
from app.api.products import router as products_router
from app.api.orders import router as orders_router
from app.api.chat import router as chat_router
from app.api.uploads import router as uploads_router
from app.api.campus import router as campus_router
from app.api.demands import router as demands_router
from app.websockets.chat import chat_websocket_endpoint


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    async with AsyncSessionLocal() as db:
        await seed_initial_data(db)
    yield


async def seed_initial_data(db):
    from sqlalchemy import select

    admin_user = await db.scalar(select(User).where(User.username == "admin"))
    if not admin_user:
        admin = User(
            username="admin",
            password=get_password_hash("123456"),
            nickname="管理员",
            role=UserRole.ADMIN,
            is_verified=True
        )
        db.add(admin)

    student1 = await db.scalar(select(User).where(User.username == "student1"))
    if not student1:
        student1 = User(
            username="student1",
            password=get_password_hash("123456"),
            nickname="学生小明",
            school="清华大学",
            college="计算机科学与技术系",
            student_id="2021001001",
            role=UserRole.STUDENT,
            is_verified=True,
            location="紫荆公寓3号楼",
            building="东主楼"
        )
        db.add(student1)

    student2 = await db.scalar(select(User).where(User.username == "student2"))
    if not student2:
        student2 = User(
            username="student2",
            password=get_password_hash("123456"),
            nickname="学生小红",
            school="清华大学",
            college="软件学院",
            student_id="2021001002",
            role=UserRole.STUDENT,
            is_verified=True,
            location="紫荆公寓5号楼",
            building="FIT楼"
        )
        db.add(student2)

    student3 = await db.scalar(select(User).where(User.username == "student3"))
    if not student3:
        student3 = User(
            username="student3",
            password=get_password_hash("123456"),
            nickname="学生小李",
            school="北京大学",
            college="计算机科学技术系",
            student_id="2021002001",
            role=UserRole.STUDENT,
            is_verified=True,
            location="勺园3号楼",
            building="理科一号楼"
        )
        db.add(student3)

    student4 = await db.scalar(select(User).where(User.username == "student4"))
    if not student4:
        student4 = User(
            username="student4",
            password=get_password_hash("123456"),
            nickname="学生小张",
            school="复旦大学",
            college="计算机科学技术学院",
            student_id="2021003001",
            role=UserRole.STUDENT,
            is_verified=True,
            location="邯郸校区北区",
            building="光华楼"
        )
        db.add(student4)

    await db.commit()

    products_count = await db.scalar(select(Product).limit(1))
    if not products_count:
        sample_products = [
            {
                "title": "九成新 MacBook Pro 2020",
                "description": "自用一年，保护很好，性能流畅，适合编程和设计",
                "price": 6999.00,
                "original_price": 12999.00,
                "category": "数码产品",
                "condition": "九成新",
                "campus": "清华大学",
                "college": "计算机科学与技术系",
                "building": "东主楼",
                "images": '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop"]'
            },
            {
                "title": "考研英语全套资料",
                "description": "英语一全套资料，包括真题、阅读、作文等，已上岸，低价转让",
                "price": 50.00,
                "original_price": 200.00,
                "category": "书籍教材",
                "condition": "全新",
                "campus": "清华大学",
                "college": "软件学院",
                "building": "FIT楼",
                "images": '["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop"]'
            },
            {
                "title": "小米电动滑板车",
                "description": "小米米家电动滑板车，续航30km，代步神器，送充电器",
                "price": 800.00,
                "original_price": 1999.00,
                "category": "交通工具",
                "condition": "八成新",
                "campus": "清华大学",
                "college": "计算机科学与技术系",
                "building": "东主楼",
                "images": '["https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop"]'
            },
            {
                "title": "机械键盘（Cherry青轴）",
                "description": "Cherry MX 青轴，手感超棒，打字游戏两相宜",
                "price": 200.00,
                "original_price": 499.00,
                "category": "数码产品",
                "condition": "九成新",
                "campus": "北京大学",
                "college": "计算机科学技术系",
                "building": "理科一号楼",
                "images": '["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop"]'
            },
            {
                "title": "二手自行车",
                "description": "普通自行车，可正常骑行，适合校园代步",
                "price": 150.00,
                "original_price": 300.00,
                "category": "交通工具",
                "condition": "七成新",
                "campus": "北京大学",
                "college": "计算机科学技术系",
                "building": "理科一号楼",
                "images": '["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=300&fit=crop"]'
            },
            {
                "title": "高等数学辅导书",
                "description": "同济版高数辅导资料，笔记清晰，适合大一新生",
                "price": 20.00,
                "original_price": 45.00,
                "category": "书籍教材",
                "condition": "八成新",
                "campus": "复旦大学",
                "college": "数学科学学院",
                "building": "光华楼",
                "images": '["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop"]'
            },
            {
                "title": "Python编程从入门到实践",
                "description": "经典Python入门书籍，几乎全新，适合零基础学习",
                "price": 35.00,
                "original_price": 89.00,
                "category": "书籍教材",
                "condition": "九成新",
                "campus": "清华大学",
                "college": "计算机科学与技术系",
                "building": "FIT楼",
                "images": '["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop"]'
            },
            {
                "title": "索尼降噪耳机 WH-1000XM4",
                "description": "降噪效果一流，音质出色，考研复习必备神器",
                "price": 1200.00,
                "original_price": 2499.00,
                "category": "数码产品",
                "condition": "九成新",
                "campus": "清华大学",
                "college": "软件学院",
                "building": "FIT楼",
                "images": '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"]'
            },
            {
                "title": "iPad Pro 2021 11寸",
                "description": "128GB WiFi版，带Apple Pencil，适合记笔记、画画",
                "price": 4500.00,
                "original_price": 6199.00,
                "category": "数码产品",
                "condition": "九成新",
                "campus": "清华大学",
                "college": "计算机科学与技术系",
                "building": "东主楼",
                "images": '["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop"]'
            },
            {
                "title": "大学物理教材（张三慧版）",
                "description": "物理学专业必备教材，笔记齐全，附赠习题解答",
                "price": 30.00,
                "original_price": 55.00,
                "category": "书籍教材",
                "condition": "八成新",
                "campus": "清华大学",
                "college": "物理系",
                "building": "物理系楼",
                "images": '["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop"]'
            },
            {
                "title": "折叠自行车",
                "description": "可折叠，方便存放，适合宿舍空间小的同学",
                "price": 300.00,
                "original_price": 800.00,
                "category": "交通工具",
                "condition": "八成新",
                "campus": "北京大学",
                "college": "计算机科学技术系",
                "building": "理科一号楼",
                "images": '["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=300&fit=crop"]'
            },
            {
                "title": "罗技游戏鼠标 G502",
                "description": "编程游戏两相宜，自定义按键多，手感舒适",
                "price": 180.00,
                "original_price": 399.00,
                "category": "数码产品",
                "condition": "九成新",
                "campus": "复旦大学",
                "college": "计算机科学技术学院",
                "building": "计算机楼",
                "images": '["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop"]'
            }
        ]

        student1 = await db.scalar(select(User).where(User.username == "student1"))
        student2 = await db.scalar(select(User).where(User.username == "student2"))
        student3 = await db.scalar(select(User).where(User.username == "student3"))
        student4 = await db.scalar(select(User).where(User.username == "student4"))

        for i, p_data in enumerate(sample_products):
            if i % 4 == 0:
                seller_id = student1.id
            elif i % 4 == 1:
                seller_id = student2.id
            elif i % 4 == 2:
                seller_id = student3.id
            else:
                seller_id = student4.id
            product = Product(
                title=p_data["title"],
                description=p_data["description"],
                price=p_data["price"],
                original_price=p_data["original_price"],
                category=p_data["category"],
                condition=p_data["condition"],
                campus=p_data["campus"],
                college=p_data.get("college"),
                building=p_data.get("building"),
                images=p_data["images"],
                seller_id=seller_id,
                status=ProductStatus.AVAILABLE
            )
            db.add(product)

        await db.commit()

    demands_count = await db.scalar(select(Demand).limit(1))
    if not demands_count:
        sample_demands = [
            {
                "title": "收一台二手笔记本电脑",
                "description": "想收一台用于编程学习的笔记本电脑，Mac或Windows都可以，性能流畅就行",
                "category": "数码产品",
                "condition": "八成新",
                "campus": "清华大学",
                "college": "软件学院",
                "building": "FIT楼",
                "min_price": 2000,
                "max_price": 5000,
                "urgency": "normal"
            },
            {
                "title": "求购考研政治资料",
                "description": "想收一套2025考研政治资料，最好是肖秀荣或腿姐的",
                "category": "书籍教材",
                "condition": "九成新",
                "campus": "清华大学",
                "college": "计算机科学与技术系",
                "building": "东主楼",
                "min_price": 20,
                "max_price": 80,
                "urgency": "urgent"
            },
            {
                "title": "收一辆二手自行车",
                "description": "校园代步用，能骑就行，不要太贵",
                "category": "交通工具",
                "condition": "七成新",
                "campus": "北京大学",
                "college": "计算机科学技术系",
                "building": "理科一号楼",
                "min_price": 100,
                "max_price": 400,
                "urgency": "normal"
            },
            {
                "title": "求购机械键盘",
                "description": "想要一把手感好的机械键盘，青轴或茶轴优先",
                "category": "数码产品",
                "condition": "九成新",
                "campus": "复旦大学",
                "college": "计算机科学技术学院",
                "building": "光华楼",
                "min_price": 100,
                "max_price": 300,
                "urgency": "urgent"
            },
            {
                "title": "收一套四六级备考资料",
                "description": "想收四六级真题和词汇书，准备六级考试",
                "category": "书籍教材",
                "condition": "八成新",
                "campus": "清华大学",
                "college": "软件学院",
                "building": "FIT楼",
                "min_price": 10,
                "max_price": 50,
                "urgency": "normal"
            }
        ]

        student1 = await db.scalar(select(User).where(User.username == "student1"))
        student2 = await db.scalar(select(User).where(User.username == "student2"))
        student3 = await db.scalar(select(User).where(User.username == "student3"))
        student4 = await db.scalar(select(User).where(User.username == "student4"))

        for i, d_data in enumerate(sample_demands):
            if i % 4 == 0:
                buyer_id = student1.id
            elif i % 4 == 1:
                buyer_id = student2.id
            elif i % 4 == 2:
                buyer_id = student3.id
            else:
                buyer_id = student4.id
            demand = Demand(
                title=d_data["title"],
                description=d_data["description"],
                category=d_data["category"],
                condition=d_data["condition"],
                campus=d_data["campus"],
                college=d_data["college"],
                building=d_data["building"],
                min_price=d_data["min_price"],
                max_price=d_data["max_price"],
                urgency=d_data["urgency"],
                buyer_id=buyer_id,
                status=DemandStatus.OPEN
            )
            db.add(demand)

        await db.commit()


app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(uploads_router, prefix="/api")
app.include_router(campus_router, prefix="/api")
app.include_router(demands_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Campus Marketplace API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.websocket("/ws/chat/{conversation_id}")
async def websocket_chat(websocket: WebSocket, conversation_id: int, token: str = Query(...)):
    await chat_websocket_endpoint(websocket, conversation_id, token)
