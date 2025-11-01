"""
Comprehensive Pydantic Validation Models

Production-ready validation models for Python/FastAPI APIs.
Type-safe, composable, and comprehensive error messages.

Usage:
    pip install pydantic[email]
    from pydantic_models import UserCreate, validate_request
"""

from pydantic import (
    BaseModel,
    EmailStr,
    HttpUrl,
    Field,
    validator,
    root_validator,
    constr,
    conint,
)
from datetime import datetime, date
from typing import Optional, List, Literal, Union
from enum import Enum
import re


# ====================
# COMMON HELPERS
# ====================

class UUIDStr(BaseModel):
    """UUID validation"""
    id: str = Field(..., regex=r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')


# Strong password pattern
PASSWORD_PATTERN = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$'

# Username pattern
USERNAME_PATTERN = r'^[a-zA-Z0-9_]{3,30}$'

# Slug pattern
SLUG_PATTERN = r'^[a-z0-9]+(?:-[a-z0-9]+)*$'

# Phone pattern (E.164)
PHONE_PATTERN = r'^\+?[1-9]\d{1,14}$'


def validate_password(password: str) -> str:
    """Validate password strength"""
    if not re.match(PASSWORD_PATTERN, password):
        raise ValueError(
            'Password must be 8-128 characters and contain at least one uppercase letter, '
            'one lowercase letter, one number, and one special character'
        )
    return password


# ====================
# PAGINATION & FILTERING
# ====================

class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(1, ge=1, description='Page number')
    limit: int = Field(20, ge=1, le=100, description='Items per page')
    sort: Literal['asc', 'desc'] = Field('asc', description='Sort order')
    sort_by: Optional[str] = Field(None, description='Field to sort by')


class SearchParams(BaseModel):
    """Search and filter parameters"""
    q: Optional[constr(min_length=1, max_length=200)] = Field(None, description='Search query')
    tags: Optional[List[str]] = Field(None, description='Filter by tags')
    category: Optional[str] = Field(None, description='Filter by category')
    status: Optional[Literal['active', 'inactive', 'pending']] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

    @validator('date_to')
    def date_to_after_date_from(cls, v, values):
        if v and 'date_from' in values and values['date_from']:
            if v < values['date_from']:
                raise ValueError('date_to must be after date_from')
        return v


# ====================
# USER MANAGEMENT
# ====================

class UserRegistration(BaseModel):
    """User registration"""
    email: EmailStr
    username: constr(regex=USERNAME_PATTERN) = Field(..., description='Username (3-30 chars, alphanumeric and underscore)')
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str
    first_name: constr(min_length=1, max_length=50)
    last_name: constr(min_length=1, max_length=50)
    birth_date: Optional[date] = None
    accept_terms: bool = Field(..., description='Must accept terms and conditions')

    @validator('email')
    def email_lowercase(cls, v):
        return v.lower()

    @validator('username')
    def username_lowercase(cls, v):
        return v.lower()

    @validator('password')
    def password_strength(cls, v):
        return validate_password(v)

    @root_validator
    def passwords_match(cls, values):
        password = values.get('password')
        confirm = values.get('confirm_password')
        if password != confirm:
            raise ValueError('Passwords do not match')
        return values

    @validator('accept_terms')
    def must_accept_terms(cls, v):
        if not v:
            raise ValueError('You must accept the terms and conditions')
        return v


class UserLogin(BaseModel):
    """User login"""
    email: EmailStr
    password: str = Field(..., min_length=1)
    remember_me: bool = False

    @validator('email')
    def email_lowercase(cls, v):
        return v.lower()


class UserProfileUpdate(BaseModel):
    """User profile update"""
    first_name: Optional[constr(min_length=1, max_length=50)] = None
    last_name: Optional[constr(min_length=1, max_length=50)] = None
    bio: Optional[constr(max_length=500)] = None
    website: Optional[HttpUrl] = None
    location: Optional[constr(max_length=100)] = None
    avatar: Optional[HttpUrl] = None


class PasswordChange(BaseModel):
    """Password change"""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str

    @validator('new_password')
    def password_strength(cls, v):
        return validate_password(v)

    @root_validator
    def passwords_match(cls, values):
        new_pass = values.get('new_password')
        confirm = values.get('confirm_password')
        current = values.get('current_password')

        if new_pass != confirm:
            raise ValueError('Passwords do not match')

        if new_pass == current:
            raise ValueError('New password must be different from current password')

        return values


class PasswordResetRequest(BaseModel):
    """Password reset request"""
    email: EmailStr

    @validator('email')
    def email_lowercase(cls, v):
        return v.lower()


class PasswordReset(BaseModel):
    """Password reset"""
    token: str = Field(..., min_length=1)
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str

    @validator('password')
    def password_strength(cls, v):
        return validate_password(v)

    @root_validator
    def passwords_match(cls, values):
        password = values.get('password')
        confirm = values.get('confirm_password')
        if password != confirm:
            raise ValueError('Passwords do not match')
        return values


class EmailVerification(BaseModel):
    """Email verification"""
    token: str = Field(..., min_length=1)


# ====================
# USER RESPONSE MODELS
# ====================

class UserResponse(BaseModel):
    """User response (public)"""
    id: str
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    """Full user profile"""
    id: str
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    bio: Optional[str]
    website: Optional[str]
    location: Optional[str]
    avatar: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ====================
# CONTENT MANAGEMENT
# ====================

class PostStatus(str, Enum):
    """Post status"""
    DRAFT = 'draft'
    PUBLISHED = 'published'
    ARCHIVED = 'archived'


class PostCreate(BaseModel):
    """Create post"""
    title: constr(min_length=1, max_length=200)
    slug: Optional[constr(regex=SLUG_PATTERN)] = None
    content: constr(min_length=1)
    excerpt: Optional[constr(max_length=500)] = None
    cover_image: Optional[HttpUrl] = None
    tags: List[str] = Field(..., min_items=1, max_items=10)
    category_id: Optional[str] = None
    status: PostStatus = PostStatus.DRAFT
    published_at: Optional[datetime] = None


class PostUpdate(BaseModel):
    """Update post"""
    title: Optional[constr(min_length=1, max_length=200)] = None
    slug: Optional[constr(regex=SLUG_PATTERN)] = None
    content: Optional[constr(min_length=1)] = None
    excerpt: Optional[constr(max_length=500)] = None
    cover_image: Optional[HttpUrl] = None
    tags: Optional[List[str]] = Field(None, min_items=1, max_items=10)
    category_id: Optional[str] = None
    status: Optional[PostStatus] = None
    published_at: Optional[datetime] = None


class PostQuery(PaginationParams, SearchParams):
    """Query posts"""
    author_id: Optional[str] = None


class CommentCreate(BaseModel):
    """Create comment"""
    post_id: str
    content: constr(min_length=1, max_length=1000)
    parent_id: Optional[str] = None


class CategoryCreate(BaseModel):
    """Create category"""
    name: constr(min_length=1, max_length=100)
    slug: constr(regex=SLUG_PATTERN)
    description: Optional[constr(max_length=500)] = None
    parent_id: Optional[str] = None


# ====================
# FILE UPLOADS
# ====================

class FileUpload(BaseModel):
    """File upload metadata"""
    filename: constr(min_length=1, max_length=255)
    mimetype: str = Field(..., regex=r'^[a-z]+/[a-z0-9\-\+\.]+$')
    size: conint(gt=0, le=50 * 1024 * 1024)  # 50MB max


class ImageUpload(BaseModel):
    """Image upload metadata"""
    filename: constr(min_length=1, max_length=255)
    mimetype: Literal['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
    size: conint(gt=0, le=10 * 1024 * 1024)  # 10MB max
    width: Optional[conint(gt=0)] = None
    height: Optional[conint(gt=0)] = None


# ====================
# SETTINGS & PREFERENCES
# ====================

class NotificationSettings(BaseModel):
    """Notification preferences"""
    email: bool = True
    push: bool = False
    sms: bool = False


class PrivacySettings(BaseModel):
    """Privacy preferences"""
    profile_visibility: Literal['public', 'private', 'friends'] = 'public'
    show_email: bool = False
    show_online: bool = True


class UserSettings(BaseModel):
    """User settings"""
    theme: Literal['light', 'dark', 'auto'] = 'auto'
    language: constr(min_length=2, max_length=2) = 'en'
    timezone: str = 'UTC'
    notifications: NotificationSettings = NotificationSettings()
    privacy: PrivacySettings = PrivacySettings()


class ApiKeyCreate(BaseModel):
    """Create API key"""
    name: constr(min_length=1, max_length=100)
    expires_at: Optional[datetime] = None
    scopes: List[str] = Field(..., min_items=1)


class WebhookCreate(BaseModel):
    """Create webhook"""
    url: HttpUrl
    events: List[str] = Field(..., min_items=1)
    secret: Optional[constr(min_length=16)] = None
    active: bool = True


# ====================
# ADMIN & MODERATION
# ====================

class UserRole(str, Enum):
    """User roles"""
    USER = 'user'
    MODERATOR = 'moderator'
    ADMIN = 'admin'


class UserRoleUpdate(BaseModel):
    """Update user role"""
    user_id: str
    role: UserRole


class ModerationAction(str, Enum):
    """Moderation actions"""
    APPROVE = 'approve'
    REJECT = 'reject'
    FLAG = 'flag'
    REMOVE = 'remove'


class ContentModeration(BaseModel):
    """Moderate content"""
    content_id: str
    action: ModerationAction
    reason: Optional[constr(max_length=500)] = None
    notify_author: bool = True


class UserBan(BaseModel):
    """Ban user"""
    user_id: str
    reason: constr(min_length=1, max_length=500)
    expires_at: Optional[datetime] = None
    permanent: bool = False


# ====================
# RESPONSE MODELS
# ====================

class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    data: List[dict]
    total: int
    page: int
    limit: int
    pages: int

    @validator('pages', always=True)
    def calculate_pages(cls, v, values):
        total = values.get('total', 0)
        limit = values.get('limit', 20)
        return (total + limit - 1) // limit if limit > 0 else 0


class ErrorDetail(BaseModel):
    """Error detail"""
    field: str
    message: str


class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    details: Optional[List[ErrorDetail]] = None


class SuccessResponse(BaseModel):
    """Success response"""
    message: str
    data: Optional[dict] = None


# ====================
# VALIDATION HELPERS
# ====================

def validate_request(model: BaseModel, data: dict) -> BaseModel:
    """
    Validate request data against a Pydantic model

    Args:
        model: Pydantic model class
        data: Request data to validate

    Returns:
        Validated model instance

    Raises:
        ValidationError: If validation fails
    """
    return model(**data)


def format_validation_error(exc) -> ErrorResponse:
    """
    Format Pydantic ValidationError to structured response

    Args:
        exc: Pydantic ValidationError

    Returns:
        ErrorResponse with formatted details
    """
    details = []
    for error in exc.errors():
        details.append(
            ErrorDetail(
                field='.'.join(str(loc) for loc in error['loc']),
                message=error['msg']
            )
        )

    return ErrorResponse(
        error='Validation failed',
        details=details
    )


# ====================
# CUSTOM VALIDATORS
# ====================

def password_validator(v: str) -> str:
    """Reusable password validator"""
    return validate_password(v)


def email_lowercase_validator(v: str) -> str:
    """Normalize email to lowercase"""
    return v.lower()


def slug_generator(v: str) -> str:
    """Generate slug from title"""
    import re
    slug = v.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    slug = slug.strip('-')
    return slug


# ====================
# EXAMPLE USAGE
# ====================

"""
# FastAPI integration

from fastapi import FastAPI, HTTPException
from pydantic import ValidationError

app = FastAPI()

@app.post('/users/', response_model=UserResponse)
async def create_user(user: UserRegistration):
    # User is automatically validated by FastAPI
    try:
        # Create user in database
        created_user = await user_service.create(user)
        return created_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    error_response = format_validation_error(exc)
    return JSONResponse(
        status_code=400,
        content=error_response.dict()
    )


# Manual validation

try:
    user = UserRegistration(**request_data)
except ValidationError as e:
    error_response = format_validation_error(e)
    return error_response.dict(), 400
"""
