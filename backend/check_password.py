from app.utils.security import get_password_hash, verify_password

# Hash armazenado no banco de dados
stored_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"

# Senha que estamos testando
test_password = "admin"

# Verifica se a senha está correta
is_valid = verify_password(test_password, stored_hash)
print(f"A senha está correta? {is_valid}")

# Gera um novo hash para a senha "admin"
new_hash = get_password_hash(test_password)
print(f"Novo hash para 'admin': {new_hash}")
print(f"O novo hash é igual ao armazenado? {new_hash == stored_hash}")
