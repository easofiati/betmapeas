from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, validator

class TokenBase(BaseModel):
    """Modelo base para tokens JWT"""
    token_type: str = "bearer"
    expires_in: int
    issued_at: datetime = Field(default_factory=datetime.utcnow)

class Token(TokenBase):
    """Modelo para resposta de autenticação com tokens de acesso e atualização"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 3600,
                "issued_at": "2023-01-01T00:00:00Z"
            }
        }

class TokenPayload(BaseModel):
    """Modelo para o payload do token JWT"""
    sub: Optional[str] = None  # Subject (geralmente o email do usuário)
    exp: Optional[datetime] = None  # Expiration time
    iat: Optional[datetime] = None  # Issued at
    iss: Optional[str] = None  # Issuer
    aud: Optional[str] = None  # Audience
    type: Optional[str] = "access"  # Tipo de token (access, refresh, etc.)
    user_id: Optional[str] = None  # ID do usuário
    is_active: Optional[bool] = None  # Status do usuário
    
    @validator('exp', 'iat', pre=True)
    def parse_datetime(cls, value):
        """Converte timestamps em objetos datetime"""
        if isinstance(value, int):
            return datetime.utcfromtimestamp(value)
        return value

class TokenData(BaseModel):
    """Modelo para dados do token"""
    username: Optional[str] = None
    user_id: Optional[str] = None
    is_active: bool = False
    scopes: list[str] = []

class TokenBlacklistBase(BaseModel):
    """Modelo base para tokens na lista negra"""
    token: str
    expires_at: datetime
    user_id: Optional[str] = None
    reason: Optional[str] = None

class TokenBlacklistCreate(TokenBlacklistBase):
    pass

class TokenBlacklistInDB(TokenBlacklistBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
