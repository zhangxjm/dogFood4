from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://library:library123@localhost:5432/library_db"
    SECRET_KEY: str = "library_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    BORROW_DAYS: int = 30
    FINE_PER_DAY: float = 0.5

    class Config:
        env_file = ".env"


settings = Settings()
