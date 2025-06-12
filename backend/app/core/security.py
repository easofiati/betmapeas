from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union, Dict

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from fastapi.security.utils import get_authorization_scheme_param
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session
from starlette.status import HTTP_403_FORBIDDEN

from app.core.config import settings
from app.db.database import get_db, get_async_db
from app.models.user import UserModel
from app.schemas.token import TokenData, TokenPayload
from app.schemas.user import User, UserInDB
from app.utils.security import verify_password, get_password_hash

# Configurações de segurança
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)

# Esquema para autenticação via cabeçalho Authorization
security = HTTPBearer()

def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None, **extra_data
) -> str:
    """
    Cria um token JWT de acesso.
    
    Args:
        subject: O assunto do token (geralmente o email do usuário)
        expires_delta: Tempo de expiração do token. Se não fornecido, usa o padrão das configurações.
        **extra_data: Dados adicionais a serem incluídos no token.
    
    Returns:
        str: Token JWT codificado
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.now(timezone.utc),
        "iss": settings.PROJECT_NAME.lower(),
        "aud": settings.PROJECT_NAME.lower(),
        **extra_data
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None, **extra_data
) -> str:
    """
    Cria um token de atualização JWT.
    
    Args:
        subject: O assunto do token (geralmente o email do usuário)
        expires_delta: Tempo de expiração do token. Se não fornecido, usa o dobro do tempo do token de acesso.
        **extra_data: Dados adicionais a serem incluídos no token.
    
    Returns:
        str: Token JWT de atualização codificado
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Por padrão, o refresh token expira no dobro do tempo do access token
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 2
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.now(timezone.utc),
        "iss": settings.PROJECT_NAME.lower(),
        "aud": f"{settings.PROJECT_NAME.lower()}-refresh",
        "type": "refresh",
        **extra_data
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """
    Verifica e decodifica um token JWT.
    
    Args:
        token: O token JWT a ser verificado
        
    Returns:
        Dict[str, Any]: O payload do token decodificado
        
    Raises:
        HTTPException: Se o token for inválido ou expirado
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_aud": False}  # Desativa verificação de audiência para simplificar
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )




async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserModel:
    """
    Obtém o usuário atual a partir do token JWT.
    
    Args:
        request: Objeto de requisição FastAPI
        db: Sessão do banco de dados
        credentials: Credenciais de autenticação do cabeçalho
        
    Returns:
        UserModel: O modelo de usuário autenticado
        
    Raises:
        HTTPException: Se a autenticação falhar
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Credenciais de autenticação ausentes",
        )
    
    token = credentials.credentials
    
    try:
        # Verifica se o token está na lista negra (logout)
        # Você pode implementar uma verificação de cache/banco de dados aqui
        # if await is_token_revoked(token):
        #     raise HTTPException(status_code=400, detail="Token revogado")
        
        # Decodifica o token
        payload = verify_token(token)
        
        # Verifica o tipo de token (access ou refresh)
        token_type = payload.get("type", "access")
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tipo de token inválido"
            )
        
        # Obtém o email do usuário do token
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido: sub (subject) não encontrado",
            )
        
        # Busca o usuário no banco de dados
        user = db.query(UserModel).filter(UserModel.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado",
            )
            
        # Armazena o token na requisição para uso posterior, se necessário
        request.state.token = token
        
        return user
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar as credenciais",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(
    current_user: UserModel = Depends(get_current_user)
) -> UserModel:
    """
    Obtém o usuário ativo atual.
    
    Args:
        current_user: O usuário autenticado
        
    Returns:
        UserModel: O modelo de usuário ativo
        
    Raises:
        HTTPException: Se o usuário estiver inativo
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo"
        )
    return current_user


# Função para verificar permissões (opcional)
async def has_permission(
    required_permissions: list[str],
    current_user: UserModel = Depends(get_current_active_user)
) -> UserModel:
    """
    Verifica se o usuário atual tem as permissões necessárias.
    
    Args:
        required_permissions: Lista de permissões necessárias
        current_user: O usuário autenticado
        
    Returns:
        UserModel: O modelo de usuário se tiver permissão
        
    Raises:
        HTTPException: Se o usuário não tiver permissão
    """
    # Implemente a lógica de verificação de permissões aqui
    # Por exemplo, verificar se o usuário tem uma role específica
    # ou se tem uma permissão específica na tabela de permissões
    
    # Exemplo simples: verificar se o usuário é admin
    if "admin" not in [role.name for role in current_user.roles]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão negada"
        )
    
    return current_user
