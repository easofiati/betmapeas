# Documentação Completa - Modelagem BetMapEAS

## 🎯 Visão Geral
Sistema completo para registro e análise de apostas esportivas com suporte a todos os cenários reais: apostas simples/múltiplas, exchanges (back/lay), freebets, saídas parciais e controle de tipsters.

---

## 📊 Entidades Principais

### 1. **usuarios**
Dados básicos dos apostadores.
- Autenticação, preferências, configurações regionais
- Controle de administração (eh_admin)

### 2. **casas_apostas** 
Uma casa por usuário com saldo único.
- **Bookmaker**: Sem comissão (Bet365, Pinnacle)
- **Exchange**: Com comissão percentual (Betfair, Smarkets)
- Controle de saldo por casa

### 3. **apostas**
Dados únicos por aposta independente do número de seleções.
- Stake, unidades, resultado final
- Odd final (pode diferir do produto das seleções)
- Controle de freebets

### 4. **selecoes_apostas**
Uma linha por seleção dentro da aposta.
- Dados do evento: nome, data, campeonato, país
- Modalidade (pré-live/live) + Período (FT/HT/1Q/etc)
- Odd individual por seleção

### 5. **saidas_apostas**
Múltiplas saídas por aposta para estratégias complexas.
- Cashouts parciais/totais
- Freebets parciais 
- Resultados finais

---

## 🔧 Cenários Suportados

### **A. Apostas Simples**

#### A1. Bookmaker Tradicional
```sql
-- Aposta: R$ 100 no Over 2.5 @ 2.15
apostas: stake_dinheiro=100, odd_final=2.15, eh_freebet=false
selecoes_apostas: odd=2.15, linha_aposta='Over 2.5'
```

#### A2. Exchange - Back
```sql
-- Back: R$ 50 @ 3.20 no Betfair
apostas: direcao_aposta='back', comissao_valor=5.50
selecoes_apostas: odd=3.20, modalidade_aposta='live'
```

#### A3. Exchange - Lay
```sql
-- Lay: Responsabilidade R$ 125 @ 3.50
apostas: direcao_aposta='lay', stake_dinheiro=50
-- Se LAY ganha: recebe R$ 50, paga comissão sobre lucro
```

### **B. Apostas Múltiplas**

#### B1. Múltipla Tradicional
```sql
-- 3 seleções: odds 1.40 x 2.00 x 3.00 = 8.40
apostas: tipo_combinacao='multipla', odd_final=8.40
selecoes_apostas: 3 linhas com odds individuais
```

#### B2. Múltipla com Boost
```sql
-- Produto das odds: 8.40, Casa oferece: 8.80
apostas: odd_final=8.80  -- Maior que produto
-- Sistema detecta boost automaticamente
```

#### B3. Múltipla com Desconto
```sql
-- Produto das odds: 8.40, Casa oferece: 8.20
apostas: odd_final=8.20  -- Menor que produto
-- Sistema detecta margem extra da casa
```

### **C. Sistema de Freebets**

#### C1. Freebet Simples
```sql
apostas: eh_freebet=true, valor_freebet=50, stake_dinheiro=50
-- Se ganha: payout = (odd-1) * stake (só o lucro)
-- Se perde: payout = 0 (não afeta saldo real)
```

#### C2. Freebet Múltipla
```sql
apostas: eh_freebet=true, tipo_combinacao='multipla'
-- Mesma lógica: só recebe lucro líquido se ganhar
```

#### C3. Cashout de Freebet
```sql
apostas: eh_freebet=true, resultado='cashout'
-- Valor cashout é puro (sem recuperar stake original)
```

### **D. Saídas Múltiplas (Exchange)**

#### D1. Freebet Parcial + Resultado Final
```sql
-- Stake: R$ 50, Posição atual: R$ 75
saidas_apostas[1]: tipo_saida='freebet_parcial', valor_saida=50, percentual_saida=66.67
saidas_apostas[2]: tipo_saida='resultado_final', valor_saida=62.50, percentual_saida=33.33
-- Total recebido: R$ 112.50 | Lucro: R$ 62.50
```

#### D2. Cashout Parcial + Freebet + Final
```sql
-- Estratégia complexa em 3 etapas
saidas_apostas[1]: tipo_saida='cashout_parcial', percentual_saida=40
saidas_apostas[2]: tipo_saida='freebet_parcial', percentual_saida=35  
saidas_apostas[3]: tipo_saida='resultado_final', percentual_saida=25
```

#### D3. Múltiplos Cashouts
```sql
-- Saídas graduais conforme jogo evolui
saidas_apostas[1]: '30min - cashout 25%'
saidas_apostas[2]: '60min - cashout 50%' 
saidas_apostas[3]: 'Final - restante 25%'
```

### **E. Controle de Tipsters**

#### E1. Configuração Dinâmica
```sql
tipsters: valor_assinatura_mensal=99, stake_padrao=1.5, unidade_base=100
historico_tipster_config: Mudanças mensais de valores
```

#### E2. Apostas com Tipster
```sql
apostas: tipster_id=xxx, stake_unidades=2.5, unidade_valor=100
-- Custo mensal do tipster vai para transacoes
```

