from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
import logging
import json
import time
from typing import Annotated, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.database import get_db, engine
from app.models.user import UserModel
from app.routers import auth, users
from app.core.config import settings

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            'level': record.levelname,
            'timestamp': self.formatTime(record, self.datefmt),
            'message': record.getMessage(),
            'name': record.name,
        }
        return json.dumps(log_record)


def create_app() -> FastAPI:
    # Configuração do logging
    logging.basicConfig(level=logging.INFO, handlers=[logging.StreamHandler()])
    logger = logging.getLogger("betmapeas")
    for handler in logger.handlers:
        handler.setFormatter(JsonFormatter())
    
    # Criação do aplicativo FastAPI
    app = FastAPI(
        title="BetMapEAS API",
        version="1.0.0",
        description="API para o sistema de gerenciamento de apostas BetMapEAS",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json"
    )
    
    # Configuração do CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Middleware para log de requisições
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        
        # Processa a requisição
        response = await call_next(request)
        
        # Calcula o tempo de processamento
        process_time = (time.time() - start_time) * 1000
        
        # Registra o log
        logger.info(
            f"{request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms"
        )
        
        return response
    
    # Inclui os roteadores
    app.include_router(auth.router, prefix="/api")
    app.include_router(users.router, prefix="/api")
    
    # Rota de health check
    @app.get("/api/health")
    async def health_check():
        try:
            # Testa a conexão com o banco de dados
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return {
                "status": "ok",
                "database": "connected",
                "version": app.version,
                "environment": settings.ENVIRONMENT
            }
        except Exception as e:
            logger.error(f"Database connection error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Database connection error: {str(e)}"
            )
    
    # Rota raiz
    @app.get("/")
    async def root():
        return {
            "message": "Bem-vindo à API do BetMapEAS",
            "version": app.version,
            "docs": "/api/docs",
            "environment": settings.ENVIRONMENT
        }
    
    logger.info("Backend iniciado com logging estruturado em JSON.")
    return app


# Cria a instância do aplicativo
app = create_app()

# Ponto de entrada para execução direta
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
