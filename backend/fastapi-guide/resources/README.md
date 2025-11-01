# FastAPI Guide Resources

Production-ready FastAPI patterns for building async Python APIs with type safety and auto-generated documentation.

---

## Contents

1. **endpoint-examples.py** - Complete CRUD endpoints with pagination, filtering, and batch operations
2. **middleware-examples.py** - Middleware for logging, auth, rate limiting, and security
3. **README.md** - This file

---

## Quick Start

### Installation

```bash
pip install fastapi uvicorn sqlalchemy asyncpg pydantic[email] python-jose[cryptography] passlib[bcrypt] structlog
```

### Basic Setup

```python
from fastapi import FastAPI
from middleware_examples import setup_middleware
from endpoint_examples import router

app = FastAPI(
    title="My API",
    version="1.0.0",
    description="Production-ready FastAPI application"
)

# Setup middleware
setup_middleware(app)

# Include routers
app.include_router(router)

# Run with:
# uvicorn main:app --reload
```

---

## Endpoint Examples

### Features

- ✅ Complete CRUD operations
- ✅ Pagination and filtering
- ✅ File uploads
- ✅ Batch operations
- ✅ Role-based access control
- ✅ Comprehensive error handling
- ✅ Auto-generated OpenAPI docs

### Available Endpoints

**Health Check:**
- `GET /api/health` - Health check with uptime

**User Management:**
- `POST /api/users` - Create user
- `GET /api/users` - List users (paginated)
- `GET /api/users/{id}` - Get user by ID
- `PATCH /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user (admin)
- `POST /api/users/batch` - Batch create users (admin)

**User Actions:**
- `POST /api/users/{id}/avatar` - Upload avatar
- `POST /api/users/{id}/activate` - Activate user (admin)
- `POST /api/users/{id}/deactivate` - Deactivate user (admin)

**Statistics:**
- `GET /api/users/stats` - User statistics (admin)

### Usage Examples

**Create User:**
```bash
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**List Users with Filtering:**
```bash
curl "http://localhost:8000/api/users?page=1&limit=20&search=john&role=user"
```

**Upload Avatar:**
```bash
curl -X POST http://localhost:8000/api/users/1/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@avatar.jpg"
```

---

## Middleware Examples

### Available Middleware

- **RequestLoggingMiddleware** - Structured logging for all requests
- **RateLimitMiddleware** - In-memory rate limiting (60 req/min default)
- **AuthenticationMiddleware** - JWT authentication for protected routes
- **SecurityHeadersMiddleware** - Security headers (HSTS, XSS protection, etc.)
- **TimingMiddleware** - Server-Timing header for performance monitoring
- **MaintenanceModeMiddleware** - Enable maintenance mode via env variable

### Setup

```python
from fastapi import FastAPI
from middleware_examples import setup_middleware

app = FastAPI()
setup_middleware(app)  # Adds all middleware in correct order
```

### Custom Configuration

```python
from middleware_examples import (
    RequestLoggingMiddleware,
    RateLimitMiddleware,
    SecurityHeadersMiddleware
)

# Add middleware manually with custom settings
app.add_middleware(RateLimitMiddleware, requests_per_minute=120)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
```

### Rate Limiting

```python
# Configure via setup
app.add_middleware(RateLimitMiddleware, requests_per_minute=100)

# Response when limit exceeded:
# 429 Too Many Requests
# {
#   "error": "Rate limit exceeded",
#   "detail": "Maximum 100 requests per minute"
# }
```

### Maintenance Mode

```bash
# Enable via environment variable
MAINTENANCE_MODE=true
MAINTENANCE_MESSAGE="Scheduled maintenance"

# Returns 503 for all requests (except /health)
```

---

## Error Handling

### Validation Errors

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "value is not a valid email address",
      "type": "value_error.email"
    }
  ],
  "timestamp": "2025-10-31T12:00:00.000Z"
}
```

### HTTP Exceptions

```python
from fastapi import HTTPException, status

# Not found
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="User not found"
)

# Forbidden
raise HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Admin access required"
)

# Conflict
raise HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail="Email already registered"
)
```

---

## Dependency Injection

### Database Session

```python
async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Use in endpoints
@router.get("/users")
async def list_users(db: AsyncSession = Depends(get_db)):
    users = await db.execute(select(User))
    return users.scalars().all()
```

### Authentication

```python
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    # Verify JWT and fetch user
    user_id = verify_token(token)
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

# Use in endpoints
@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user
```

### Role-Based Access

```python
async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Admin-only endpoint
@router.delete("/users/{id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin)
):
    # Only admins can access this
    ...
```

---

## Best Practices

### 1. Use Pydantic Models for Validation

```python
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)

@router.post("/users")
async def create_user(user: UserCreate):
    # user is automatically validated
    ...
```

### 2. Always Use Type Hints

```python
# ✅ Good
async def get_user(user_id: int, db: AsyncSession) -> UserResponse:
    ...

# ❌ Bad
async def get_user(user_id, db):
    ...
```

### 3. Use Async/Await Consistently

```python
# ✅ Good
@router.get("/users")
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()

# ❌ Bad (mixing sync and async)
@router.get("/users")
def list_users(db: Session = Depends(get_db)):  # Sync
    return db.query(User).all()
```

### 4. Handle Errors Gracefully

```python
@router.get("/users/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"User with ID {user_id} not found"
        )

    return user
```

### 5. Use Response Models

```python
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str

    class Config:
        from_attributes = True  # Pydantic v2

@router.get("/users/{id}", response_model=UserResponse)
async def get_user(user_id: int):
    # Response automatically validated and serialized
    ...
```

---

## Testing

### Setup

```bash
pip install pytest pytest-asyncio httpx
```

### Example Tests

```python
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_create_user():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/users", json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "SecurePass123!",
            "first_name": "Test",
            "last_name": "User"
        })

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_list_users():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/users?page=1&limit=10")

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "total" in data
```

---

## Additional Resources

- **FastAPI Documentation:** https://fastapi.tiangolo.com/
- **Pydantic Documentation:** https://docs.pydantic.dev/
- **SQLAlchemy Async:** https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- **Uvicorn:** https://www.uvicorn.org/

---

**Remember: Type everything, validate everything, document automatically.**

*Fast by design, safe by default, documented through code.*