#### E3. ROI com Desconto de Assinatura
```sql
-- ROI real = (lucro_apostas - custo_assinatura) / investimento_total
```

### **F. Modalidades e Períodos**

#### F1. Combinações Possíveis
```sql
-- Live para FT: modalidade_aposta='live', periodo_aposta='FT'
-- Pré para HT: modalidade_aposta='pre_live', periodo_aposta='HT'  
-- Live 1Q: modalidade_aposta='live', periodo_aposta='1Q'
```

#### F2. Dados Contextuais
```sql
selecoes_apostas: 
  campeonato_id -> 'Brasileirão'
  categoria_id -> 'Futebol'
  mercado_id -> 'Total de Gols'
  linha_aposta -> 'Over 2.5'
```

---

## 🧪 Casos de Teste

### **Grupo 1: Apostas Básicas**
- [ ] Simples bookmaker ganha
- [ ] Simples bookmaker perde  
- [ ] Simples void/cancelled
- [ ] Múltipla 3 seleções ganha
- [ ] Múltipla 1 seleção perde (mata toda)

### **Grupo 2: Exchange**
- [ ] Back ganha com comissão
- [ ] Lay ganha (adversário perde)
- [ ] Lay perde (paga responsabilidade)
- [ ] Back/Lay com diferentes comissões por casa

### **Grupo 3: Freebets**
- [ ] Freebet simples ganha (só lucro)
- [ ] Freebet simples perde (R$ 0)
- [ ] Freebet múltipla com boost
- [ ] Cashout de freebet

### **Grupo 4: Saídas Múltiplas**
- [ ] Freebet parcial 50% + resultado final 50%
- [ ] 3 cashouts parciais (25%, 50%, 25%)
- [ ] Cashout total antes do final
- [ ] Combinação freebet + cashout + final

### **Grupo 5: Odds e Promoções**
- [ ] Múltipla com boost (+0.40 na odd)
- [ ] Múltipla com desconto (-0.20 na odd)
- [ ] Odd final diferente do produto das seleções

### **Grupo 6: Tipsters**
- [ ] Aposta seguindo tip com unidades variáveis
- [ ] Mudança de configuração mensal do tipster  
- [ ] ROI com desconto de assinatura
- [ ] Múltiplas apostas do mesmo tipster

### **Grupo 7: Contextuais**
- [ ] Apostas em diferentes campeonatos/países
- [ ] Modalidades: pre_live, live
- [ ] Períodos: FT, HT, 1Q, 2Q, etc
- [ ] Diferentes mercados por categoria

### **Grupo 8: Transações**
- [ ] Depósito em casa de aposta
- [ ] Saque de casa de aposta
- [ ] Registro automático de resultado
- [ ] Pagamento de assinatura de tipster

---

## 📈 Relatórios e Análises

### **Dashboards Disponíveis**

#### ROI por Casa
```sql
-- Comparar performance entre Bet365, Betfair, etc
-- Considerar comissões e freebets
```

#### Performance por Tipster  
```sql
-- ROI líquido (descontando assinaturas)
-- Taxa de acerto, strike rate
-- Unidades ganhas/perdidas
```

#### Análise de Estratégias
```sql
-- Apostas com saídas múltiplas vs. simples
-- Freebets vs. dinheiro real
-- Live vs. pré-live performance
```

#### Controle de Bankroll
```sql
-- Saldo por casa em tempo real
-- Projeção baseada em apostas pendentes
-- Histórico de depósitos/saques
```

---

## 🔄 Fluxos de Trabalho

### **1. Registro de Aposta Simples**
1. Criar registro em `apostas`
2. Criar registro em `selecoes_apostas` 
3. Sistema calcula automaticamente via trigger

### **2. Registro de Múltipla**
1. Criar registro em `apostas` (odd_final manual)
2. Criar N registros em `selecoes_apostas`
3. Sistema compara odd_final vs produto

### **3. Saída Parcial (Exchange)**
1. Criar registro em `saidas_apostas`
2. Atualizar stake_restante
3. Registrar transação correspondente

### **4. Finalização Completa**
1. Última saída com stake_restante=0
2. Atualizar resultado da aposta principal
3. Calcular ROI e estatísticas finais

---

## ⚠️ Regras de Negócio

### **Validações Obrigatórias**
- Soma de percentual_saida não pode exceder 100%
- Freebet: eh_freebet=true exige valor_freebet > 0
- Exchange: direcao_aposta obrigatória se tipo='exchange'
- Saídas: data_saida deve ser >= data_evento

### **Cálculos Automáticos**
- Retorno baseado em resultado + eh_freebet
- Comissão apenas para casas tipo 'exchange'
- Lucro em unidades baseado em unidade_valor
- ROI considerando freebets e saídas múltiplas

### **Integridade Referencial**
- Usuário só acessa suas próprias apostas (RLS)
- Casa de aposta vinculada ao usuário
- Saídas vinculadas à aposta específica

---

## 🚀 Extensibilidade

A modelagem suporta facilmente:
- Novos tipos de saída (hedge, trade, etc)
- Novos mercados e categorias
- Integração com APIs de casas
- Sistemas de alertas e notificações
- Machine learning para análise de padrões

**Status**: Modelagem completa e pronta para implementação.