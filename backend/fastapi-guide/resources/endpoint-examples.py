"""
FastAPI Endpoint Examples

Production-ready endpoint patterns for FastAPI applications.
Covers CRUD operations, pagination, filtering, and error handling.

Usage:
    from endpoint_examples import router
    app.include_router(router)
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ====================
# PYDANTIC MODELS
# ====================

class UserRole(str, Enum):
    """User roles"""
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"


class UserCreate(BaseModel):
    """Create user request"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern=r'^[a-zA-Z0-9_]+$')
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)


class UserUpdate(BaseModel):
    """Update user request"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)


class UserResponse(BaseModel):
    """User response"""
    id: int
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    role: UserRole
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    data: List[dict]
    total: int
    page: int
    limit: int
    pages: int


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: str
    version: str
    uptime_seconds: float


# ====================
# ROUTER SETUP
# ====================

router = APIRouter(prefix="/api", tags=["api"])


# ====================
# DEPENDENCIES
# ====================

async def get_db() -> AsyncSession:
    """Database session dependency"""
    # This is a placeholder - implement based on your database setup
    # See dependencies-examples.py for full implementation
    from app.core.database import async_session_maker

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
    """Get current authenticated user"""
    # Placeholder - implement JWT verification
    # See dependencies-examples.py for full implementation
    pass


async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# ====================
# HEALTH CHECK
# ====================

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check API health and uptime"
)
async def health_check():
    """Health check endpoint"""
    import time
    from app.core.config import settings

    return HealthResponse(
        status="ok",
        timestamp=datetime.utcnow().isoformat(),
        version=settings.VERSION,
        uptime_seconds=time.time() - start_time
    )


# ====================
# USER CRUD ENDPOINTS
# ====================

@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create user",
    description="Create a new user account"
)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new user.

    - **email**: User email address (must be unique)
    - **username**: Username (3-50 characters, alphanumeric and underscore)
    - **password**: Password (minimum 8 characters)
    - **first_name**: First name
    - **last_name**: Last name

    Returns the created user (without password).
    """
    # Check if email exists
    existing_user = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Check if username exists
    existing_username = await db.execute(
        select(User).where(User.username == user_data.username)
    )
    if existing_username.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken"
        )

    # Hash password
    from app.core.security import get_password_hash
    hashed_password = get_password_hash(user_data.password)

    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


@router.get(
    "/users",
    response_model=PaginatedResponse,
    summary="List users",
    description="Get paginated list of users with optional filtering"
)
async def list_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, max_length=100, description="Search by name or username"),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    db: AsyncSession = Depends(get_db)
):
    """
    List users with pagination and filtering.

    - **page**: Page number (starts at 1)
    - **limit**: Items per page (max 100)
    - **search**: Search query (searches name and username)
    - **role**: Filter by user role

    Returns paginated user list.
    """
    # Build query
    query = select(User)

    # Apply filters
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (User.first_name.ilike(search_filter)) |
            (User.last_name.ilike(search_filter)) |
            (User.username.ilike(search_filter))
        )

    if role:
        query = query.where(User.role == role)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # Apply pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    # Execute query
    result = await db.execute(query)
    users = result.scalars().all()

    return PaginatedResponse(
        data=[UserResponse.from_orm(user).dict() for user in users],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Get user",
    description="Get user by ID"
)
async def get_user(
    user_id: int = Path(..., ge=1, description="User ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific user by ID.

    - **user_id**: User ID

    Returns user details or 404 if not found.
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )

    return user


@router.patch(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Update user",
    description="Update user details"
)
async def update_user(
    user_id: int = Path(..., ge=1, description="User ID"),
    user_data: UserUpdate = ...,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user details.

    Users can only update their own profile unless they are admin.

    - **user_id**: User ID
    - **first_name**: New first name (optional)
    - **last_name**: New last name (optional)
    - **bio**: New bio (optional)

    Returns updated user.
    """
    # Get user
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )

    # Check permissions
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile"
        )

    # Update fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    user.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(user)

    return user


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user",
    description="Delete user (admin only)"
)
async def delete_user(
    user_id: int = Path(..., ge=1, description="User ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Delete a user (admin only).

    - **user_id**: User ID

    Returns 204 No Content on success.
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )

    await db.delete(user)
    await db.commit()

    return None


# ====================
# BATCH OPERATIONS
# ====================

@router.post(
    "/users/batch",
    response_model=List[UserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Batch create users",
    description="Create multiple users at once (admin only)"
)
async def batch_create_users(
    users_data: List[UserCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Create multiple users in a single request.

    Maximum 100 users per batch.
    """
    if len(users_data) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 100 users per batch"
        )

    from app.core.security import get_password_hash

    created_users = []

    for user_data in users_data:
        # Create user
        user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=get_password_hash(user_data.password),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
        )
        db.add(user)
        created_users.append(user)

    await db.commit()

    # Refresh all users
    for user in created_users:
        await db.refresh(user)

    return created_users


# ====================
# FILE UPLOAD
# ====================

from fastapi import UploadFile, File

@router.post(
    "/users/{user_id}/avatar",
    response_model=dict,
    summary="Upload avatar",
    description="Upload user avatar image"
)
async def upload_avatar(
    user_id: int = Path(..., ge=1),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload user avatar image.

    - Max file size: 5MB
    - Allowed types: JPEG, PNG, WebP

    Returns URL of uploaded image.
    """
    # Check permissions
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own avatar"
        )

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )

    # Validate file size (5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit"
        )

    # Save file (implement your storage logic)
    # This is a placeholder
    file_url = f"https://storage.example.com/avatars/{user_id}/{file.filename}"

    # Update user
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if user:
        user.avatar_url = file_url
        await db.commit()

    return {"url": file_url}


# ====================
# CUSTOM ACTIONS
# ====================

@router.post(
    "/users/{user_id}/activate",
    response_model=UserResponse,
    summary="Activate user",
    description="Activate user account (admin only)"
)
async def activate_user(
    user_id: int = Path(..., ge=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Activate a user account"""
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )

    user.is_active = True
    user.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(user)

    return user


@router.post(
    "/users/{user_id}/deactivate",
    response_model=UserResponse,
    summary="Deactivate user",
    description="Deactivate user account (admin only)"
)
async def deactivate_user(
    user_id: int = Path(..., ge=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Deactivate a user account"""
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )

    user.is_active = False
    user.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(user)

    return user


# ====================
# STATISTICS
# ====================

@router.get(
    "/users/stats",
    summary="User statistics",
    description="Get user statistics (admin only)"
)
async def get_user_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get user statistics"""
    # Total users
    total = await db.scalar(select(func.count(User.id)))

    # Active users
    active = await db.scalar(
        select(func.count(User.id)).where(User.is_active == True)
    )

    # Users by role
    role_counts = {}
    for role in UserRole:
        count = await db.scalar(
            select(func.count(User.id)).where(User.role == role)
        )
        role_counts[role.value] = count

    # Recent signups (last 7 days)
    from datetime import timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent = await db.scalar(
        select(func.count(User.id)).where(User.created_at >= week_ago)
    )

    return {
        "total": total,
        "active": active,
        "inactive": total - active,
        "by_role": role_counts,
        "recent_signups": recent
    }
