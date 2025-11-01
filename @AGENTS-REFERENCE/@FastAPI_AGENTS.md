# AGENTS.md — FastAPI Python Backend

## Purpose

Defines standards for FastAPI microservices with async operations, typed models, and auto-generated docs.

**Goal:** fast, typed, documented APIs with clean async patterns and strict validation.

## Stack & Conventions

- Python ≥ 3.11 with type hints
- FastAPI with Pydantic v2 models
- SQLAlchemy (async) or asyncpg for PostgreSQL
- Linting: Ruff | Formatting: Black
- Testing: Pytest with pytest-asyncio
- Auto-generated OpenAPI docs at `/docs` and `/redoc`
- UTF-8 encoding, LF endings, 4-space indent

## Structure

```
/app
 ├─ main.py (FastAPI app instance)
 ├─ /routes (users.py, auth.py, health.py)
 ├─ /models (Pydantic schemas, SQLAlchemy tables)
 ├─ /services (business logic, domain operations)
 ├─ /core (config.py, dependencies.py, security.py)
 ├─ /utils (formatters, validators, helpers)
/tests
/docs
/alembic (database migrations)
```

## Authoring Rules

- Modular routers; one domain per file using `APIRouter`
- Use Pydantic models for all request/response validation
- Environment config via Pydantic Settings with `.env` support
- Add `/health` endpoint returning `{"status": "ok", "timestamp": ISO8601}`
- Prefer async functions; use scoped database sessions
- Return proper HTTP status codes with detail messages
- Never expose internal errors; log with context using structlog

## Agent Behavior

- Scoped edits only; preserve router structure and dependencies
- Keep async patterns consistent; avoid blocking operations
- Use dependency injection for database sessions and auth
- Update Pydantic models and tests with every endpoint change
- Comment intent behind complex queries or business logic

## Development

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Runs on `http://localhost:8000` with auto-reload.

Database migrations:

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Validation

```bash
ruff check .          # Linting
black .               # Formatting
pytest                # Run tests
pytest --cov=app      # Coverage report
mypy app              # Type checking
```

## Deployment

Build and run:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Coolify: Use Dockerfile or Nixpacks. Expose `PORT=8000`.

Required:

- `/health` endpoint for healthcheck
- Environment variables via secrets
- Enable CORS for allowed origins
- Configure async connection pooling

## Version Control

- **Branches:** main / feature/* / fix/* / docs/*
- **Commits:** imperative, one logical change per commit
- Include type validation and security audit before PR merge

## Philosophy

Typed, async, and documented by design.

**Pydantic-driven validation, auto-generated docs, production-ready always.**

Fast by default, secure through types, scalable through async patterns.