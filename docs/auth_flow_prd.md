# PRD: Fluxo Completo de Autenticação e Registro de Usuário

## 1. Visão Geral

Implementar um fluxo de autenticação seguro e completo para a plataforma BetMapEAS, incluindo registro de novos usuários, verificação por e-mail, recuperação de senha e um período de trial automático.

## 2. Funcionalidades Requeridas

### 2.1. Registro de Novo Usuário

- **Interface:** A página de login deve conter um link ou botão para "Criar nova conta".
- **Formulário:** A página de registro deve solicitar `email` e `senha`.
- **Processo Backend:**
  - Ao submeter, o sistema cria um novo registro de usuário com `is_active=false` e `is_verified=false`.
  - Um token de verificação de e-mail, único e com tempo de expiração, deve ser gerado e salvo no registro do usuário.
  - O sistema deve definir uma data de expiração para um período de trial de 30 dias (`trial_expires_at`).
  - Um e-mail de boas-vindas contendo o link de verificação (com o token) deve ser enviado para o e-mail fornecido.

### 2.2. Verificação de E-mail

- **Interface:** O usuário clica no link recebido por e-mail, que o leva a uma página na aplicação.
- **Validação:** A página deve extrair o token da URL e enviá-lo para um endpoint de validação no backend.
- **Processo Backend:**
  - O backend verifica se o token é válido e não expirou.
  - Se válido, o usuário correspondente é atualizado para `is_active=true` e `is_verified=true`.
  - O token de verificação é invalidado (removido ou marcado como usado).
- **Feedback:** A interface deve informar ao usuário que a conta foi verificada com sucesso e que ele já pode fazer login.
- **Restrição de Acesso:** Usuários com `is_verified=false` não podem fazer login.

### 2.3. Recuperação de Senha

- **Interface:** A página de login deve ter um link de "Esqueci minha senha".
- **Solicitação:** Este link leva a uma página onde o usuário insere seu e-mail para solicitar a redefinição.
- **Processo Backend (Solicitação):**
  - O sistema gera um token de redefinição de senha com tempo de expiração.
  - Um e-mail com um link contendo este token é enviado ao usuário.
- **Interface (Redefinição):** O link do e-mail leva a uma página onde o usuário pode definir uma nova senha.
- **Processo Backend (Redefinição):**
  - O endpoint de redefinição valida o token e atualiza a senha do usuário.
  - O token de redefinição é invalidado.

### 2.4. Período de Trial

- Todo novo usuário registrado deve ter um campo `trial_expires_at` preenchido com a data e hora correspondente a 30 dias no futuro a partir do momento do registro.
- A lógica de restrição de acesso baseada no trial será implementada em uma fase futura, mas o campo deve ser populado agora.

## 3. Requisitos Técnicos

- **Backend:** FastAPI, SQLAlchemy, Alembic, Pydantic.
- **Frontend:** React, Vite, TypeScript.
- **Testes:** Testes unitários e de integração (Pytest) são obrigatórios para toda a nova lógica de backend.
- **Documentação:** O `README.md` e a pasta `docs/` devem ser atualizados.
- **Gestão de Tarefas:** O fluxo deve ser gerenciado pelo Task-Master.
- **Controle de Versão:** Commits devem ser feitos no GitHub ao final de cada tarefa principal concluída.
