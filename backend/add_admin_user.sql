-- Script para adicionar um usuário administrador
-- A senha é 'admin' (hash bcrypt)

INSERT INTO usuarios (
    id, 
    nome, 
    email, 
    senha_hash, 
    eh_ativo, 
    eh_verificado, 
    eh_admin, 
    timezone, 
    moeda, 
    idioma
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Administrador',
    'admin@example.com',
    '$2b$12$UF7ztK0nR8Bwd3/hNCpdau.aur0AVCAIQcTCytBEVrvah9lP1d9r6',
    true,
    true,
    true,
    'America/Sao_Paulo',
    'BRL',
    'pt-BR'
)
ON CONFLICT (email) DO NOTHING;
