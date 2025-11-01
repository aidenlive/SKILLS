---
name: fastapi-guide
description: FastAPI microservices with async operations, Pydantic validation, and auto-generated docs. Use when building Python REST APIs, FastAPI applications, or async Python backends.
version: 1.0.0
---

# FastAPI Python Backend Guide

## Purpose

Define standards for FastAPI microservices with async operations, typed models, and auto-generated docs. Fast, typed, documented APIs with clean async patterns and strict validation.

## When to Use This Skill

- Building Python REST APIs or microservices
- Creating FastAPI applications with async patterns
- Implementing typed models with Pydantic
- Developing auto-documented APIs
- Working with async database operations

## Stack & Conventions

- Python ≥ 3.11 with type hints
- FastAPI with Pydantic v2 models
- SQLAlchemy (async) or asyncpg for PostgreSQL
- Linting: Ruff | Formatting: Black
- Testing: Pytest with pytest-asyncio
- Auto-generated OpenAPI docs at `/docs` and `/redoc`
- UTF-8 encoding, LF endings, 4-space indent

## Project Structure

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

- **Modular Routers:** One domain per file using `APIRouter`
- **Pydantic Validation:** All request/response validation with Pydantic models
- **Environment Config:** Pydantic Settings with `.env` support
- **Health Endpoint:** Add `/health` returning `{"status": "ok", "timestamp": ISO8601}`
- **Async First:** Prefer async functions; use scoped database sessions
- **HTTP Status Codes:** Return proper codes with detail messages
- **Error Handling:** Never expose internal errors; log with context using structlog
- **Type Hints:** All functions fully typed

## FastAPI Patterns

### Application Setup
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="API Service",
    description="Service description",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Router Pattern
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    users = await user_service.get_users(db, skip=skip, limit=limit)
    return users
```

### Pydantic Models
```python
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    created_at: datetime

    class Config:
        from_attributes = True
```

### Dependency Injection
```python
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    # Validate token and return user
    pass
```

## Async Database Operations

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)

async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Service layer
async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(
        select(User).where(User.email == email)
    )
    return result.scalar_one_or_none()
```

## Error Handling

```python
from fastapi import HTTPException, status

# Custom exception
class UserNotFoundError(Exception):
    pass

# Exception handler
@app.exception_handler(UserNotFoundError)
async def user_not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "User not found"}
    )

# Usage in route
@router.get("/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
```

## Development Commands

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Validation Checklist

```bash
ruff check .             # Linting
black .                  # Formatting
pytest                   # Run tests
pytest --cov=app         # Coverage report
mypy app                 # Type checking
```

## Deployment

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Requirements:
- `/health` endpoint for healthcheck
- Environment variables via secrets
- Enable CORS for allowed origins
- Configure async connection pooling

## Best Practices

- **Async All the Way:** Use async/await consistently
- **Database Sessions:** Always use scoped sessions with dependency injection
- **Validation First:** Validate at the edge (Pydantic models)
- **Type Everything:** Full type hints for better IDE support and error detection
- **Document Thoroughly:** OpenAPI auto-docs are your API contract
- **Security:** Use OAuth2, validate JWTs, hash passwords with bcrypt
- **Testing:** Write integration tests for all endpoints

## Philosophy

**Pydantic-driven validation, auto-generated docs, production-ready always.**

Typed, async, and documented by design. Fast by default, secure through types, scalable through async patterns.

## Additional Resources

See `resources/` directory for:
- Pydantic schema examples
- Middleware patterns
- Authentication setup
- Database async patterns
- Testing strategies
