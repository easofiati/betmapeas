-- =====================================================
-- EXEMPLO COM NOVA ESTRUTURA - BETMAPEAS
-- =====================================================

-- Exemplo 1: Aposta SIMPLES - Over 2.5 gols
-- Dados da APOSTA (únicos)
INSERT INTO apostas (
    id,
    usuario_id,
    casa_aposta_id,
    tipster_id,
    tipo_combinacao,
    direcao_aposta,
    stake_dinheiro,
    stake_unidades,
    unidade_valor,
    resultado,
    retorno_dinheiro,
    lucro_unidades,
    comissao_valor,
    observacoes_gerais
) VALUES (
    '550e8400-e29b-41d4-a716-446655440100',
    '550e8400-e29b-41d4-a716-446655440001', -- usuário
    '550e8400-e29b-41d4-a716-446655440010', -- Betfair
    '550e8400-e29b-41d4-a716-446655440040', -- tipster
    'simples',
    'back',
    100.00,    -- R$ 100
    2.00,      -- 2 unidades
    50.00,     -- unidade = R$ 50
    'win',
    215.00,    -- retorno
    2.30,      -- lucro em unidades
    5.75,      -- comissão
    'Tip do João Pro - boa confiança'
);

-- Dados da SELEÇÃO (específicos do evento)
INSERT INTO selecoes_apostas (
    aposta_id,
    categoria_id,
    mercado_id,
    campeonato_id,
    nome_evento,
    data_evento,
    modalidade_aposta,
    periodo_aposta,
    linha_aposta,
    odd,
    odd_fechamento,
    resultado_selecao,
    observacoes,
    referencia_imagem
) VALUES (
    '550e8400-e29b-41d4-a716-446655440100',
    '550e8400-e29b-41d4-a716-446655440020', -- Futebol
    '550e8400-e29b-41d4-a716-446655440030', -- Total de Gols
    '550e8400-e29b-41d4-a716-446655440050', -- Brasileirão
    'Flamengo x Palmeiras',
    '2025-06-15 16:00:00-03:00',
    'pre_live',
    'FT',
    'Over 2.5',
    2.15,
    2.12,      -- odd caiu
    'win',
    'Clássico com defesas ruins, jogo aberto esperado',
    'https://bucket.s3.amazonaws.com/bet_123.jpg'
);

-- =====================================================
-- Exemplo 2: Aposta MÚLTIPLA - 3 seleções
-- =====================================================

-- Dados da APOSTA (únicos para toda múltipla)
INSERT INTO apostas (
    id,
    usuario_id,
    casa_aposta_id,
    tipo_combinacao,
    direcao_aposta,
    stake_dinheiro,
    stake_unidades,
    unidade_valor,
    resultado,
    payout_dinheiro,
    lucro_unidades,
    observacoes_gerais
) VALUES (
    '550e8400-e29b-41d4-a716-446655440200',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440011', -- Bet365
    'multipla',
    'back',
    200.00,    -- R$ 200 total
    4.00,      -- 4 unidades
    50.00,
    'loss',    -- múltipla perdeu
    0.00,
    -4.00,
    'Múltipla com 3 over 1.5 - Santos matou'
);

-- =====================================================
-- EXEMPLOS COM ODD FINAL E FREEBET - BETMAPEAS
-- =====================================================

-- Exemplo 1: Aposta SIMPLES normal
INSERT INTO apostas (
    id,
    usuario_id,
    casa_aposta_id,
    tipster_id,
    tipo_combinacao,
    direcao_aposta,
    odd_final,
    stake_dinheiro,
    stake_unidades,
    unidade_valor,
    eh_freebet,
    valor_freebet,
    resultado,
    payout_dinheiro,
    lucro_unidades,
    comissao_valor,
    observacoes_gerais
) VALUES (
    '550e8400-e29b-41d4-a716-446655440100',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440010', -- Betfair
    '550e8400-e29b-41d4-a716-446655440040',
    'simples',
    'back',
    2.15,      -- Odd final (igual à seleção)
    100.00,
    2.00,
    50.00,
    false,     -- Não é freebet
    0.00,
    'win',
    215.00,    -- Retorno total
    2.30,
    5.75,
    'Tip simples, odd bateu exato'
);

