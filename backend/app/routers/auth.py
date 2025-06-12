from datetime import timedelta, datetime, timezone
from typing import Annotated, Dict, Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.security.utils import get_authorization_scheme_param
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import JWTError

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_token,
    get_current_user,
    get_current_active_user,
    security
)
from app.utils.security import verify_password, get_password_hash
from app.utils.email import send_verification_email, generate_verification_token, send_password_reset_email, generate_reset_token
from app.db.database import get_db
from app.models.user import UserModel
from app.schemas.token import Token, TokenPayload
from app.schemas.user import User, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

@router.post("/login", response_model=TokenResponse)
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Autentica um usuário e retorna tokens de acesso e atualização.
    """
    # Verifica se o usuário existe e a senha está correta
    user = db.query(UserModel).filter(UserModel.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verifica se o usuário está ativo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo"
        )
    
    # Cria os tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email,
        expires_delta=access_token_expires,
        user_id=str(user.id),
        is_active=user.is_active
    )
    
    refresh_token = create_refresh_token(
        subject=user.email,
        user_id=str(user.id)
    )
    
    # Configura o cookie de refresh token (opcional)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60 * 2,  # 2x o tempo do access token
        secure=not settings.DEBUG,  # Apenas HTTPS em produção
        samesite="lax"
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": int(access_token_expires.total_seconds())
    }

@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Gera um novo token de acesso a partir de um refresh token.
    """
    # Tenta obter o refresh token do cabeçalho ou do cookie
    refresh_token = None
    
    # Verifica o cabeçalho Authorization
    authorization: str = request.headers.get("Authorization")
    if authorization:
        scheme, param = get_authorization_scheme_param(authorization)
        if scheme.lower() == "bearer":
            refresh_token = param
    
    # Se não encontrou no cabeçalho, tenta obter do cookie
    if not refresh_token:
        refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token não fornecido"
        )
    
    try:
        # Verifica se o token está na lista negra (logout)
        # if await is_token_revoked(refresh_token):
        #     raise HTTPException(status_code=400, detail="Refresh token revogado")
        
        # Decodifica o refresh token
        payload = verify_token(refresh_token)
        
        # Verifica se é um refresh token
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de token inválido"
            )
        
        # Obtém o email do usuário do token
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido: sub (subject) não encontrado"
            )
        
        # Busca o usuário no banco de dados
        user = db.query(UserModel).filter(UserModel.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Verifica se o usuário está ativo
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário inativo"
            )
        
        # Gera um novo token de acesso
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            subject=user.email,
            expires_delta=access_token_expires,
            user_id=str(user.id),
            is_active=user.is_active
        )
        
        # Opcional: Gera um novo refresh token (rotaciona o token)
        # Se preferir não rotacionar, remova as linhas abaixo
        new_refresh_token = create_refresh_token(
            subject=user.email,
            user_id=str(user.id)
        )
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": int(access_token_expires.total_seconds())
        }
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de atualização inválido ou expirado"
        )

@router.post("/logout")
async def logout(
    response: Response,
    current_user: UserModel = Depends(get_current_user)
):
    """
    Realiza o logout do usuário, invalidando o token.
    Em uma implementação real, você adicionaria o token a uma lista negra.
    """
    # Em uma implementação real, você adicionaria o token a uma lista negra
    # token = request.state.token
    # await revoke_token(token)
    
    # Remove o cookie de refresh token
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax"
    )
    
    return {"message": "Logout realizado com sucesso"}

@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registra um novo usuário no sistema.
    """
    # Verifica se o usuário já existe
    existing_user = db.query(UserModel).filter(UserModel.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário com este email já existe"
        )
    
    # Cria o hash da senha
    hashed_password = get_password_hash(user_data.password)
    
    # Define data de expiração do trial (30 dias)
    trial_expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    
    # Cria o novo usuário
    db_user = UserModel(
        id=uuid.uuid4(),
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        hashed_password=hashed_password,
        is_active=True,
        is_verified=False,  # Usuário deve verificar o email
        is_superuser=False,
        trial_expires_at=trial_expires_at,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        date_joined=datetime.now(timezone.utc)
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Gera token de verificação e envia email
        verification_token = generate_verification_token()
        db_user.verification_token = verification_token
        db.commit()
        
        # Envia email de verificação
        email_sent = send_verification_email(db_user.email, verification_token)
        if not email_sent:
            print(f"Falha ao enviar email de verificação para {db_user.email}")
        
        return UserResponse(
            success=True,
            message="Usuário registrado com sucesso. Verifique seu email para ativar a conta.",
            data={"user_id": str(db_user.id), "email": db_user.email}
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor ao criar usuário"
        )

@router.post("/verify-email")
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Verifica o email do usuário usando o token enviado por email.
    """
    user = db.query(UserModel).filter(UserModel.verification_token == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de verificação inválido ou expirado"
        )
    
    user.is_verified = True
    user.verification_token = None  # Remove o token após uso
    user.updated_at = datetime.now(timezone.utc)
    
    try:
        db.commit()
        return {"message": "Email verificado com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/resend-verification")
async def resend_verification_email(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Reenvia o email de verificação para um usuário.
    """
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        # Não revelamos se o email existe ou não por segurança
        return {"message": "Se o email existir, um novo email de verificação será enviado"}
    
    if user.is_verified:
        return {"message": "Este email já foi verificado"}
    
    # Gera novo token e envia email
    verification_token = generate_verification_token()
    user.verification_token = verification_token
    user.updated_at = datetime.now(timezone.utc)
    
    try:
        db.commit()
        
        # Envia email de verificação
        email_sent = send_verification_email(user.email, verification_token)
        if not email_sent:
            print(f"Falha ao enviar email de verificação para {user.email}")
        
        return {"message": "Se o email existir, um novo email de verificação será enviado"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/forgot-password")
async def forgot_password(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Solicita o reset de senha enviando um email com token.
    """
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        # Não revelamos se o email existe ou não por segurança
        return {"message": "Se o email existir, um link de recuperação será enviado"}
    
    # Gera token de reset com expiração de 1 hora
    reset_token = generate_reset_token()
    reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    user.password_reset_token = reset_token
    user.password_reset_token_expires_at = reset_expires
    user.updated_at = datetime.now(timezone.utc)
    
    try:
        db.commit()
        
        # Envia email de reset
        email_sent = send_password_reset_email(user.email, reset_token)
        if not email_sent:
            print(f"Falha ao enviar email de reset para {user.email}")
        
        return {"message": "Se o email existir, um link de recuperação será enviado"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    """
    Redefine a senha do usuário usando o token enviado por email.
    """
    user = db.query(UserModel).filter(
        UserModel.password_reset_token == token,
        UserModel.password_reset_token_expires_at > datetime.now(timezone.utc)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de reset inválido ou expirado"
        )
    
    # Validação básica da senha
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha deve ter pelo menos 8 caracteres"
        )
    
    # Atualiza a senha
    user.hashed_password = get_password_hash(new_password)
    user.password_reset_token = None
    user.password_reset_token_expires_at = None
    user.updated_at = datetime.now(timezone.utc)
    
    try:
        db.commit()
        return {"message": "Senha redefinida com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/me", response_model=User)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    Retorna os dados do usuário atualmente autenticado.
    """
    return current_user
