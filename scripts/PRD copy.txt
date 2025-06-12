# PRD - BetMapEAS

## Overview
**BetMapEAS** é uma plataforma web para registro e análise de apostas esportivas que suporta cenários complexos do mundo real. Resolve a falta de ferramentas que capturem apostas em exchanges, freebets, saídas múltiplas e controle de tipsters.

**Target**: Apostadores recreativos e profissionais que buscam controle total sobre performance, desde iniciantes até seguidores de tipsters.

**Value**: Primeira plataforma que modela corretamente exchanges (back/lay), freebets, cashouts parciais e ROI líquido com custos de tipsters.

## Core Features

### 1. Sistema de Apostas Avançado
- **Apostas simples/múltiplas** com odd final independente do produto das seleções
- **Freebets** com cálculo diferenciado (retorno = lucro apenas)
- **Exchange back/lay** com controle de responsabilidade e comissões
- **Saídas múltiplas**: freebet parcial + cashout + resultado final

### 2. Gestão de Casas e Bankroll
- Cadastro por usuário (Bet365, Betfair, Pinnacle)
- Tipo bookmaker/exchange com comissão automática
- Saldo único por casa com transações automáticas

### 3. Controle de Tipsters
- Configuração dinâmica: stake padrão, unidade base, assinatura mensal
- Histórico de mudanças mensais
- ROI líquido descontando custos de assinatura

### 4. Dashboard e Análises
- ROI por casa, tipster, modalidade (live/pré)
- Performance freebets vs dinheiro real
- Detecção automática de boost/desconto em múltiplas

## User Experience

### Personas
**João (Recreativo)**: Aposta esporadicamente, quer controlar gastos e ver se está ganhando.
**Maria (Exchange)**: Usa Betfair, faz saídas parciais, precisa rastrear estratégias complexas.
**Pedro (Tipster)**: Segue 3 tipsters, precisa ROI líquido descontando assinaturas.

### Key Flows
1. **Registro simples**: Casa → Aposta → Resultado → Dashboard
2. **Exchange complexo**: Aposta → Freebet parcial → Cashout → Resultado final
3. **Tipster**: Configurar tipster → Apostar com unidades → Analisar ROI líquido

### UI/UX
- Form wizard para apostas múltiplas
- Timeline visual para saídas múltiplas
- Dashboard com métricas em cards
- Mobile-first responsive

## Technical Architecture

### System Components
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React + TypeScript + Vite + TanStack Query
- **Infrastructure**: Docker Compose (backend/frontend/database separados)

### Data Models
```sql
apostas: odd_final, eh_freebet, retorno_dinheiro, stake_unidades
selecoes_apostas: modalidade_aposta, periodo_aposta, campeonato_id
saidas_apostas: tipo_saida, percentual_saida, stake_restante
casas_apostas: tipo, comissao_percentual, saldo_atual
tipsters: valor_assinatura_mensal, stake_padrao, unidade_base
```

### APIs and Integrations
- REST API documentada (OpenAPI)
- JWT authentication com refresh tokens
- Row Level Security (PostgreSQL)
- Triggers automáticos para cálculos

### Infrastructure
- PostgreSQL 15+ com RLS
- Redis para cache (opcional)
- Docker multi-stage builds
- Nginx reverse proxy (produção)

## Development Roadmap

### Fase 1: MVP Foundation
**Objetivo**: Sistema funcional para apostas básicas
- [ ] Setup projeto (Docker + FastAPI + React)
- [ ] Autenticação JWT com RLS
- [ ] CRUD casas de apostas
- [ ] Modelo apostas básico (simples apenas)
- [ ] Dashboard mínimo (total, lucro, ROI)

### Fase 2: Core Betting
**Objetivo**: Apostas completas com contexto
- [ ] Categorias, mercados, campeonatos
- [ ] Seleções de apostas (múltiplas)
- [ ] Cálculo automático de odd final vs produto
- [ ] Upload de comprovantes
- [ ] Filtros e exportação CSV

### Fase 3: Advanced Features
**Objetivo**: Freebets e exchanges
- [ ] Sistema freebets completo
- [ ] Back/lay em exchanges
- [ ] Cálculo automático de comissões
- [ ] Dashboard avançado por casa

### Fase 4: Complex Strategies
**Objetivo**: Saídas múltiplas e tipsters
- [ ] Tabela saidas_apostas
- [ ] Interface para estratégias complexas
- [ ] Sistema tipsters com histórico
- [ ] ROI líquido com custos

### Fase 5: Analytics & Polish
**Objetivo**: Insights e otimizações
- [ ] Relatórios avançados
- [ ] Análise de padrões
- [ ] Performance optimizations
- [ ] Mobile app (PWA)

## Logical Dependency Chain

### Foundation (Must Build First)
1. **Auth + RLS**: Base de segurança
2. **Casas de apostas**: Fundação financeira
3. **Apostas básicas**: Core funcional
4. **Dashboard mínimo**: Valor imediato visível

### Progressive Enhancement
1. **Contexto** (categorias/mercados) → **Múltiplas** → **Freebets** → **Saídas múltiplas**
2. Cada feature é atomic mas builds upon anterior
3. Frontend sempre acompanha backend (não deixar APIs sem UI)

### Quick Wins
- Dashboard funcional em Fase 1
- Apostas simples working end-to-end
- CSV export para retenção

## Risks and Mitigations

### Technical Challenges
**Risk**: Complexidade das saídas múltiplas
**Mitigation**: Implementar progressivamente, começar com casos simples

**Risk**: Cálculos automáticos incorretos
**Mitigation**: Testes unitários extensivos (90%+ coverage), fixtures com cenários conhecidos

**Risk**: Performance com múltiplas seleções
**Mitigation**: Índices otimizados, queries eficientes, cache Redis

### MVP Definition
**Risk**: Over-engineering no início
**Mitigation**: Focar em apostas simples first, adicionar complexidade gradualmente

**Risk**: Frontend sem backend ready
**Mitigation**: Mock APIs para desenvolvimento paralelo

### Resource Constraints
**Risk**: Scope creep
**Mitigation**: Fases bem definidas, cada uma entregando valor

**Risk**: Falta de feedback real
**Mitigation**: Deploy early com apostas básicas, iterar com usuários

## Appendix

### Research Findings
- 80% apostadores usam múltiplas casas
- 60% em exchanges fazem saídas parciais
- 40% seguem tipsters pagos
- Falta de ferramentas que capturem essa complexidade

### Technical Specifications
- PostgreSQL enums para status/tipos
- UUIDs para todos identificadores
- Timestamps automáticos via triggers
- Backup automático diário
- Logs estruturados (JSON)
- Pre-commit hooks (black, isort, mypy)

### Success Metrics
- **Adoção**: 50+ usuários em 3 meses
- **Engagement**: 10+ apostas/usuário/mês
- **Technical**: Uptime 99%+, response time <300ms