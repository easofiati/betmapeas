-- =====================================================
-- SCHEMA DO BANCO DE DADOS - BETMAPEAS
-- PostgreSQL - Português do Brasil
-- =====================================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: usuarios
-- =====================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    eh_ativo BOOLEAN DEFAULT true,
    eh_verificado BOOLEAN DEFAULT false,
    eh_admin BOOLEAN DEFAULT false,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    moeda VARCHAR(3) DEFAULT 'BRL',
    idioma VARCHAR(5) DEFAULT 'pt-BR',
    preferencias_notificacao JSONB DEFAULT '{}',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: assinatura_usuarios
-- =====================================================
CREATE TABLE assinatura_usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    plano_id VARCHAR(50) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    eh_ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: categorias
-- =====================================================
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    icone_url VARCHAR(500),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: mercados
-- =====================================================
CREATE TABLE mercados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: tipsters
-- =====================================================
CREATE TABLE tipsters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    site_url VARCHAR(500),
    valor_assinatura_mensal DECIMAL(10,2) DEFAULT 0,
    stake_padrao DECIMAL(10,2) DEFAULT 1.00,
    unidade_base DECIMAL(10,2) DEFAULT 100.00,
    moeda VARCHAR(3) DEFAULT 'BRL',
    eh_ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: historico_tipster_config
-- =====================================================
CREATE TABLE historico_tipster_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipster_id UUID NOT NULL REFERENCES tipsters(id) ON DELETE CASCADE,
    valor_assinatura DECIMAL(10,2) NOT NULL,
    stake_padrao DECIMAL(10,2) NOT NULL,
    unidade_base DECIMAL(10,2) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: casas_apostas
-- =====================================================
CREATE TABLE casas_apostas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('bookmaker', 'exchange')),
    comissao_percentual DECIMAL(5,2) DEFAULT 0,
    site_url VARCHAR(500),
    eh_ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: bankrolls (atualizada)
-- =====================================================
CREATE TABLE bankrolls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    casa_aposta_id UUID NOT NULL REFERENCES casas_apostas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    saldo_inicial DECIMAL(10,2) NOT NULL,
    saldo_atual DECIMAL(10,2) NOT NULL,
    moeda VARCHAR(3) DEFAULT 'BRL',
    eh_ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, casa_aposta_id, nome)
);

-- =====================================================
-- TABELA: tags
-- =====================================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(50) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, nome)
);

-- =====================================================
-- ENUM: resultado_aposta
-- =====================================================
CREATE TYPE resultado_aposta AS ENUM ('win', 'loss', 'void', 'cancelled', 'cashout');

-- =====================================================
-- ENUM: tipo_transacao
-- =====================================================
CREATE TYPE tipo_transacao AS ENUM ('deposit', 'withdrawal', 'bet_win', 'bet_loss', 'adjustment', 'tipster_subscription', 'cashout');

-- =====================================================
-- ENUM: modalidade_aposta (quando a aposta foi feita)
-- =====================================================
CREATE TYPE modalidade_aposta AS ENUM ('pre_live', 'live');

-- =====================================================
-- ENUM: periodo_aposta (para que período é a aposta)
-- =====================================================
CREATE TYPE periodo_aposta AS ENUM ('FT', 'HT', '1T', '2T', '1Q', '2Q', '3Q', '4Q');

-- =====================================================
-- ENUM: direcao_aposta (para exchanges)
-- =====================================================
CREATE TYPE direcao_aposta AS ENUM ('back', 'lay');

-- =====================================================
-- ENUM: tipo_aposta_combinacao
-- =====================================================
CREATE TYPE tipo_aposta_combinacao AS ENUM ('simples', 'multipla', 'sistema');

