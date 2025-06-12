-- Migração para criar as tabelas de usuários e papéis

-- Criação do tipo ENUM para os papéis de usuário
CREATE TYPE user_role AS ENUM ('admin', 'user', 'manager', 'analyst');

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_superuser BOOLEAN NOT NULL DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT users_email_key UNIQUE (email)
);

-- Comentários para a tabela de usuários
COMMENT ON TABLE public.users IS 'Tabela de usuários do sistema';
COMMENT ON COLUMN public.users.id IS 'Identificador único do usuário';
COMMENT ON COLUMN public.users.email IS 'Endereço de e-mail do usuário (único)';
COMMENT ON COLUMN public.users.hashed_password IS 'Hash da senha do usuário';
COMMENT ON COLUMN public.users.first_name IS 'Primeiro nome do usuário';
COMMENT ON COLUMN public.users.last_name IS 'Sobrenome do usuário';
COMMENT ON COLUMN public.users.is_active IS 'Indica se a conta do usuário está ativa';
COMMENT ON COLUMN public.users.is_verified IS 'Indica se o e-mail do usuário foi verificado';
COMMENT ON COLUMN public.users.is_superuser IS 'Indica se o usuário tem privilégios de superusuário';
COMMENT ON COLUMN public.users.last_login IS 'Data e hora do último login do usuário';
COMMENT ON COLUMN public.users.date_joined IS 'Data e hora de registro do usuário';
COMMENT ON COLUMN public.users.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN public.users.updated_at IS 'Data e hora da última atualização do registro';

-- Tabela de associação entre usuários e papéis
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
);

-- Comentários para a tabela de associação
COMMENT ON TABLE public.user_roles IS 'Tabela de associação para relacionamento muitos-para-muitos entre usuários e papéis';
COMMENT ON COLUMN public.user_roles.user_id IS 'ID do usuário';
COMMENT ON COLUMN public.user_roles.role IS 'Papel do usuário';
COMMENT ON COLUMN public.user_roles.created_at IS 'Data e hora de criação do registro';

-- Tabela de informações adicionais sobre os papéis
CREATE TABLE IF NOT EXISTS public.user_roles_info (
    role user_role PRIMARY KEY,
    description TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Comentários para a tabela de informações dos papéis
COMMENT ON TABLE public.user_roles_info IS 'Informações adicionais sobre os papéis de usuário';
COMMENT ON COLUMN public.user_roles_info.role IS 'Nome do papel';
COMMENT ON COLUMN public.user_roles_info.description IS 'Descrição detalhada do papel';
COMMENT ON COLUMN public.user_roles_info.permissions IS 'Lista de permissões concedidas a este papel';
COMMENT ON COLUMN public.user_roles_info.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN public.user_roles_info.updated_at IS 'Data e hora da última atualização do registro';

-- Índices para melhorar o desempenho
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users (is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles (role);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gatilhos para atualizar automaticamente o campo updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_roles_info_updated_at
BEFORE UPDATE ON public.user_roles_info
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Inserir papéis padrão, se não existirem
INSERT INTO public.user_roles_info (role, description, permissions)
VALUES 
    ('admin', 'Administrador do sistema', '{"*")}'),
    ('user', 'Usuário padrão', '{"read:profile", "update:own_profile")}'),
    ('manager', 'Gerente', '{"read:all_profiles", "update:some_profiles")}'),
    ('analyst', 'Analista', '{"read:reports", "generate:reports")}')
ON CONFLICT (role) DO NOTHING;
