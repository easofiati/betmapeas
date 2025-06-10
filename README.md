# Especificação Funcional - BetMapEAS

## 🎯 Visão Geral

O **BetMapEAS** é uma plataforma web para **registro e análise de apostas esportivas**. Cada usuário possui acesso individual e vê somente suas próprias apostas. A plataforma oferece gráficos, estatísticas e segurança de nível profissional, com arquitetura moderna baseada em FastAPI, React, PostgreSQL e Docker.

---

## 🛠️ Funcionalidades

### 1. Cadastro e Autenticação

* Registro com email, username e senha
* Verificação de e-mail obrigatória
* Login com autenticação JWT
* Geração de tokens de acesso e refresh
* Recuperação e redefinição de senha com token
* Expiração configurável de tokens

### 2. Gestão de Apostas

* Registro de nova aposta:

  * Evento (ex: Flamengo x Vasco)
  * Data e hora
  * Tipo de aposta (ex: Over 2.5, 1X2, Handicap)
  * Odd
  * Valor apostado (stake)
  * Resultado: win / loss / void / pendente
  * Observações (opcional)
* Listagem paginada de apostas (do próprio usuário)
* Edição e exclusão (somente da própria aposta)
* Upload de comprovante (imagem - opcional)

### 3. Painel Pessoal (Dashboard)

* Resumo geral: lucro/prejuízo, acertos/erros, ROI
* Gráficos de performance
* Filtros por:

  * Período
  * Tipo de aposta
  * Campeonato/time
  * Resultado
* Exportação de histórico em CSV

### 4. Segurança e Controle de Acesso

* Autenticação baseada em JWT com refresh token
* Políticas de senha forte
* Proteção de endpoints com autorização
* Rate limiting em endpoints sensíveis
* UUIDs como identificadores únicos (para segurança)
* Logs estruturados e rastreamento de erros

### 5. Sistema de Administração (Admin)

* Gerenciar usuários (listar, banir, redefinir senha)
* Visualizar todas as apostas da base
* Criar ou editar tipos de aposta ou categorias
* Consultas administrativas para análises globais
* Acesso aos logs e métricas de performance

### 6. Monitoramento e Performance

* Logging estruturado em JSON
* Métricas de performance por endpoint
* Integração com Prometheus/Grafana (futuro)
* Healthchecks dos serviços Docker

### 7. Infraestrutura e Escalabilidade

* Arquitetura stateless
* Redis como cache (opcional)
* API REST documentada em `/docs` com OpenAPI
* Containers com Docker Compose:

  * Backend (FastAPI)
  * Frontend (React/Vite)
  * Banco de dados (PostgreSQL)
* Suporte a CI/CD (planejado)
* Testes automatizados unitários e de integração
* Ambiente de desenvolvimento com hot-reload

---

## 🔐 Tipos de Acesso e Permissões

| Funcionalidade                            | Usuário Padrão   | Admin     |
| ----------------------------------------- | ---------------- | --------- |
| Registro, login, recuperação de senha     | ✅                | ✅         |
| Criar, listar, editar e excluir apostas   | ✅ (somente suas) | ✅ (todas) |
| Ver gráficos e estatísticas pessoais      | ✅                | ✅         |
| Exportar histórico pessoal                | ✅                | ✅         |
| Ver apostas de outros usuários            | ❌                | ✅         |
| Gerenciar usuários (banir, resetar senha) | ❌                | ✅         |
| Criar/editar categorias/tipos             | ❌                | ✅         |
| Acessar logs e métricas                   | ❌                | ✅         |

---

## 📁 Estrutura do Backend (FastAPI)

```
app/
├── api/          # Endpoints da API
├── core/         # Configurações e utilitários (CORS, JWT, envs)
├── crud/         # Operações com o banco de dados
├── db/           # Configuração do banco e migrations
├── models/       # Tabelas SQLAlchemy com UUIDs
├── schemas/      # Schemas de entrada/saída (Pydantic)
├── services/     # Lógica de negócios
└── main.py       # Ponto de entrada da aplicação
```

---

## 🚀 Próximos Passos Sugeridos

1. Implementar autenticação completa (JWT, verificação de e-mail, recuperação)
2. Criar modelo de apostas com UUID vinculado ao usuário
3. Desenvolver CRUD de apostas com proteção por usuário
4. Criar dashboard com agregações básicas
5. Adicionar painel administrativo (acesso via flag `is_admin`)
6. Containerizar o projeto com Docker Compose
7. Configurar CI/CD e testes