INSERT INTO selecoes_apostas (
    aposta_id,
    categoria_id,
    mercado_id,
    campeonato_id,
    nome_evento,
    data_evento,
    modalidade_aposta,
    periodo_aposta,
    linha_aposta,
    odd,
    resultado_selecao,
    observacoes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440100',
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440050',
    'Flamengo x Palmeiras',
    '2025-06-15 16:00:00-03:00',
    'pre_live',
    'FT',
    'Over 2.5',
    2.15,      -- Odd individual (igual à final)
    'win',
    'Jogo com 4 gols'
);

-- =====================================================
-- Exemplo 2: MÚLTIPLA com odd final diferente
-- =====================================================

INSERT INTO apostas (
    id,
    usuario_id,
    casa_aposta_id,
    tipo_combinacao,
    odd_final,
    stake_dinheiro,
    stake_unidades,
    unidade_valor,
    eh_freebet,
    resultado,
    payout_dinheiro,
    lucro_unidades,
    observacoes_gerais
) VALUES (
    '550e8400-e29b-41d4-a716-446655440200',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440011', -- Bet365
    'multipla',
    8.20,      -- Odd final DIFERENTE do produto (1.4*2.0*3.0=8.4)
    200.00,
    4.00,
    50.00,
    false,
    'loss',
    0.00,
    -4.00,
    'Múltipla com desconto - odd final menor que produto'
);

