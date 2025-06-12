#!/usr/bin/env python3
"""
Script para popular o banco de dados com dados iniciais (seeds).
"""
import sys
import os
from datetime import datetime, timezone, timedelta
from uuid import uuid4

# Adiciona o diretório raiz ao path para importar os módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from sqlalchemy import create_engine
from app.core.config import settings
from app.models.user import UserModel, UserRoleModel, user_roles
from app.schemas.user import UserRole
from app.utils.security import get_password_hash


def create_roles(db: Session):
    """Cria os roles básicos do sistema."""
    print("Criando roles...")
    
    roles_to_create = [
        UserRole.ADMIN,
        UserRole.USER,
        UserRole.MANAGER,
        UserRole.ANALYST
    ]
    
    for role in roles_to_create:
        # Verifica se o role já existe
        existing_role = db.query(UserRoleModel).filter(UserRoleModel.role == role).first()
        if not existing_role:
            role_model = UserRoleModel(role=role)
            db.add(role_model)
            print(f"  - Role '{role.value}' criado")
        else:
            print(f"  - Role '{role.value}' já existe")
    
    db.commit()


def create_admin_user(db: Session):
    """Cria um usuário administrador padrão."""
    print("Criando usuário administrador...")
    
    admin_email = "admin@betmapeas.com"
    admin_password = "Admin123!@#"
    
    # Verifica se já existe um usuário admin
    existing_admin = db.query(UserModel).filter(UserModel.email == admin_email).first()
    if existing_admin:
        print(f"  - Usuário admin '{admin_email}' já existe")
        return existing_admin
    
    # Cria o usuário admin
    admin_user = UserModel(
        id=uuid4(),
        email=admin_email,
        first_name="Administrador",
        last_name="Sistema",
        hashed_password=get_password_hash(admin_password),
        is_active=True,
        is_verified=True,
        is_superuser=True,
        trial_expires_at=datetime.now(timezone.utc) + timedelta(days=365),  # 1 ano de trial
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        date_joined=datetime.now(timezone.utc)
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    # Adiciona o role ADMIN ao usuário
    admin_role = db.query(UserRoleModel).filter(UserRoleModel.role == UserRole.ADMIN).first()
    if admin_role:
        # Usa SQL direto para inserir na tabela de associação
        db.execute(
            user_roles.insert().values(
                user_id=admin_user.id,
                role=UserRole.ADMIN
            )
        )
        db.commit()
    
    print(f"  - Usuário admin criado: {admin_email}")
    print(f"  - Senha: {admin_password}")
    print("  - IMPORTANTE: Altere a senha após o primeiro login!")
    
    return admin_user


def create_test_user(db: Session):
    """Cria um usuário de teste padrão."""
    print("Criando usuário de teste...")
    
    test_email = "test@betmapeas.com"
    test_password = "Test123!@#"
    
    # Verifica se já existe um usuário de teste
    existing_test = db.query(UserModel).filter(UserModel.email == test_email).first()
    if existing_test:
        print(f"  - Usuário de teste '{test_email}' já existe")
        return existing_test
    
    # Cria o usuário de teste
    test_user = UserModel(
        id=uuid4(),
        email=test_email,
        first_name="Usuário",
        last_name="Teste",
        hashed_password=get_password_hash(test_password),
        is_active=True,
        is_verified=True,
        is_superuser=False,
        trial_expires_at=datetime.now(timezone.utc) + timedelta(days=30),  # 30 dias de trial
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        date_joined=datetime.now(timezone.utc)
    )
    
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    # Adiciona o role USER ao usuário
    user_role = db.query(UserRoleModel).filter(UserRoleModel.role == UserRole.USER).first()
    if user_role:
        # Usa SQL direto para inserir na tabela de associação
        db.execute(
            user_roles.insert().values(
                user_id=test_user.id,
                role=UserRole.USER
            )
        )
        db.commit()
    
    print(f"  - Usuário de teste criado: {test_email}")
    print(f"  - Senha: {test_password}")
    
    return test_user


def main():
    """Função principal para executar os seeds."""
    print("=== Iniciando seeding do banco de dados ===")
    
    # Cria engine síncrona - força usar 'db' como servidor
    db_server = "db"  # Força o uso do nome do serviço Docker
    DATABASE_URL = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{db_server}/{settings.POSTGRES_DB}"
    print(f"Conectando ao banco: {DATABASE_URL}")
    sync_engine = create_engine(DATABASE_URL)
    
    # Cria as tabelas se não existirem
    # Base.metadata.create_all(bind=sync_engine)  # Não precisa criar as tabelas, já foram criadas pelas migrações
    
    # Cria uma sessão do banco de dados
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)
    db = SessionLocal()
    
    try:
        # Cria os roles
        create_roles(db)
        
        # Cria usuário administrador
        create_admin_user(db)
        
        # Cria usuário de teste
        create_test_user(db)
        
        print("\n=== Seeding concluído com sucesso! ===")
        print("\nCredenciais criadas:")
        print("Admin: admin@betmapeas.com / Admin123!@#")
        print("Teste: test@betmapeas.com / Test123!@#")
        print("\nIMPORTANTE: Altere as senhas padrão após o primeiro login!")
        
    except Exception as e:
        print(f"Erro durante o seeding: {str(e)}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()