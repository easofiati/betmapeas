from app.utils.security import get_password_hash
from app.db.database import SessionLocal
from app.models.user import User as UserModel

def update_admin_password():
    db = SessionLocal()
    try:
        # Busca o usuário admin
        admin = db.query(UserModel).filter(UserModel.email == "admin@example.com").first()
        if not admin:
            print("Usuário admin não encontrado")
            return
        
        # Gera um novo hash para a senha "admin"
        new_hash = get_password_hash("admin")
        
        # Atualiza a senha
        admin.hashed_password = new_hash
        db.commit()
        print(f"Senha do admin atualizada com sucesso! Novo hash: {new_hash}")
    except Exception as e:
        print(f"Erro ao atualizar a senha do admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_admin_password()
