from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import engine, Base
from .routers import books, readers, borrows, reservations, stats, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="图书馆管理系统",
    description="基于 FastAPI + React + Arco Design 的图书馆管理系统",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router)
app.include_router(readers.router)
app.include_router(borrows.router)
app.include_router(reservations.router)
app.include_router(stats.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {"message": "图书馆管理系统 API 服务运行中"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
