# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BetMapEAS** is a web platform for sports betting registration and analysis. It's designed to handle complex real-world betting scenarios including exchanges, freebets, partial cashouts, and tipster management.

**Architecture**: FastAPI backend + React/TypeScript frontend + PostgreSQL database

## Development Commands

### Frontend (React + Vite + TypeScript)
- `cd frontend && npm run dev` - Start development server
- `cd frontend && npm run build` - Production build
- `cd frontend && npm run lint` - Run ESLint
- `cd frontend && npm run preview` - Preview production build

### Backend (Python/FastAPI)
- Backend is not yet implemented (only placeholder main.py exists)
- When implemented, typical commands will be:
  - `python -m uvicorn app.main:app --reload` - Development server
  - `python -m pytest` - Run tests

### Stack Requirements (from .cursor/rules)
- **Backend**: Always Python (FastAPI by default)
- **Database**: PostgreSQL 13+ with Alembic migrations
- **Infrastructure**: Docker containers for each layer (backend/database/frontend)
- **Testing**: Minimum 90% code coverage, all tests must pass before commits
- **Code Quality**: Use pre-commit hooks (black, isort, mypy)

## Architecture Notes

### Database Design
- PostgreSQL with UUID primary keys throughout
- Row Level Security (RLS) for user data isolation
- Complex betting model supporting:
  - Simple/multiple bets with independent final odds
  - Freebets with different return calculations
  - Exchange back/lay with commission handling
  - Multiple exits (partial freebet + cashout + final result)

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for API state management
- **React Router** for navigation
- **Shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** for styling
- **React Hook Form** with Zod validation

### Key Technical Concepts
- **Multi-casa betting**: Users can register multiple betting houses (Bet365, Betfair, etc.)
- **Tipster management**: Dynamic configuration with monthly costs affecting ROI calculations
- **Complex exit strategies**: Single bet can have multiple partial exits and final results
- **Exchange vs Bookmaker**: Different calculation logic for commission handling

## Data Models (Key Tables)
- `usuarios` - User management with admin flags
- `casas_apostas` - Betting houses with type (bookmaker/exchange) and commission rates
- `apostas` - Main bets table with final odds and freebet flags
- `selecoes_apostas` - Individual selections within multiple bets
- `saidas_apostas` - Multiple exit points for complex strategies
- `tipsters` - Tipster configuration with monthly costs and default stakes

## Development Guidelines

### Code Style
- Frontend follows React/TypeScript best practices
- Use Shadcn/ui components over custom implementations
- Tailwind for all styling
- Form validation with React Hook Form + Zod

### Authentication & Security
- JWT authentication with refresh tokens
- PostgreSQL Row Level Security for data isolation
- UUID identifiers for security
- Admin flag-based authorization

### Business Logic Priorities
1. **Phase 1 MVP**: Basic authentication, betting houses, simple bets, minimal dashboard
2. **Phase 2**: Categories, markets, multiple bet selections, file uploads
3. **Phase 3**: Freebets, exchange functionality, commission calculations
4. **Phase 4**: Complex exit strategies, tipster management
5. **Phase 5**: Advanced analytics and mobile optimization

## Testing & Quality Requirements
- Run `npm run lint` in frontend directory before commits
- Backend testing commands TBD when FastAPI app is implemented
- Maintain 90% code coverage minimum
- All tests must pass before any commits
- Focus on betting calculation accuracy with comprehensive test fixtures

## Environment Management
- All sensitive data goes in `.env` file (never commit)
- Maintain `.env.example` with required variables
- Use Docker Compose for orchestration