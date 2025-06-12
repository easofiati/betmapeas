from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import get_current_user as get_current_user_core
from app.models.user import UserModel

# Este arquivo é mantido para compatibilidade com código existente
# A implementação real foi movida para core/security.py

# O token URL deve corresponder ao configurado no roteador de autenticação
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> UserModel:
    """
    Obtém o usuário atual a partir do token JWT.
    Esta é uma camada de compatibilidade que delega para a implementação em core/security.py
    """
    return await get_current_user_core(token, db) 