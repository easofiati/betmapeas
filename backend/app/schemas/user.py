from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List, Dict, Any
from uuid import UUID

from pydantic import (
    BaseModel, 
    EmailStr, 
    Field, 
    field_serializer, 
    validator,
    ConfigDict,
    model_validator
)

class UserRole(str, Enum):
    """Enumeração para os papéis de usuário no sistema"""
    ADMIN = "admin"
    USER = "user"
    MANAGER = "manager"
    ANALYST = "analyst"

class UserBase(BaseModel):
    """Modelo base para usuário, contendo campos comuns a todos os modelos de usuário"""
    email: EmailStr = Field(..., description="Endereço de email do usuário (único)")
    
    # Informações básicas
    first_name: Optional[str] = Field(None, max_length=50, description="Nome do usuário")
    last_name: Optional[str] = Field(None, max_length=100, description="Sobrenome do usuário")
    
    # Configurações e status
    is_active: bool = Field(True, description="Indica se a conta do usuário está ativa")
    is_verified: bool = Field(False, description="Indica se o email do usuário foi verificado")
    is_superuser: bool = Field(False, description="Indica se o usuário tem privilégios de superusuário")
    
    # Metadados
    last_login: Optional[datetime] = Field(None, description="Data e hora do último login")
    date_joined: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), 
                                 description="Data e hora de registro do usuário")
    
    # Validação de email
    @validator('email')
    def email_must_be_lowercase(cls, v):
        return v.lower()
    
    @property
    def full_name(self) -> str:
        """Retorna o nome completo do usuário"""
        return f"{self.first_name or ''} {self.last_name or ''}".strip() or self.email.split('@')[0]
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
        use_enum_values = True

class UserCreate(UserBase):
    """Modelo para criação de um novo usuário"""
    password: str = Field(..., min_length=8, max_length=100, 
                         description="Senha do usuário (mínimo de 8 caracteres)")
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("A senha deve ter pelo menos 8 caracteres")
        if not any(c.isupper() for c in v):
            raise ValueError("A senha deve conter pelo menos uma letra maiúscula")
        if not any(c.islower() for c in v):
            raise ValueError("A senha deve conter pelo menos uma letra minúscula")
        if not any(c.isdigit() for c in v):
            raise ValueError("A senha deve conter pelo menos um número")
        return v

class UserUpdate(BaseModel):
    """Modelo para atualização de um usuário existente"""
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    password: Optional[str] = None
    
    @validator('password')
    def password_strength(cls, v):
        if v is not None:
            if len(v) < 8:
                raise ValueError("A senha deve ter pelo menos 8 caracteres")
            if not any(c.isupper() for c in v):
                raise ValueError("A senha deve conter pelo menos uma letra maiúscula")
            if not any(c.islower() for c in v):
                raise ValueError("A senha deve conter pelo menos uma letra minúscula")
            if not any(c.isdigit() for c in v):
                raise ValueError("A senha deve conter pelo menos um número")
        return v

class UserInDBBase(UserBase):
    """Modelo base para usuário no banco de dados"""
    id: UUID = Field(..., description="ID único do usuário no sistema")
    hashed_password: str = Field(..., description="Hash da senha do usuário")
    created_at: datetime = Field(..., description="Data e hora de criação do registro")
    updated_at: datetime = Field(..., description="Data e hora da última atualização")
    trial_expires_at: Optional[datetime] = Field(None, description="Data e hora de expiração do período de trial")
    
    # Relacionamentos (opcional, pode ser carregado sob demanda)
    roles: List[UserRole] = Field(default_factory=lambda: [UserRole.USER], 
                                description="Papéis/permissões do usuário")
    
    # Configuração do modelo
    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }
    )
    
    @field_serializer('id')
    def serialize_id(self, id: UUID, _info) -> str:
        return str(id)
    
    @field_serializer('roles')
    def serialize_roles(self, roles: List[UserRole], _info) -> List[str]:
        return [role.value for role in roles]

class User(UserInDBBase):
    """Modelo para retornar dados do usuário (sem informações sensíveis)"""
    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }
    )

class UserInDB(UserInDBBase):
    """Modelo completo do usuário no banco de dados (inclui campos sensíveis)"""
    pass

class UserLogin(BaseModel):
    """Modelo para autenticação de usuário"""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """Modelo de resposta para operações de usuário"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class UserListResponse(BaseModel):
    """Modelo de resposta para listagem de usuários"""
    total: int
    items: List[User]
    page: int
    size: int
    pages: int
