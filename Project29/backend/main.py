from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import plans, checkins
from models import StudyPlan, CheckIn

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Study Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plans.router)
app.include_router(checkins.router)

@app.get("/")
def root():
    return {"message": "Study Tracker API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
