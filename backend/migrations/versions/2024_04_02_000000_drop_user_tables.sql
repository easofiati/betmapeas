-- Migração para reverter a criação das tabelas de usuários e papéis

-- Remover gatilhos
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_user_roles_info_updated_at ON public.user_roles_info;

-- Remover função auxiliar
DROP FUNCTION IF EXISTS update_modified_column();

-- Remover índices
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_is_active;
DROP INDEX IF EXISTS idx_user_roles_user_id;
DROP INDEX IF EXISTS idx_user_roles_role;

-- Remover tabelas na ordem correta (devido a restrições de chave estrangeira)
DROP TABLE IF EXISTS public.user_roles;
DROP TABLE IF EXISTS public.user_roles_info;
DROP TABLE IF EXISTS public.users;

-- Remover tipo ENUM
DROP TYPE IF EXISTS user_role;
