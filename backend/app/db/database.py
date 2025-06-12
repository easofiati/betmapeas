from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker as async_sessionmaker
from typing import Generator, AsyncGenerator
import os

from app.core.config import settings

# Configuração síncrona (SQLAlchemy padrão)
engine = create_engine(
    settings.DATABASE_URI,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

# Sessões síncronas
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Configuração assíncrona (opcional, para uso com async/await)
# Evita a inicialização em ambientes síncronos como o Alembic
async_engine = None
AsyncSessionLocal = None

if os.getenv("ALEMBIC_RUNNING") != "1":
    async_engine = create_async_engine(
        settings.ASYNC_DATABASE_URI,
        echo=settings.DEBUG,
        pool_pre_ping=True
    )
    # Sessões assíncronas
    AsyncSessionLocal = async_sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )

def get_db() -> Generator:
    """
    Obtém uma sessão síncrona do banco de dados.
    Para ser usado em dependências FastAPI.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db() -> AsyncGenerator:
    """
    Obtém uma sessão assíncrona do banco de dados.
    Para ser usado em dependências FastAPI com async/await.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close() 