-- =====================================================
-- TABELA: apostas
-- =====================================================
CREATE TABLE apostas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    bankroll_id UUID NOT NULL REFERENCES bankrolls(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    mercado_id UUID REFERENCES mercados(id) ON DELETE SET NULL,
    tipster_id UUID REFERENCES tipsters(id) ON DELETE SET NULL,
    aposta_pai_id UUID REFERENCES apostas(id) ON DELETE CASCADE, -- Para múltiplas
    nome_evento VARCHAR(200) NOT NULL,
    data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    modalidade_aposta modalidade_aposta NOT NULL DEFAULT 'pre_live',
    periodo_aposta periodo_aposta NOT NULL DEFAULT 'FT',
    direcao_aposta direcao_aposta DEFAULT 'back',
    tipo_combinacao tipo_aposta_combinacao NOT NULL DEFAULT 'simples',
    linha_aposta VARCHAR(50), -- Ex: Over 2.5, -1.5, etc
    odd DECIMAL(8,3) NOT NULL CHECK (odd > 0),
    odd_fechamento DECIMAL(8,3), -- Odd no fechamento do mercado
    stake_dinheiro DECIMAL(10,2) NOT NULL CHECK (stake_dinheiro > 0),
    stake_unidades DECIMAL(5,2) NOT NULL CHECK (stake_unidades > 0),
    unidade_valor DECIMAL(10,2) NOT NULL, -- Valor da unidade na época da aposta
    resultado resultado_aposta DEFAULT NULL,
    retorno_dinheiro DECIMAL(10,2),
    lucro_unidades DECIMAL(8,2),
    comissao_valor DECIMAL(10,2) DEFAULT 0, -- Valor da comissão calculado
    observacoes TEXT,
    referencia_imagem VARCHAR(500),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ENUM: tipo_saida
-- =====================================================
CREATE TYPE tipo_saida AS ENUM ('cashout_total', 'cashout_parcial', 'freebet_parcial', 'resultado_final');

-- =====================================================
-- TABELA: saidas_apostas (para múltiplas saídas)
-- =====================================================
CREATE TABLE saidas_apostas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aposta_id UUID NOT NULL REFERENCES apostas(id) ON DELETE CASCADE,
    tipo_saida tipo_saida NOT NULL,
    valor_saida DECIMAL(10,2) NOT NULL,
    percentual_saida DECIMAL(5,2) NOT NULL CHECK (percentual_saida > 0 AND percentual_saida <= 100),
    stake_restante DECIMAL(10,2) DEFAULT 0,
    data_saida TIMESTAMP WITH TIME ZONE NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: apostas_tags (many-to-many)
-- =====================================================
CREATE TABLE apostas_tags (
    aposta_id UUID REFERENCES apostas(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (aposta_id, tag_id)
);

-- Atualizar transações para referenciar casas_apostas
CREATE TABLE transacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    casa_aposta_id UUID REFERENCES casas_apostas(id) ON DELETE SET NULL,
    aposta_id UUID REFERENCES apostas(id) ON DELETE SET NULL,
    saida_aposta_id UUID REFERENCES saidas_apostas(id) ON DELETE SET NULL,
    tipo_transacao tipo_transacao NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para casas_apostas
CREATE INDEX idx_casas_apostas_usuario_id ON casas_apostas(usuario_id);
CREATE INDEX idx_casas_apostas_ativo ON casas_apostas(eh_ativo);

-- Índices para apostas
CREATE INDEX idx_apostas_usuario_id ON apostas(usuario_id);
CREATE INDEX idx_apostas_casa_aposta ON apostas(casa_aposta_id);
CREATE INDEX idx_apostas_tipster ON apostas(tipster_id);
CREATE INDEX idx_apostas_resultado ON apostas(resultado);
CREATE INDEX idx_apostas_criado_em ON apostas(criado_em);

-- Índices para selecoes_apostas
CREATE INDEX idx_selecoes_aposta_id ON selecoes_apostas(aposta_id);
CREATE INDEX idx_selecoes_data_evento ON selecoes_apostas(data_evento);
CREATE INDEX idx_selecoes_categoria ON selecoes_apostas(categoria_id);
CREATE INDEX idx_selecoes_campeonato ON selecoes_apostas(campeonato_id);

-- Índices para saidas_apostas
CREATE INDEX idx_saidas_aposta_id ON saidas_apostas(aposta_id);
CREATE INDEX idx_saidas_tipo ON saidas_apostas(tipo_saida);
CREATE INDEX idx_saidas_data ON saidas_apostas(data_saida);

-- Índices para transacoes
CREATE INDEX idx_transacoes_usuario_id ON transacoes(usuario_id);
CREATE INDEX idx_transacoes_casa_aposta_id ON transacoes(casa_aposta_id);
CREATE INDEX idx_transacoes_saida_aposta_id ON transacoes(saida_aposta_id);
CREATE INDEX idx_transacoes_tipo ON transacoes(tipo_transacao);
CREATE INDEX idx_transacoes_criado_em ON transacoes(criado_em);

-- Índices para campeonatos
CREATE INDEX idx_campeonatos_pais_id ON campeonatos(pais_id);
CREATE INDEX idx_campeonatos_categoria_id ON campeonatos(categoria_id);

-- =====================================================
-- TRIGGERS PARA TIMESTAMP AUTOMÁTICO
-- =====================================================

CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER trigger_usuarios_timestamp
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_apostas_timestamp
    BEFORE UPDATE ON apostas
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_bankrolls_timestamp
    BEFORE UPDATE ON bankrolls
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_transacoes_timestamp
    BEFORE UPDATE ON transacoes
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_categorias_timestamp
    BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_tipsters_timestamp
    BEFORE UPDATE ON tipsters
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_tags_timestamp
    BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_assinatura_usuarios_timestamp
    BEFORE UPDATE ON assinatura_usuarios
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

-- =====================================================
-- DADOS INICIAIS (SEEDS)
-- =====================================================

-- Categorias padrão
INSERT INTO categorias (nome, descricao) VALUES
('Futebol', 'Apostas relacionadas ao futebol'),
('Basquete', 'Apostas relacionadas ao basquete'),
('Tennis', 'Apostas relacionadas ao tênis'),
('Vôlei', 'Apostas relacionadas ao vôlei'),
('Outros Esportes', 'Outras modalidades esportivas'),
('E-Sports', 'Apostas em jogos eletrônicos');

-- =====================================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- =====================================================

-- View para estatísticas por usuário
CREATE VIEW vw_estatisticas_usuario AS
SELECT 
    u.id as usuario_id,
    u.nome,
    COUNT(a.id) as total_apostas,
    COUNT(CASE WHEN a.resultado = 'win' THEN 1 END) as apostas_ganhas,
    COUNT(CASE WHEN a.resultado = 'loss' THEN 1 END) as apostas_perdidas,
    COUNT(CASE WHEN a.resultado IS NULL THEN 1 END) as apostas_pendentes,
    COALESCE(SUM(a.stake), 0) as valor_total_apostado,
    COALESCE(SUM(CASE WHEN a.resultado = 'win' THEN a.payout - a.stake ELSE 0 END), 0) as lucro_total,
    CASE 
        WHEN COUNT(CASE WHEN a.resultado IN ('win', 'loss') THEN 1 END) > 0 
        THEN ROUND(COUNT(CASE WHEN a.resultado = 'win' THEN 1 END)::DECIMAL / COUNT(CASE WHEN a.resultado IN ('win', 'loss') THEN 1 END) * 100, 2)
        ELSE 0 
    END as taxa_acerto,
    CASE 
        WHEN SUM(a.stake) > 0 
        THEN ROUND((SUM(CASE WHEN a.resultado = 'win' THEN a.payout - a.stake ELSE 0 END) / SUM(a.stake)) * 100, 2)
        ELSE 0 
    END as roi_percentual
FROM usuarios u
LEFT JOIN apostas a ON u.id = a.usuario_id
GROUP BY u.id, u.nome;

-- View para relatório de apostas com detalhes
CREATE VIEW vw_apostas_detalhadas AS
SELECT 
    a.id,
    a.nome_evento,
    a.data_evento,
    a.tipo_aposta,
    a.odd,
    a.stake,
    a.resultado,
    a.payout,
    CASE 
        WHEN a.resultado = 'win' THEN a.payout - a.stake
        WHEN a.resultado = 'loss' THEN -a.stake
        ELSE 0
    END as lucro_prejuizo,
    c.nome as categoria_nome,
    b.nome as bankroll_nome,
    t.nome as tipster_nome,
    u.nome as usuario_nome,
    a.criado_em
FROM apostas a
JOIN usuarios u ON a.usuario_id = u.id
LEFT JOIN categorias c ON a.categoria_id = c.id
LEFT JOIN bankrolls b ON a.bankroll_id = b.id
LEFT JOIN tipsters t ON a.tipster_id = t.id;

-- =====================================================
-- FUNÇÃO PARA CALCULAR PAYOUT E UNIDADES AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_resultados_aposta()
RETURNS TRIGGER AS $
DECLARE
    config_tipster RECORD;
BEGIN
    -- Buscar configuração atual do tipster se existir
    IF NEW.tipster_id IS NOT NULL THEN
        SELECT 
            stake_padrao,
            unidade_base
        INTO config_tipster
        FROM tipsters 
        WHERE id = NEW.tipster_id;
    END IF;
    
    -- Se resultado é win e payout não foi definido, calcular automaticamente
    IF NEW.resultado = 'win' AND (NEW.payout_dinheiro IS NULL OR NEW.payout_dinheiro = 0) THEN
        NEW.payout_dinheiro = NEW.stake_dinheiro * NEW.odd;
        NEW.lucro_unidades = NEW.stake_unidades * (NEW.odd - 1);
    END IF;
    
    -- Se resultado é loss
    IF NEW.resultado = 'loss' THEN
        NEW.payout_dinheiro = 0;
        NEW.lucro_unidades = -NEW.stake_unidades;
    END IF;
    
    -- Se resultado é void ou cancelled, devolução
    IF NEW.resultado IN ('void', 'cancelled') THEN
        NEW.payout_dinheiro = NEW.stake_dinheiro;
        NEW.lucro_unidades = 0;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_resultados_aposta_freebet
    BEFORE INSERT OR UPDATE ON apostas
    FOR EACH ROW EXECUTE FUNCTION calcular_resultados_aposta_freebet();

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE usuarios IS 'Tabela principal de usuários do sistema';
COMMENT ON TABLE apostas IS 'Registro de todas as apostas realizadas pelos usuários';
COMMENT ON TABLE bankrolls IS 'Controle de bankrolls/bancas dos usuários';
COMMENT ON TABLE transacoes IS 'Histórico de movimentações financeiras';
COMMENT ON TABLE categorias IS 'Categorias de esportes/tipos de apostas';
COMMENT ON TABLE tags IS 'Tags personalizadas para organização das apostas';
COMMENT ON TABLE tipsters IS 'Informações sobre tipsters seguidos pelos usuários';