-- Seleções da múltipla (produto = 8.4, mas casa deu 8.2)
INSERT INTO selecoes_apostas (aposta_id, categoria_id, mercado_id, campeonato_id, nome_evento, data_evento, modalidade_aposta, periodo_aposta, linha_aposta, odd, resultado_selecao, observacoes) VALUES
('550e8400-e29b-41d4-a716-446655440200', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440050', 'Flamengo x Vasco', '2025-06-17 16:00:00-03:00', 'pre_live', 'FT', 'Over 1.5', 1.40, 'win', 'Passou - 3x1'),
('550e8400-e29b-41d4-a716-446655440200', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440050', 'Palmeiras x Corinthians', '2025-06-17 18:00:00-03:00', 'pre_live', 'FT', 'Over 1.5', 2.00, 'win', 'Passou - 2x1'),
('550e8400-e29b-41d4-a716-446655440200', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440050', 'Santos x São Paulo', '2025-06-17 20:00:00-03:00', 'pre_live', 'FT', 'Over 1.5', 3.00, 'loss', 'Matou - 0x0');

-- =====================================================
-- Exemplo 3: FREEBET simples
-- =====================================================

INSERT INTO apostas (
    id,
    usuario_id,
    casa_aposta_id,
    tipo_combinacao,
    odd_final,
    stake_dinheiro,
    stake_unidades,
    unidade_valor,
    eh_freebet,
    valor_freebet,
    resultado,
    payout_dinheiro,
    lucro_unidades,
    observacoes_gerais
) VALUES (
    '550e8400-e29b-41d4-a716-446655440300',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440010', -- Betfair
    'simples',
    3.20,
    50.00,     -- Valor da freebet
    1.00,
    50.00,
    true,      -- É FREEBET
    50.00,     -- Valor da freebet
    'win',
    110.00,    -- (3.20-1) * 50 = apenas o lucro
    2.20,      -- 110/50 = 2.2 unidades
    2.20,      -- Comissão sobre lucro
    'Freebet de boas-vindas'
);

INSERT INTO selecoes_apostas (
    aposta_id,
    categoria_id,
    mercado_id,
    campeonato_id,
    nome_evento,
    data_evento,
    modalidade_aposta,
    periodo_aposta,
    linha_aposta,
    odd,
    resultado_selecao,
    observacoes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440300',
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440050',
    'Grêmio x Internacional',
    '2025-06-20 16:00:00-03:00',
    'pre_live',
    'FT',
    'Grêmio',
    3.20,
    'win',
    'Freebet aproveitada - Grêmio 2x1'
);

-- =====================================================
-- Exemplo 4: FREEBET perdida
-- =====================================================

INSERT INTO apostas (
    id,
    usuario_id,
    casa_aposta_id,
    tipo_combinacao,
    odd_final,
    stake_dinheiro,
    stake_unidades,
    unidade_valor,
    eh_freebet,
    valor_freebet,
    resultado,
    payout_dinheiro,
    lucro_unidades,
    observacoes_gerais
) VALUES (
    '550e8400-e29b-41d4-a716-446655440400',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440011', -- Bet365
    'simples',
    2.50,
    25.00,     -- Freebet de R$ 25
    0.50,
    50.00,
    true,      -- É FREEBET
    25.00,
    'loss',
    0.00,      -- Freebet perdida = sem retorno
    -0.50,     -- Perda apenas das unidades
    0.00,
    'Freebet perdida - não afeta saldo real'
);

INSERT INTO selecoes_apostas (
    aposta_id,
    categoria_id,
    mercado_id,
    campeonato_id,
    nome_evento,
    data_evento,
    modalidade_aposta,
    periodo_aposta,
    linha_aposta,
    odd,
    resultado_selecao,
    observacoes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440400',
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440035',
    '550e8400-e29b-41d4-a716-446655440060',
    'Lakers vs Celtics',
    '2025-06-21 22:00:00-03:00',
    'pre_live',
    'FT',
    'Over 215.5',
    2.50,
    'loss',
    'Jogo defensivo - apenas 200 pontos'
);

-- =====================================================
-- CONSULTA ATUALIZADA COM FREEBET
-- =====================================================

SELECT 
    -- Dados da aposta
    a.id as aposta_id,
    a.tipo_combinacao,
    a.direcao_aposta,
    a.odd_final,
    a.stake_dinheiro,
    a.stake_unidades,
    a.eh_freebet,
    a.valor_freebet,
    a.resultado as resultado_aposta,
    a.payout_dinheiro,
    a.lucro_unidades,
    a.comissao_valor,
    
    -- Cálculos financeiros
    CASE 
        WHEN a.eh_freebet THEN 0  -- Freebet não gasta dinheiro real
        ELSE a.stake_dinheiro
    END as dinheiro_real_gasto,
    
    CASE 
        WHEN a.resultado = 'win' AND a.eh_freebet THEN a.payout_dinheiro
        WHEN a.resultado = 'win' AND NOT a.eh_freebet THEN a.payout_dinheiro - a.stake_dinheiro - a.comissao_valor
        WHEN a.resultado = 'loss' AND a.eh_freebet THEN 0
        WHEN a.resultado = 'loss' AND NOT a.eh_freebet THEN -a.stake_dinheiro
        WHEN a.resultado = 'cashout' THEN a.payout_dinheiro - a.stake_dinheiro
        ELSE 0
    END as lucro_liquido_real,
    
    -- Dados da casa
    ca.nome as casa_aposta,
    ca.tipo as tipo_casa,
    
    -- Produto das odds vs odd final (para múltiplas)
    CASE 
        WHEN a.tipo_combinacao = 'multipla' THEN 
            ROUND((SELECT EXP(SUM(LN(s.odd))) FROM selecoes_apostas s WHERE s.aposta_id = a.id), 3)
        ELSE a.odd_final
    END as odd_produto_selecoes,
    
    -- Contagem de seleções
    (SELECT COUNT(*) FROM selecoes_apostas s WHERE s.aposta_id = a.id) as num_selecoes

FROM apostas a
LEFT JOIN casas_apostas ca ON a.casa_aposta_id = ca.id
WHERE a.usuario_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY a.criado_em DESC;-- =====================================================
-- Exemplo 5: Cashout de freebet
-- =====================================================

INSERT INTO apostas (
    id,
    usuario_id,
    casa_aposta_id,
    tipo_combinacao,
    odd_final,
    stake_dinheiro,
    stake_unidades,
    unidade_valor,
    eh_freebet,
    valor_freebet,
    resultado,
    payout_dinheiro,
    lucro_unidades,
    observacoes_gerais
) VALUES (
    '550e8400-e29b-41d4-a716-446655440500',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440010', -- Betfair
    'simples',
    4.50,
    100.00,    -- Freebet de R$ 100
    2.00,
    50.00,
    true,      -- É freebet
    100.00,
    'cashout',
    180.00,    -- Cashout de R$ 180 (valor puro, sem recuperar stake)
    3.60,      -- 180/50 = 3.6 unidades
    'Freebet com cashout estratégico antes do jogo acabar'
);

INSERT INTO selecoes_apostas (
    aposta_id,
    categoria_id,
    mercado_id,
    campeonato_id,
    nome_evento,
    data_evento,
    modalidade_aposta,
    periodo_aposta,
    linha_aposta,
    odd,
    resultado_selecao,
    observacoes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440500',
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440050',
    'Botafogo x Fluminense',
    '2025-06-22 18:00:00-03:00',
    'live',
    'FT',
    'Botafogo',
    4.50,
    'cashout',
    'Botafogo ganhando 1x0 aos 75min, fiz cashout da freebet'
);

-- =====================================================
-- Exemplo 6: Múltipla com boost (odd final maior)
-- =====================================================

INSERT INTO apostas (
    id,
    usuario_id,
    casa_aposta_id,
    tipo_combinacao,
    odd_final,
    stake_dinheiro,
    stake_unidades,
    unidade_valor,
    eh_freebet,
    resultado,
    payout_dinheiro,
    lucro_unidades,
    observacoes_gerais
) VALUES (
    '550e8400-e29b-41d4-a716-446655440600',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440011', -- Bet365
    'multipla',
    6.50,      -- Odd final COM BOOST (produto seria 6.0)
    150.00,
    3.00,
    50.00,
    false,
    'win',
    975.00,    -- 150 * 6.5
    16.50,     -- (975-150)/50 = 16.5 unidades
    'Múltipla com boost de odds - promoção da casa'
);

-- Seleções da múltipla (produto = 6.0, mas casa deu boost para 6.5)
INSERT INTO selecoes_apostas (aposta_id, categoria_id, mercado_id, campeonato_id, nome_evento, data_evento, modalidade_aposta, periodo_aposta, linha_aposta, odd, resultado_selecao, observacoes) VALUES
('550e8400-e29b-41d4-a716-446655440600', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440051', 'Manchester City x Arsenal', '2025-06-23 16:00:00-03:00', 'pre_live', 'FT', 'Over 2.5', 1.50, 'win', 'Jogo com 4 gols'),
('550e8400-e29b-41d4-a716-446655440600', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440051', 'Liverpool x Chelsea', '2025-06-23 18:30:00-03:00', 'pre_live', 'FT', 'Over 2.5', 2.00, 'win', 'Jogo eletrizante com 5 gols'),
('550e8400-e29b-41d4-a716-446655440600', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440051', 'Tottenham x Newcastle', '2025-06-23 21:00:00-03:00', 'pre_live', 'FT', 'Over 2.5', 2.00, 'win', 'Tottenham 3x2 Newcastle');

-- =====================================================
-- CONSULTA FINAL COM ANÁLISES AVANÇADAS
-- =====================================================

SELECT 
    -- Identificação
    a.id as aposta_id,
    a.tipo_combinacao,
    a.direcao_aposta,
    a.eh_freebet,
    
    -- Odds e Stakes
    a.odd_final,
    a.stake_dinheiro,
    a.stake_unidades,
    a.valor_freebet,
    
    -- Resultados
    a.resultado as resultado_aposta,
    a.payout_dinheiro,
    a.lucro_unidades,
    a.comissao_valor,
    
    -- Casa
    ca.nome as casa_aposta,
    ca.tipo as tipo_casa,
    
    -- Análise de odds (para múltiplas)
    CASE 
        WHEN a.tipo_combinacao = 'multipla' THEN 
            ROUND((SELECT EXP(SUM(LN(s.odd))) FROM selecoes_apostas s WHERE s.aposta_id = a.id), 3)
        ELSE a.odd_final
    END as odd_produto_selecoes,
    
    CASE 
        WHEN a.tipo_combinacao = 'multipla' THEN 
            ROUND(a.odd_final - (SELECT EXP(SUM(LN(s.odd))) FROM selecoes_apostas s WHERE s.aposta_id = a.id), 3)
        ELSE 0
    END as diferenca_odd_boost,
    
    -- Contadores
    (SELECT COUNT(*) FROM selecoes_apostas s WHERE s.aposta_id = a.id) as num_selecoes,
    (SELECT COUNT(*) FROM selecoes_apostas s WHERE s.aposta_id = a.id AND s.resultado_selecao = 'win') as selecoes_ganhas,
    
    -- Cálculos financeiros
    CASE 
        WHEN a.eh_freebet THEN 0
        ELSE a.stake_dinheiro
    END as dinheiro_real_investido,
    
    CASE 
        WHEN a.resultado = 'win' AND a.eh_freebet THEN a.payout_dinheiro - a.comissao_valor
        WHEN a.resultado = 'win' AND NOT a.eh_freebet THEN a.payout_dinheiro - a.stake_dinheiro - a.comissao_valor
        WHEN a.resultado = 'loss' AND a.eh_freebet THEN 0
        WHEN a.resultado = 'loss' AND NOT a.eh_freebet THEN -a.stake_dinheiro
        WHEN a.resultado = 'cashout' AND a.eh_freebet THEN a.payout_dinheiro - a.comissao_valor
        WHEN a.resultado = 'cashout' AND NOT a.eh_freebet THEN a.payout_dinheiro - a.stake_dinheiro - a.comissao_valor
        WHEN a.resultado IN ('void', 'cancelled') THEN 0
        ELSE 0
    END as lucro_liquido_final,
    
    -- ROI da aposta
    CASE 
        WHEN a.eh_freebet THEN 
            CASE WHEN a.valor_freebet > 0 THEN ROUND((a.lucro_unidades * a.unidade_valor / a.valor_freebet) * 100, 2) ELSE 0 END
        ELSE 
            CASE WHEN a.stake_dinheiro > 0 THEN ROUND((a.lucro_unidades * a.unidade_valor / a.stake_dinheiro) * 100, 2) ELSE 0 END
    END as roi_percentual,
    
    -- Observações
    a.observacoes_gerais,
    
    -- Data
    a.criado_em

FROM apostas a
LEFT JOIN casas_apostas ca ON a.casa_aposta_id = ca.id
WHERE a.usuario_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY a.criado_em DESC;

-- =====================================================
-- EXEMPLO COM SAÍDAS MÚLTIPLAS - SEU CASO
-- =====================================================

-- Aposta principal: Back de R$ 50 no Betfair
INSERT INTO apostas (
    id,
    usuario_id,
    casa_aposta_id,
    tipo_combinacao,
    direcao_aposta,
    odd_final,
    stake_dinheiro,
    stake_unidades,
    unidade_valor,
    eh_freebet,
    resultado,
    observacoes_gerais
) VALUES (
    '550e8400-e29b-41d4-a716-446655440700',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440010', -- Betfair
    'simples',
    'back',
    2.50,
    50.00,
    1.00,
    50.00,
    false,
    NULL,      -- Aposta ainda não finalizada completamente
    'Aposta com saídas múltiplas - strategy de risco controlado'
);

INSERT INTO selecoes_apostas (
    aposta_id,
    categoria_id,
    mercado_id,
    campeonato_id,
    nome_evento,
    data_evento,
    modalidade_aposta,
    periodo_aposta,
    linha_aposta,
    odd,
    observacoes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440700',
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440050',
    'Flamengo x Botafogo',
    '2025-06-25 19:00:00-03:00',
    'live',
    'FT',
    'Over 2.5',
    2.50,
    'Jogo movimentado, muitos ataques'
);

-- SAÍDA 1: Freebet parcial de R$ 50 (recupera stake original)
INSERT INTO saidas_apostas (
    aposta_id,
    tipo_saida,
    valor_saida,
    percentual_saida,
    stake_restante,
    data_saida,
    observacoes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440700',
    'freebet_parcial',
    50.00,                              -- Valor recuperado
    66.67,                              -- 50/75 = 66.67% da posição
    25.00,                              -- Restam R$ 25 no jogo
    '2025-06-25 20:30:00-03:00',
    'Aos 60min com jogo 2x1, saí com stake para garantir - restam R$ 25 correndo'
);

-- SAÍDA 2: Resultado final dos R$ 25 restantes
INSERT INTO saidas_apostas (
    aposta_id,
    tipo_saida,
    valor_saida,
    percentual_saida,
    stake_restante,
    data_saida,
    observacoes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440700',
    'resultado_final',
    62.50,                              -- 25 * 2.50 = 62.50
    33.33,                              -- 25/75 = 33.33% da posição original
    0.00,                               -- Aposta finalizada
    '2025-06-25 22:00:00-03:00',
    'Jogo terminou 3x1 - over bateu, lucro adicional de R$ 37.50'
);

-- =====================================================
-- EXEMPLO 2: Cashout parcial + resultado final
-- =====================================================

INSERT INTO apostas (
    id, usuario_id, casa_aposta_id, tipo_combinacao, odd_final,
    stake_dinheiro, stake_unidades, unidade_valor, resultado
) VALUES (
    '550e8400-e29b-41d4-a716-446655440800',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440011', -- Bet365
    'simples', 3.00, 100.00, 2.00, 50.00, NULL
);

-- Saída 1: Cashout de 60% da posição
INSERT INTO saidas_apostas (
    aposta_id, tipo_saida, valor_saida, percentual_saida, 
    stake_restante, data_saida, observacoes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440800',
    'cashout_parcial', 120.00, 60.00, 40.00,
    '2025-06-26 20:45:00-03:00',
    'Cashout de 60% por R$ 120 - lucro garantido de R$ 60'
);

-- Saída 2: Resultado final dos 40% restantes
INSERT INTO saidas_apostas (
    aposta_id, tipo_saida, valor_saida, percentual_saida,
    stake_restante, data_saida, observacoes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440800',
    'resultado_final', 0.00, 40.00, 0.00,
    '2025-06-26 22:00:00-03:00',
    'Restante da aposta perdeu - mas já tinha garantido lucro no cashout'
);

-- =====================================================
-- EXEMPLO 3: Múltiplas saídas parciais
-- =====================================================

INSERT INTO apostas (
    id, usuario_id, casa_aposta_id, tipo_combinacao, odd_final,
    stake_dinheiro, stake_unidades, unidade_valor
) VALUES (
    '550e8400-e29b-41d4-a716-446655440900',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440010', -- Betfair
    'simples', 4.00, 200.00, 4.00, 50.00
);

-- Saída 1: Freebet de 25% aos 30min
INSERT INTO saidas_apostas (
    aposta_id, tipo_saida, valor_saida, percentual_saida,
    stake_restante, data_saida, observacoes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440900',
    'freebet_parcial', 50.00, 25.00, 150.00,
    '2025-06-27 20:30:00-03:00',
    'Primeira saída - recuperei 25% da stake'
);

-- Saída 2: Cashout de 50% aos 70min
INSERT INTO saidas_apostas (
    aposta_id, tipo_saida, valor_saida, percentual_saida,
    stake_restante, data_saida, observacoes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440900',
    'cashout_parcial', 400.00, 50.00, 50.00,
    '2025-06-27 21:10:00-03:00',
    'Segunda saída - cashout de 50% por R$ 400'
);

-- Saída 3: Resultado final dos 25% restantes
INSERT INTO saidas_apostas (
    aposta_id, tipo_saida, valor_saida, percentual_saida,
    stake_restante, data_saida, observacoes
) VALUES (
    '550e8400-e29b-41d4-a716-446655440900',
    'resultado_final', 200.00, 25.00, 0.00,
    '2025-06-27 22:00:00-03:00',
    'Restante também ganhou - lucro total maximizado'
);

-- =====================================================
-- VIEWS PARA ANÁLISE DE SAÍDAS
-- =====================================================

-- View para resumo de apostas com saídas
CREATE OR REPLACE VIEW vw_apostas_com_saidas AS
SELECT 
    a.id as aposta_id,
    a.stake_dinheiro as stake_original,
    a.stake_unidades as unidades_originais,
    a.odd_final,
    
    -- Dados das saídas
    COUNT(s.id) as num_saidas,
    SUM(s.valor_saida) as valor_total_recebido,
    
    -- Cálculos financeiros
    SUM(s.valor_saida) - a.stake_dinheiro as lucro_liquido_total,
    ROUND((SUM(s.valor_saida) - a.stake_dinheiro) / a.stake_dinheiro * 100, 2) as roi_percentual,
    
    -- Análise de estratégia
    COUNT(CASE WHEN s.tipo_saida IN ('cashout_parcial', 'freebet_parcial') THEN 1 END) as saidas_parciais,
    COUNT(CASE WHEN s.tipo_saida = 'resultado_final' THEN 1 END) as tem_resultado_final,
    
    -- Timing
    MIN(s.data_saida) as primeira_saida,
    MAX(s.data_saida) as ultima_saida,
    
    -- Casa
    ca.nome as casa_aposta,
    ca.tipo as tipo_casa

FROM apostas a
LEFT JOIN saidas_apostas s ON a.id = s.aposta_id
LEFT JOIN casas_apostas ca ON a.casa_aposta_id = ca.id
WHERE s.id IS NOT NULL  -- Apenas apostas com saídas
GROUP BY a.id, a.stake_dinheiro, a.stake_unidades, a.odd_final, ca.nome, ca.tipo;

-- View para análise detalhada do seu exemplo
CREATE OR REPLACE VIEW vw_exemplo_saidas_detalhado AS
SELECT 
    a.id,
    a.stake_dinheiro,
    s.tipo_saida,
    s.valor_saida,
    s.percentual_saida,
    s.stake_restante,
    s.data_saida,
    s.observacoes,
    
    -- Cálculo incremental
    LAG(s.stake_restante, 1, a.stake_dinheiro) OVER (PARTITION BY a.id ORDER BY s.data_saida) as stake_antes,
    s.valor_saida - (LAG(s.stake_restante, 1, a.stake_dinheiro) OVER (PARTITION BY a.id ORDER BY s.data_saida) - s.stake_restante) as lucro_da_saida

FROM apostas a
JOIN saidas_apostas s ON a.id = s.aposta_id
WHERE a.id = '550e8400-e29b-41d4-a716-446655440700'
ORDER BY s.data_saida;

-- Consulta final: Resumo do seu exemplo
SELECT 
    'Resumo da Aposta com Saídas Múltiplas' as descricao,
    a.stake_dinheiro as "Stake Original",
    SUM(s.valor_saida) as "Total Recebido",
    SUM(s.valor_saida) - a.stake_dinheiro as "Lucro Líquido",
    ROUND((SUM(s.valor_saida) - a.stake_dinheiro) / a.stake_dinheiro * 100, 2) || '%' as "ROI"
FROM apostas a
JOIN saidas_apostas s ON a.id = s.aposta_id
WHERE a.id = '550e8400-e29b-41d4-a716-446655440700'
GROUP BY a.id, a.stake_dinheiro;